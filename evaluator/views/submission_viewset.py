from django.contrib.auth.models import Group, User

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from evaluator.models import Submission
from evaluator.serializers import SubmissionSerializer


class SubmissionView(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["exercise__name", "user__first_name", "user__last_name"]

    def get_queryset(self):
        queryset = Submission.objects.all()
        user = User.objects.get(id=self.request.user.id)
        student_group = Group.objects.get(name="Alumnos")

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
