from rest_framework import viewsets
from .models import SystemMetric
from .serializers import SystemMetricSerializer

class SystemMetricViewSet(viewsets.ModelViewSet):
    queryset = SystemMetric.objects.all()
    serializer_class = SystemMetricSerializer
