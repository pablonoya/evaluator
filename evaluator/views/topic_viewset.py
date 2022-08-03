from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from evaluator.models import Topic
from evaluator.serializers import TopicSerializer


class TopicView(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    queryset = Topic.objects.all()
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
