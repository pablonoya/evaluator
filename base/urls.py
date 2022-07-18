"""base URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings

from django.views.static import serve
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("evaluator/", include("evaluator.urls")),
    # re_path(
    #     r"^assets/(?P<path>.*)$",
    #     serve,
    #     {"document_root": settings.STATIC_ROOT / "assets"},
    # ),
    # re_path(
    #     r"^tinymce/(?P<path>.*)$",
    #     serve,
    #     {"document_root": settings.STATIC_ROOT / "tinymce"},
    # ),
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
    # Django serves staticfiles hack, don't include it in production!
]
