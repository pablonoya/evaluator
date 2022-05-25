from django.db import router
from django.urls import path
from django.urls.conf import include

from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

app_name = "evaluator"

router = routers.DefaultRouter()

router.register(r"exercises", views.ExerciseView, "exercise")
router.register(r"testcases", views.TestcaseView, "testcase")
router.register(r"tasks", views.TaskView, "task")
router.register(r"topics", views.TopicView, "topic")
router.register(r"assignments", views.AssignmentView, "assignment")
router.register(r"users", views.UserView, "user")
router.register(r"submissions", views.SubmissionView, "submission")
router.register(r"practices", views.PracticeView, "practice")
router.register(r"reports", views.ReportView, "reports")

urlpatterns = [
    path("api/token/", TokenObtainPairView.as_view(), name="login"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/", include(router.urls)),
]
