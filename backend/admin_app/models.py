from django.db import models

class SystemMetric(models.Model):
    name = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}: {self.value}"
