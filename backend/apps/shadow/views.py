import json
from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.projects.models import Project
from apps.buildings.models import Building
from engine.sun import get_sun_position, get_sun_positions_range
from engine.shadow import compute_scene_shadows, shadows_to_geojson

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_shadow(request, project_id):
    date_str = request.data.get('date')
    time_str = request.data.get('time')
    
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)
        
    dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
    sun_pos = get_sun_position(project.center_lat, project.center_lng, dt)
    
    buildings = Building.objects.filter(project=project)
    b_data = []
    for b in buildings:
        b_data.append({
            'id': str(b.id),
            'geometry': json.loads(b.geometry.json),
            'height': b.height or 10.0,
            'lat': b.geometry.centroid.y
        })
        
    shadows = compute_scene_shadows(b_data, sun_pos['azimuth'], sun_pos['altitude'])
    geojson = shadows_to_geojson(shadows)
    
    return Response(geojson)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def animate_shadow(request, project_id):
    date_str = request.data.get('date')
    time_start_str = request.data.get('time_start')
    time_end_str = request.data.get('time_end')
    interval = int(request.data.get('interval', 60))
    
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)
        
    sun_positions = get_sun_positions_range(
        project.center_lat, project.center_lng, date_str, time_start_str, time_end_str, interval
    )
    
    buildings = Building.objects.filter(project=project)
    b_data = []
    for b in buildings:
        b_data.append({
            'id': str(b.id),
            'geometry': json.loads(b.geometry.json),
            'height': b.height or 10.0,
            'lat': b.geometry.centroid.y
        })
        
    frames = []
    for pos in sun_positions:
        if pos['altitude'] <= 0:
            continue
        shadows = compute_scene_shadows(b_data, pos['azimuth'], pos['altitude'])
        frames.append({
            'timestamp': pos['time'],
            'shadows': shadows_to_geojson(shadows)
        })
        
    return Response({'frames': frames})
