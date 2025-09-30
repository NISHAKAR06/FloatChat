from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, ChatMessageViewSet
from .argo_chat_views import (
    upload_argo_file,
    process_enhanced_argo_chat, get_system_status,
    generate_visualization, batch_query_processing,
    unified_mcp_endpoint
)

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet)
router.register(r'messages', ChatMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # UNIFIED ARGO ARCHITECTURE - Both Human & AI Assistant Flows
    path('argo/query/', process_enhanced_argo_chat, name='argo_chat_query'),     # Human Query Flow (RAG)
    path('argo/mcp/', unified_mcp_endpoint, name='unified_mcp_endpoint'),        # AI Assistant Flow (MCP Bridge)
    path('argo/status/', get_system_status, name='argo_status'),                # System status
    path('argo/visualize/', generate_visualization, name='generate_visualization'), # Visualization
    path('argo/batch/', batch_query_processing, name='batch_query_processing'),     # Batch processing
    path('argo/upload/', upload_argo_file, name='argo_upload'),                      # File upload
]
