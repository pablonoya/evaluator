import asyncio

from rq.job import Retry
from django_rq.queues import get_queue
from django.contrib.auth.models import User
from django.db.models import F


from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import filters

from evaluator.models import Exercise, Practice, Submission, Task
from evaluator.serializers import ExerciseSerializer

from evaluator.utils import (
    code_runner,
    send_websocket_message,
    utc_to_local,
)


def report_success(job, connection, result, *args, **kwargs):
    submission = Submission.objects.filter(
        exercise=job.meta["exercise_id"],
        task=job.meta["task_id"],
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
            job.meta["task_id"],
            job.meta["user_id"],
            job.meta["exercise_name"],
            utc_to_local(job.ended_at),
        )
    )


class ExerciseView(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        queryset = Exercise.objects.all()

        is_student = user.groups.filter(name="Alumnos").exists()
        if is_student:
            queryset = (
                queryset.filter(practice__student=user)
                .annotate(
                    task=F("practice__task__name"), task_id=F("practice__task__id")
                )
                .distinct()
            )

        task = self.request.query_params.get("task")
        if task:
            queryset = queryset.filter(task_id=int(task))

        queryset = self.filter_queryset(queryset)

        return queryset

    def retrieve(self, request, pk=None):
        queryset = self.get_queryset().get(id=pk)
        serializer = self.get_serializer(
            queryset,
            fields=[
                "id",
                "name",
                "topics",
                "description",
                "input_examples_min",
                "output_examples_min",
            ],
        )

        return Response(serializer.data)

    def list(self, request):
        queryset = self.get_queryset()

        fields = ["id", "name", "topics"]
        is_teacher = request.user.groups.filter(name="Docente").exists()

        if is_teacher:
            fields += ["description", "input_examples", "output_examples"]
        else:
            fields += ["task", "task_id", "practice_id"]

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, fields=fields)
            return self.get_paginated_response(serializer.data)

        return queryset

    @action(detail=True, methods=["GET"], name="get_outputs")
    def get_outputs(self, request, pk=None):
        queryset = self.get_queryset().get(id=pk)
        return Response(queryset.output_examples)

    @action(detail=False, methods=["PUT"], name="update-task")
    def update_task(self, request, *args, **kwargs):
        exercise_ids = request.data["ids"]
        task_id = request.data["taskId"]

        Exercise.objects.filter(id__in=exercise_ids).update(task=task_id)
        return Response(data={"message": "Exercises updated"}, status=200)

    @action(detail=False, methods=["POST"], name="submit")
    def submit(self, request, *args, **kwargs):
        exercise_id = request.data["id"]
        task_id = request.data["task_id"]
        source_code = request.data["code"]

        user_id = request.user.id

        exercise = Exercise.objects.get(id=exercise_id)
        task = Task.objects.get(id=task_id)
        user = User.objects.get(id=user_id)

        # enqueue the submission
        queue_params = {
            "description": f"Submit {exercise.name} by {user.username} for {task.name}",
            "retry": Retry(max=3, interval=60),
            "on_success": report_success,
            "meta": {
                "exercise_id": exercise_id,
                "task_id": task_id,
                "user_id": user_id,
                "exercise_name": exercise.name,
            },
        }

        default_queue = get_queue("default")
        job = default_queue.enqueue(
            code_runner, source_code, exercise_id, task_id, user_id, **queue_params
        )

        if job.is_queued:
            Submission.objects.update_or_create(
                exercise=exercise,
                task_id=task_id,
                user=user,
                defaults={"score": 0, "source_code": source_code, "status": 1},
            )

            asyncio.run(
                send_websocket_message(
                    "En cola", exercise_id, task_id, user_id, exercise.name
                )
            )

            return Response(data={"message": "queued", "status": 200})

        return Response(data={"message": "error"}, status=500)
