from django.contrib.auth.models import Group, User

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters

from evaluator.models import Submission
from evaluator.serializers import UserSerializer, SubmissionSerializer

# Create your views here.
class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "username", "student__cu"]

    def get_queryset(self):
        studentGroup = Group.objects.filter(name="Alumnos").first()

        return User.objects.filter(
            is_superuser=False, is_active=True, groups__in=[studentGroup.id]
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(methods=["GET"], detail=False, name="myself")
    def myself(self, request, *args, **kwargs):
        user = request.user

        return Response(data=self.serializer_class(user).data, status=200)

    @action(methods=["GET"], detail=True, name="generate-password")
    def generate_password(self, request, pk=None, *args, **kwargs):
        password = User.objects.make_random_password()

        user = self.get_queryset().get(id=pk)
        user.set_password(password)
        user.save(update_fields=["password"])

        return Response(password, status=200)

    @action(methods=["POST"], detail=False, name="update-profile")
    def update_profile(self, request, *args, **kwargs):
        user = request.user

        if not user.check_password(request.data.get("password")):
            return Response(
                "Contraseña incorrecta", status=status.HTTP_401_UNAUTHORIZED
            )

        if request.data.get("new_password", "") != "":
            user.set_password(request.data.get("new_password"))

        if (
            user.username != request.data.get("username")
            and User.objects.filter(username=request.data.get("username")).exists()
        ):
            return Response(
                "Nombre de usuario no disponible", status=status.HTTP_401_UNAUTHORIZED
            )

        user.first_name = request.data.get("first_name")
        user.last_name = request.data.get("last_name")
        user.username = request.data.get("username")
        user.student.cu = request.data.get("cu")

        user.save()
        return Response("Perfil actualizado")


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
            queryset = queryset.filter(user=self.request.user.id)

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
                    "exercise_name",
                    "student",
                    "status_name",
                    "date",
                    "time",
                    "evaluated_at",
                ),
            )
            return self.get_paginated_response(serializer.data)

        return Response(submissions)

    def retrieve(self, request, pk=None):
        submission = self.get_queryset().get(id=pk)
        serializer = SubmissionSerializer(submission)

        return Response(serializer.data)
