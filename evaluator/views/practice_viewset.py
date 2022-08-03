from django.db.models import Exists, OuterRef, Sum

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from evaluator.models import Exercise, Practice, Submission, Task
from evaluator.serializers import PracticeSerializer


class PracticeViewSet(viewsets.ModelViewSet):
    serializer_class = PracticeSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["task__name", "exercise__name"]

    def get_queryset(self):
        user = self.request.user.id
        task_id = self.request.query_params.get("taskId")
        task = Task.objects.get(id=task_id)

        practice, _ = Practice.objects.get_or_create(task_id=task_id, student_id=user)

        # Assign exercises per topic
        exercises_count = task.assignment_set.aggregate(
            exercises_count=Sum("exercises_number")
        )["exercises_count"]

        if practice.exercises.count() < exercises_count:
            assignments = task.assignment_set.all()
            for assignment in assignments:
                exercises = Exercise.objects.filter(topics__in=[assignment.topic])

                if practice.exercises.count() > 0:
                    exercises = exercises.exclude(
                        id__in=practice.exercises.values_list("id", flat=True)
                    )

                exercises = exercises.order_by("?").distinct()[
                    : (assignment.exercises_number - practice.exercises.count())
                ]
                practice.exercises.add(*exercises)

        queryset = practice.exercises.annotate(
            submitted=Exists(
                Submission.objects.filter(
                    exercise=OuterRef("id"), user=user, task=task_id
                )
            )
        )

        return queryset
