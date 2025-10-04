from django.contrib import admin
from .models import NetCDFDataset, NetCDFValue, NetCDFEmbedding

@admin.register(NetCDFDataset)
class NetCDFDatasetAdmin(admin.ModelAdmin):
    list_display = ['filename', 'uploaded_by', 'status', 'upload_time']
    list_filter = ['status', 'upload_time', 'uploaded_by']
    search_fields = ['filename']
    readonly_fields = ['id', 'upload_time']

    fieldsets = (
        ('Basic Information', {
            'fields': ('filename', 'uploaded_by', 'status')
        }),
        ('Dataset Information', {
            'fields': ('variables', 'dimensions'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'upload_time'),
            'classes': ('collapse',)
        }),
    )

@admin.register(NetCDFValue)
class NetCDFValueAdmin(admin.ModelAdmin):
    list_display = ['variable', 'time', 'lat', 'lon', 'value', 'dataset']
    list_filter = ['variable', 'time', 'dataset']
    search_fields = ['variable']
    readonly_fields = ['id']

    fieldsets = (
        ('Basic Information', {
            'fields': ('dataset', 'variable', 'time', 'value')
        }),
        ('Spatial Information', {
            'fields': ('lat', 'lon', 'depth')
        }),
        ('Metadata', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )

@admin.register(NetCDFEmbedding)
class NetCDFEmbeddingAdmin(admin.ModelAdmin):
    list_display = ['variable', 'region', 'time', 'dataset']
    list_filter = ['variable', 'region', 'time', 'dataset']
    search_fields = ['variable', 'region', 'summary']
    readonly_fields = ['id', 'embedding']

    fieldsets = (
        ('Basic Information', {
            'fields': ('dataset', 'variable', 'region', 'time')
        }),
        ('Content', {
            'fields': ('summary',)
        }),
        ('Embedding', {
            'fields': ('embedding',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )
