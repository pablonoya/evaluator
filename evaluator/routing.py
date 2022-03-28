from django.urls import path
from . import consumers

ws_urlpatterns = [path("ws/submissions/", consumers.SubmissionConsumer.as_asgi())]
