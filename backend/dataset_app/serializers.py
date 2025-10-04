from rest_framework import serializers
from .models import NetCDFDataset, NetCDFValue, NetCDFEmbedding

class NetCDFDatasetSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    value_count = serializers.SerializerMethodField()
    embedding_count = serializers.SerializerMethodField()

    class Meta:
        model = NetCDFDataset
        fields = '__all__'
        read_only_fields = ['id', 'upload_time', 'uploaded_by']

    def get_value_count(self, obj):
        return obj.netcdfvalue_set.count()

    def get_embedding_count(self, obj):
        return obj.netcdfembedding_set.count()

class NetCDFValueSerializer(serializers.ModelSerializer):
    dataset_name = serializers.CharField(source='dataset.filename', read_only=True)

    class Meta:
        model = NetCDFValue
        fields = '__all__'
        read_only_fields = ['id']

class NetCDFEmbeddingSerializer(serializers.ModelSerializer):
    dataset_name = serializers.CharField(source='dataset.filename', read_only=True)

    class Meta:
        model = NetCDFEmbedding
        fields = '__all__'
        read_only_fields = ['id']
