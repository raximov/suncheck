import uuid
from django.contrib.gis.db import models
from apps.projects.models import Project

class InsolationAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class InsolationPoint(models.Model):
    analysis = models.ForeignKey(InsolationAnalysis, on_delete=models.CASCADE)
    geometry = models.PointField()
    value = models.FloatField()
