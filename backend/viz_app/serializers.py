from rest_framework import serializers
from .models import Visualization

class VisualizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visualization
        fields = ('id', 'user', 'dataset', 'name', 'description', 'config', 'created_at')
