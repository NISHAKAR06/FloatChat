from rest_framework import viewsets
from .models import Visualization
from .serializers import VisualizationSerializer

class VisualizationViewSet(viewsets.ModelViewSet):
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer
