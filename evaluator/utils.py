import asyncio
from datetime import datetime
from decimal import Decimal
import json
import docker
import tarfile
from io import BytesIO

import pytz

from channels.layers import get_channel_layer
from evaluator.models import Exercise, Submission

# Statuses
COMPILATION_ERROR = 0
REVIEW = 2
TLE = 3
ACCEPTED = 4
WRONG_ANSWER = 5


def code_runner(source_code, exercise_id, task_id, user_id, timelimit="1s"):
    # Create a container and compile the code
    container = prepare_container(source_code)
    res = container.exec_run("g++ code.cpp -o executable")

    # Get excercise name
    exercise = Exercise.objects.get(id=exercise_id)

    # Compilation fails
    if res.exit_code == 1:
        print(res.output)
        container.remove(force=True)
        asyncio.run(
            send_websocket_message(
                "Error de compilación", exercise_id, task_id, user_id, exercise.name
            )
        )
        return COMPILATION_ERROR

    # Review exercise
    try:
        submission, _ = Submission.objects.update_or_create(
            task_id=task_id,
            exercise_id=exercise_id,
            user_id=user_id,
            defaults={"score": 0, "status": REVIEW, "outputs": []},
        )
        asyncio.run(
            send_websocket_message(
                "En Revisión", exercise_id, task_id, user_id, exercise.name
            )
        )

        outputs = []
        for testcase in exercise.testcases.all():
            # test every case within the time limit
            res = container.exec_run(
                f"""timeout {timelimit} bash -c './executable <<< \"{testcase.input_example}\"'""",
                tty=True,
            )

            if res.exit_code == 124:
                return TLE

            outputs.append(res.output.decode("utf-8").replace("\r", ""))

        score = calculate_score(exercise.output_examples(), outputs)

        # update submission
        submission.score = score
        submission.outputs = outputs
        submission.save()

        veredict = ACCEPTED if score > 0.5 else WRONG_ANSWER
        return veredict

    except Exception as e:
        print(e)
        asyncio.run(
            send_websocket_message(
                "Error de compilación", exercise_id, task_id, user_id, exercise.name
            )
        )
        return COMPILATION_ERROR

    finally:
        container.remove(force=True)


def prepare_container(source_code):
    client = docker.from_env()
    container = client.containers.run("gcc", detach=True, tty=True)

    code = source_code.encode("utf-8")
    file = BytesIO(code)

    tarinfo = tarfile.TarInfo(name="code.cpp")
    tarinfo.size = len(code)

    with tarfile.TarFile("media/test.tar", "w") as tar:
        tar.addfile(tarinfo, file)

    container.put_archive(".", open("media/test.tar", "r").read())
    return container


def calculate_score(output_examples, outputs):
    score_total = Decimal("0")
    for example, output in zip(output_examples, outputs):
        score_case = Decimal("0")
        example_lines = example.strip().split("\n")
        output_lines = output.strip().split("\n")

        for example_line, output_line in zip(example_lines, output_lines):
            score_case += int(example_line == output_line)

        score_total += score_case / len(example_lines)

    score_total /= len(output_examples)
    return score_total * Decimal("100.0")


async def send_websocket_message(
    status, exercise_id, task_id, user_id, exercise_name="", datetime=datetime.now()
):
    channel_layer = get_channel_layer()

    await channel_layer.group_send(
        "submissions",
        {
            "type": "new_status",
            "content": json.dumps(
                {
                    "status_name": status,
                    "exercise": exercise_id,
                    "task": task_id,
                    "user": user_id,
                    "exercise_name": exercise_name,
                    "datetime": datetime.strftime("%d-%m-%Y %H:%M"),
                },
                ensure_ascii=False,
            ),
        },
    )


def utc_to_local(naive_datetime, tz=pytz.timezone("America/La_Paz")):
    return pytz.utc.localize(naive_datetime).astimezone(tz)
