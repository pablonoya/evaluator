from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from evaluator.models import Testcase
from evaluator.serializers import TestcaseSerializer


class TestcaseView(viewsets.ModelViewSet):
    serializer_class = TestcaseSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Testcase.objects.all()
