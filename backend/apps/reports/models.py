import uuid
from django.db import models
from apps.projects.models import Project

class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    file_path = models.FileField(upload_to='reports/')
    created_at = models.DateTimeField(auto_now_add=True)
