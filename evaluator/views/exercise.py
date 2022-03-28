import asyncio
from rest_framework import permissions

from rq.job import Retry
from django_rq.queues import get_queue
from django.contrib.auth.models import User


from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated

from evaluator.models import Exercise, Submission
from evaluator.serializers import ExerciseSerializer

from evaluator.utils import (
    code_runner,
    send_websocket_message,
    utc_to_local,
)


def report_success(job, connection, result, *args, **kwargs):
    submission = Submission.objects.filter(
        exercise=job.meta["exercise_id"],
        user=job.meta["user_id"],
    )
    submission.update(
        status=result,
        evaluated_at=utc_to_local(job.ended_at),
    )

    asyncio.run(
        send_websocket_message(
            submission.get().status_name(),
            job.meta["exercise_id"],
            job.meta["user_id"],
            job.meta["exercise_name"],
            utc_to_local(job.ended_at),
        )
    )


class ExerciseView(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = Exercise.objects.all()
        task = self.request.query_params.get("task")
        ids = self.request.query_params.get("ids")

        if task:
            queryset = queryset.filter(task_id=int(task))
        if ids:
            queryset = queryset.filter(id__in=ids.split(","))

        return queryset

    def retrieve(self, request, pk=None):
        queryset = self.get_queryset().get(id=pk)
        serializer = self.get_serializer(
            queryset,
            fields=[
                "id",
                "name",
                "description",
                "input_examples_min",
                "output_examples_min",
            ],
        )

        return Response(serializer.data)

    def list(self, request):
        is_teacher = request.user.groups.filter(name="Docente")

        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            args = {} if is_teacher else {"fields": ["id", "name", "topics"]}

            serializer = self.get_serializer(page, many=True, **args)
            return self.get_paginated_response(serializer.data)

        return queryset

    @action(detail=True, methods=["GET"], name="get_outputs")
    def get_outputs(self, request, pk=None):
        queryset = self.get_queryset().get(id=pk)
        return Response(queryset.output_examples)

    @action(detail=False, methods=["GET"], name="get_all_without_task")
    def get_all_without_task(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(task_id__isnull=True)

        topic_ids = self.request.query_params.get("topic_ids")

        if topic_ids:
            queryset = queryset.filter(topics__id__in=topic_ids.split(",")).distinct()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page, many=True, fields=["id", "name", "topics", "task"]
            )
            return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=["POST"], name="lottery")
    def lottery(self, request, *args, **kwargs):
        topic_ids = request.data["topic_ids"]
        quantity = request.data["quantity"]

        exercises = (
            self.get_queryset()
            .filter(task__isnull=True, topics__in=topic_ids)
            .order_by("?")
            .all()
        )

        if quantity is not None:
            exercises = exercises[: int(quantity)]
            exercises = sorted(exercises, key=lambda e: e.id)

        serializer = self.get_serializer(exercises, many=True)

        return Response(serializer.data, status=200)

    @action(detail=False, methods=["PUT"], name="update-task")
    def update_task(self, request, *args, **kwargs):
        exercise_ids = request.data["ids"]
        task_id = request.data["taskId"]

        Exercise.objects.filter(id__in=exercise_ids).update(task=task_id)
        return Response(data={"message": "Exercises updated"}, status=200)

    @action(detail=False, methods=["PUT"], name="release")
    def release(self, request, *args, **kwargs):
        exercise_id = request.data["id"]

        exercise = Exercise.objects.get(id=exercise_id)
        exercise.task = None
        exercise.save()

        return Response(data={"message": "Exercise released"}, status=200)

    @action(detail=False, methods=["POST"], name="submit")
    def submit(self, request, *args, **kwargs):
        exercise_id = request.data["id"]
        source_code = request.data["code"]
        user_id = request.user.id

        exercise = Exercise.objects.get(id=exercise_id)
        user = User.objects.get(id=user_id)

        # enqueue the submission
        default_queue = get_queue("default")
        job = default_queue.enqueue(
            code_runner,
            source_code,
            exercise_id,
            user_id,
            description=f"Submit {exercise.name} by {user.username}",
            retry=Retry(max=3, interval=60),
            on_success=report_success,
            meta={
                "exercise_id": exercise.id,
                "user_id": user_id,
                "exercise_name": exercise.name,
            },
        )

        if job.is_queued:
            Submission.objects.update_or_create(
                exercise=exercise,
                user=user,
                defaults={"score": 0, "source_code": source_code, "status": 1},
            )

            asyncio.run(
                send_websocket_message("En cola", exercise.id, user_id, exercise.name)
            )

            return Response(data={"message": "queued", "status": 200})

        return Response(data={"message": "error"}, status=500)
