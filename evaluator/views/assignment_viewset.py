from rest_framework import viewsets, filters

from evaluator.models import Assignment
from evaluator.serializers import AssignmentSerializer


class AssignmentView(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    queryset = Assignment.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
