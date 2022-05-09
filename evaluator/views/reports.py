from decimal import Decimal
from django.contrib.auth import get_user_model
from django.db.models import (
    Q,
    F,
    Count,
    Avg,
    Subquery,
    OuterRef,
    Func,
    DecimalField,
)

from django.db.models.functions import Coalesce

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from evaluator.models import Assignment, Practice, Submission


class ReportView(mixins.ListModelMixin, viewsets.GenericViewSet):
    @action(detail=False, methods=["GET"])
    def submissions_per_exercise(self, request):
        queryset = (
            Submission.objects.order_by("exercise__name")
            .values("exercise")
            .annotate(
                id=F("exercise__id"),
                accepted=Count("status", filter=Q(status=4)),
                tle=Count("status", filter=Q(status=3)),
                wrong=Count("status", filter=Q(status=5)),
                failed=Count("status", filter=Q(status=0)),
            )
            .values("id", "exercise__name", "failed", "accepted", "tle", "wrong")
        )

        page = self.paginate_queryset(queryset)

        if page is not None:
            return self.get_paginated_response(page)

        return Response(queryset)

    @action(detail=False, methods=["GET"])
    def score_per_student(self, request):
        queryset = (
            Submission.objects.filter(user__groups__name__in=["Alumnos"])
            .values("user")
            .annotate(
                id=F("user__id"),
                cu=F("user__student__cu"),
                first_name=F("user__first_name"),
                last_name=F("user__last_name"),
                score=Avg("score"),
            )
            .order_by("user__last_name")
        )

        page = self.paginate_queryset(queryset)

        if page is not None:
            return self.get_paginated_response(page)

        return Response(queryset)

    @action(detail=False, methods=["GET"])
    def score_per_task(self, request):
        User = get_user_model()
        students = User.objects.filter(groups__name__in=["Alumnos"])

        assignments = (
            Assignment.objects.filter(exercises_number__gt=0)
            .select_related("task")
            .distinct()
            .values("task__id", "task__name")
        )

        score_sum = lambda task_id: (
            Submission.objects.filter(task=task_id)
            .annotate(score_sum=Func("score", function="sum"))
            .values("score_sum")
        )

        exercises_count = lambda task_id: (
            Practice.objects.filter(student__id=OuterRef("id"), task=task_id)
            .annotate(exercises_count=Count("exercises"))
            .values("exercises_count")
        )

        average_score = lambda task_id: Coalesce(
            Subquery(score_sum(task_id)) / Subquery(exercises_count(task_id)),
            Decimal("0"),
            output_field=DecimalField(),
        )

        tasks_cols = {
            a["task__name"]: average_score(a["task__id"]) for a in assignments
        }

        queryset = (
            students.annotate(
                **tasks_cols,
            )
            .values(
                "id",
                "username",
                "first_name",
                "last_name",
                *[a["task__name"] for a in assignments],
            )
            .order_by("last_name")
        )

        page = self.paginate_queryset(queryset)

        if page is not None:
            return self.get_paginated_response(page)

        return Response(queryset)
