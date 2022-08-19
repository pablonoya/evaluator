import pandas as pd
import yagmail
import traceback

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group, User
from django.template.loader import render_to_string

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

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

    @action(methods=["POST"], detail=False, name="search", permission_classes=[])
    def search(self, request):
        username = request.data.get("username")

        user = get_object_or_404(
            User, Q(username=username) | Q(email=username) | Q(student__phone=username)
        )

        if user.email:
            send_email(user, user.email)
            return Response({"email": censor_email(user.email)})

        return Response({"email": None}, status=404)

    @action(
        methods=["POST"], detail=False, name="recover_password", permission_classes=[]
    )
    def recover_password(self, request):
        username = request.data.get("username")

        user = get_object_or_404(
            User, Q(username=username) | Q(email=username) | Q(student__phone=username)
        )

        receiver = request.data.get("email") or user.email
        send_email(user, receiver)

        return Response({"detail": "Email sent"})

    @action(methods=["GET"], detail=False, name="myself")
    def myself(self, request, *args, **kwargs):
        user = request.user

        return Response(data=self.serializer_class(user).data, status=200)

    @action(methods=["GET"], detail=True, name="generate-password")
    def generate_password(self, request, pk=None, *args, **kwargs):
        user = self.get_queryset().get(id=pk)
        password = User.objects.make_random_password()

        user.set_password(password)
        user.save()

        return Response(password, status=200)

    @action(methods=["PUT"], detail=False, name="change_password")
    def change_password(self, request, *args, **kwargs):
        user = request.user

        user.set_password(request.data.get("password"))
        user.save(update_fields=["password"])

        return Response({"message": "Contraseña actualizada"}, status=200)

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
        if (
            user.email != request.data.get("email")
            and User.objects.filter(email=request.data.get("email")).exists()
        ):
            return Response("Email ya registrado", status=status.HTTP_401_UNAUTHORIZED)
        if (
            user.student.phone != request.data.get("phone")
            and User.objects.filter(student__phone=request.data.get("phone")).exists()
        ):
            return Response(
                "Celular ya registrado", status=status.HTTP_401_UNAUTHORIZED
            )

        user.first_name = request.data.get("first_name")
        user.last_name = request.data.get("last_name")
        user.username = request.data.get("username")
        user.email = request.data.get("email")
        user.save()

        if user.groups.filter(name="Alumnos").exists():
            user.student.cu = request.data.get("cu")
            user.student.phone = request.data.get("phone")
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


def send_email(user, receiver):
    try:
        yag = yagmail.SMTP(
            "evaluador.usfx@gmail.com", oauth2_file="./oauth2_creds.json"
        )
        token = RefreshToken.for_user(user).access_token

        contents = render_to_string(
            "password_recovery.html",
            context={
                "name": user.first_name or user.last_name or user.username,
                "token": str(token),
            },
        ).replace("\n", "")

        yag.send(
            to=receiver,
            subject="Restablecer contraseña",
            contents=contents,
            prettify_html=False,
        )

    except Exception as e:
        print(traceback.print_exception(e))


def censor_email(email):
    address, domain = email.split("@")
    address_length = len(address)

    if address_length <= 3:
        return "*" * address_length + f"@{domain}"

    return address[:3] + "*" * (address_length - 3) + f"@{domain}"
