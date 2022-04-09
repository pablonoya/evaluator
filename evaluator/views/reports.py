from django.db.models import Q, F, Count, Avg

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from evaluator.models import Submission


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
