from django.db.models import Exists, OuterRef
from django.contrib.auth.models import Group, User

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from evaluator.models import Exercise, Practice, Submission, Task
from evaluator.serializers import PracticeSerializer, SubmissionSerializer

# Create your views here.
class SubmissionView(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["exercise__name", "user__first_name", "user__last_name"]

    def get_queryset(self):
        user = User.objects.get(id=self.request.user.id)
        student_group = Group.objects.get(name="Alumnos")
        queryset = Submission.objects.all()

        if student_group in user.groups.all():
            queryset = queryset.filter(user=self.request.user.id).order_by(
                "task_id", "-evaluated_at"
            )

        return self.filter_queryset(queryset)

    def list(self, request, *args, **kwargs):
        submissions = self.get_queryset()
        page = self.paginate_queryset(submissions)

        if page is not None:
            serializer = SubmissionSerializer(
                page,
                many=True,
                fields=(
                    "id",
                    "task_name",
                    "exercise_name",
                    "student",
                    "status_name",
                    "score",
                    "datetime",
                ),
            )
            return self.get_paginated_response(serializer.data)

        return Response(submissions)

    def retrieve(self, request, pk=None):
        submission = self.get_queryset().get(id=pk)
        serializer = SubmissionSerializer(submission)

        return Response(serializer.data)


class PracticeView(viewsets.ModelViewSet):
    serializer_class = PracticeSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["exercise__name"]

    def get_queryset(self):
        task = self.request.query_params.get("taskId")
        user = self.request.query_params.get("userId")

        practice, created = Practice.objects.get_or_create(
            task_id=task, student_id=user
        )

        # Assign exercises per topic
        if created or not practice.exercises.exists():
            assignments = Task.objects.get(id=task).assignment_set.all()

            for assignment in assignments:
                exercises = (
                    Exercise.objects.filter(topics__in=[assignment.topic])
                    .order_by("?")
                    .distinct()
                )[: assignment.exercises_number]

                practice.exercises.add(*exercises)

        queryset = practice.exercises.annotate(
            submitted=Exists(
                Submission.objects.filter(exercise=OuterRef("id"), user=user, task=task)
            )
        )

        return queryset
