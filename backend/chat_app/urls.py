from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet)
router.register(r'messages', ChatMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
