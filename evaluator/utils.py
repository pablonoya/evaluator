import asyncio
from datetime import datetime
import json
import docker
import tarfile
from io import BytesIO

import pytz

from channels.layers import get_channel_layer
from evaluator.models import Exercise, Submission

# Statuses
FAILED = 0
REVIEW = 2
TLE = 3
ACCEPTED = 4
WRONG_ANSWER = 5


def code_runner(source_code, exercise_id, user_id, timelimit="1s"):
    # Create a container and compile the code
    container = prepare_container(source_code)
    res = container.exec_run("g++ code.cpp -o executable")

    # Get excercise
    exercise = Exercise.objects.get(id=exercise_id)

    # Compilation fails
    if res.exit_code == 1:
        asyncio.run(
            send_websocket_message("Fallido", exercise.id, user_id, exercise.name)
        )
        return FAILED

    # Review exercise
    Submission.objects.update_or_create(
        exercise=exercise_id,
        user=user_id,
        defaults={"score": 0, "status": 1},
    )
    asyncio.run(
        send_websocket_message("En Revisión", exercise.id, user_id, exercise.name)
    )

    output = []
    for test_case in exercise.input_examples.splitlines():
        # test every case within the time limit
        res = container.exec_run(
            f"timeout {timelimit} bash -c './executable <<< \"{test_case}\"'",
            tty=True,
        )

        if res.exit_code == 124:
            return TLE

        output.append(res.output.decode("utf-8"))

    container.remove(force=True)

    score = get_score(output, exercise.output_examples)

    # update submission
    Submission.objects.update_or_create(
        exercise=exercise_id,
        user=user_id,
        defaults={"score": score, "output": "\n".join(output)},
    )

    veredict = ACCEPTED if score > 0.5 else WRONG_ANSWER
    return veredict


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


def get_score(output, output_examples):
    score = 0
    output_examples_list = output_examples.splitlines()

    for i, example in enumerate(output_examples_list):
        if example.strip() == output[i].strip():
            score += 1

    score /= len(output_examples_list)
    return score


async def send_websocket_message(
    status, exercise_id, user_id, exercise_name="", datetime=datetime.now()
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
                    "user": user_id,
                    "exercise_name": exercise_name,
                    "date": datetime.strftime("%d-%m-%Y"),
                    "time": datetime.strftime("%H:%M:%S"),
                },
                ensure_ascii=False,
            ),
        },
    )


def utc_to_local(naive_datetime, tz=pytz.timezone("America/La_Paz")):
    return pytz.utc.localize(naive_datetime).astimezone(tz)
