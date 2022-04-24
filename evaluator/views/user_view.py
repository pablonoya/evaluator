import pandas as pd

from django.contrib.auth.models import Group, User

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from evaluator.serializers import UserSerializer


class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "username", "student__cu"]

    def get_queryset(self):
        students_group = Group.objects.filter(name="Alumnos").first()

        return User.objects.filter(
            is_superuser=False, is_active=True, groups__in=[students_group.id]
        )

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
        user.email = request.data.get("email")
        user.student.cu = request.data.get("cu")
        user.student.phone = request.data.get("phone")

        user.save()
        user.student.save()

        return Response("Perfil actualizado")

    @action(methods=["POST"], detail=False, name="upload")
    def upload(self, request):
        file = request.data.get("file")
        if file is None:
            raise Exception("No se envió ningún archivo")

        students_group = Group.objects.filter(name="Alumnos").first()
        df = pd.read_excel(file, header=8)
        names = df["APELLIDOS PATERNO MATERNO, NOMBRES"].dropna()

        users = []

        for info in names:
            fullname, phone = info.split("(")

            # Encoding-decoding recovers latin characters
            paternal_last_name, maternal_last_name, *names = (
                fullname.encode("latin1").decode().split(" ")
            )

            last_name = f"{paternal_last_name} {maternal_last_name}".strip()
            first_name = " ".join(names).strip()

            user, _ = User.objects.update_or_create(
                first_name=first_name,
                last_name=last_name,
                defaults={
                    "username": (names[0] + paternal_last_name).lower(),
                    "is_active": True,
                },
            )
            user.groups.add(students_group)
            user.student.phone = phone.split(")")[0]
            user.student.save()

            users.append(user)

        serializer = UserSerializer(users, many=True)
        return Response(
            {"message": "File processed", "users": serializer.data}, status=201
        )
