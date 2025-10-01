from rest_framework import serializers
from .models import NetCDFDataset, NetCDFSlice

class NetCDFDatasetSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    slice_count = serializers.SerializerMethodField()

    class Meta:
        model = NetCDFDataset
        fields = '__all__'
        read_only_fields = ['id', 'upload_date', 'uploaded_by']

    def get_slice_count(self, obj):
        return obj.netcdfslice_set.count()

class NetCDFSliceSerializer(serializers.ModelSerializer):
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)

    class Meta:
        model = NetCDFSlice
        fields = '__all__'
        read_only_fields = ['id']
