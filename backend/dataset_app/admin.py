from django.contrib import admin
from .models import NetCDFDataset, NetCDFSlice

@admin.register(NetCDFDataset)
class NetCDFDatasetAdmin(admin.ModelAdmin):
    list_display = ['name', 'uploaded_by', 'status', 'upload_date', 'file_size']
    list_filter = ['status', 'upload_date', 'uploaded_by']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'upload_date', 'file_size']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'uploaded_by')
        }),
        ('File Information', {
            'fields': ('file_path', 'file_size', 'status')
        }),
        ('Coverage Information', {
            'fields': ('variable_names', 'time_coverage', 'spatial_coverage'),
            'classes': ('collapse',)
        }),
        ('Error Information', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'upload_date'),
            'classes': ('collapse',)
        }),
    )

@admin.register(NetCDFSlice)
class NetCDFSliceAdmin(admin.ModelAdmin):
    list_display = ['variable', 'region', 'time', 'depth', 'dataset']
    list_filter = ['variable', 'region', 'time', 'dataset']
    search_fields = ['variable', 'region', 'summary']
    readonly_fields = ['id', 'embedding']

    fieldsets = (
        ('Basic Information', {
            'fields': ('dataset', 'variable', 'region', 'time', 'depth')
        }),
        ('Spatial Coverage', {
            'fields': ('lat_min', 'lat_max', 'lon_min', 'lon_max')
        }),
        ('Data', {
            'fields': ('slice_data', 'summary')
        }),
        ('Embedding', {
            'fields': ('embedding',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'source_file'),
            'classes': ('collapse',)
        }),
    )
