from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Building
from .serializers import BuildingSerializer, BuildingListSerializer
from engine.osm import fetch_buildings_from_osm
from engine.geometry import polygon_to_shapely, shapely_to_geojson
from apps.projects.models import Project

class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()

    def get_serializer_class(self):
        if self.action == 'list' and not self.request.query_params.get('geojson'):
            return BuildingListSerializer
        return BuildingSerializer

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if project_id:
            return self.queryset.filter(project__id=project_id, project__owner=self.request.user)
        return self.queryset.filter(project__owner=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fetch_osm_buildings(request):
    project_id = request.data.get('project_id')
    bbox = request.data.get('bbox') # [south, west, north, east]
    if not project_id or not bbox:
        return Response({'error': 'Missing project_id or bbox'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    osm_buildings = fetch_buildings_from_osm(*bbox)
    saved = []
    
    from django.contrib.gis.geos import GEOSGeometry
    import json
    
    for b in osm_buildings:
        try:
            geom = GEOSGeometry(json.dumps(b['geometry']))
            building = Building.objects.create(
                project=project,
                source='osm',
                osm_id=b.get('id'),
                geometry=geom,
                height=b.get('height'),
                properties=b.get('tags', {})
            )
            saved.append(building.id)
        except Exception as e:
            continue
            
    return Response({'status': 'success', 'saved_count': len(saved)})
