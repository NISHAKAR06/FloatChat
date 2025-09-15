from rest_framework import serializers
from .models import SystemMetric

class SystemMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemMetric
        fields = ('id', 'name', 'value', 'timestamp')
