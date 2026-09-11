import uuid
from django.contrib.gis.db import models
from apps.projects.models import Project

class Building(models.Model):
    SOURCE_CHOICES = [
        ('osm', 'OpenStreetMap'),
        ('manual', 'Manual Entry'),
        ('import', 'Imported'),
        ('cadastral', 'Cadastral Data')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='buildings')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='osm')
    osm_id = models.BigIntegerField(null=True, blank=True)
    geometry = models.PolygonField(srid=4326)
    height = models.FloatField(null=True, blank=True)
    floors = models.IntegerField(null=True, blank=True)
    height_source = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=255, blank=True)
    properties = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
