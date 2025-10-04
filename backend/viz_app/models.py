from django.db import models
from auth_app.models import CustomUser
from dataset_app.models import NetCDFDataset

class Visualization(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    dataset = models.ForeignKey(NetCDFDataset, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    config = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
