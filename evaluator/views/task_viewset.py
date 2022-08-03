from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from evaluator.models import Task, Assignment
from evaluator.serializers import TaskSerializer


class TaskView(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]

    def get_queryset(self):
        if self.request.user.groups.filter(name="Alumnos"):
            return Task.objects.filter(assignment__exercises_number__gt=0).distinct()
        return Task.objects.all()

    @action(detail=True, methods=["PUT"], name="release")
    def release(self, request, pk, *args, **kwargs):
        assignment = request.data["assignment"]

        task = Task.objects.get(id=pk)
        task.assignment_set.get(id=assignment).delete()

        return Response(data={"message": "Assignment released"}, status=200)

    @action(detail=False, methods=["GET"])
    def get_all_with_exercises(self, request):
        queryset = (
            Assignment.objects.filter(exercises_number__gt=0)
            .select_related("task")
            .distinct()
            .values_list("task__name", flat=True)
        )

        return Response(queryset)
