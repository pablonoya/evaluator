from django.db.models import Q
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthBackend:
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to fetch the user by searching the username or email field
            user = User.objects.get(
                Q(username=username) | Q(email=username) | Q(student__phone=username)
            )
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a non-existing user (#20760).
            User().set_password(password)
