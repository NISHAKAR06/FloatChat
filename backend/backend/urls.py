from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("auth_app.urls")),
    path("api/admin/", include("admin_app.urls")),
    path("api/datasets/", include("dataset_app.urls")),
    path("api/viz/", include("viz_app.urls")),
    # path("api/jobs/", include("jobs_app.urls")),
    path("api/chat/", include("chat_app.urls")),
]
