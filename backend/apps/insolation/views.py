import json
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from shapely.geometry import Point
from apps.projects.models import Project
from apps.buildings.models import Building
from engine.sun import get_sun_position, get_sunrise_sunset
from engine.shadow import compute_scene_shadows
from engine.geometry import polygon_to_shapely


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_insolation(request, project_id):
    """
    For given points, calculate sunlight hours on a given date.
    
    Body: {
        "date": "2026-09-10",
        "points": [{"lat": 41.31, "lng": 69.27}],
        "interval_minutes": 15
    }
    """
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)

    date_str = request.data.get('date')
    points_data = request.data.get('points', [])
    interval = int(request.data.get('interval_minutes', 15))

    if not date_str or not points_data:
        return Response({'error': 'Missing date or points'}, status=400)

    # Get sunrise/sunset for this location
    sun_times = get_sunrise_sunset(
        project.center_lat, project.center_lng, date_str
    )

    sunrise = sun_times.get('sunrise', '06:00')
    sunset = sun_times.get('sunset', '18:00')

    # Fetch all buildings in project
    buildings_qs = Building.objects.filter(project=project)
    b_data = []
    for b in buildings_qs:
        b_data.append({
            'id': str(b.id),
            'geometry': json.loads(b.geometry.json),
            'height': b.height or (b.floors or 3) * 3.0,
            'lat': b.geometry.centroid.y,
        })

    # For each point, sample sun positions and check shadows
    results = []
    for pt in points_data:
        point_geom = Point(pt['lng'], pt['lat'])
        sunlight_minutes = 0
        total_minutes = 0
        timeline = []

        # Generate time samples from sunrise to sunset
        from datetime import timedelta
        import pytz

        tz = pytz.timezone('Asia/Tashkent')
        fmt = '%Y-%m-%d %H:%M'
        current = datetime.strptime(f"{date_str} {sunrise}", fmt)
        current = tz.localize(current)
        end = datetime.strptime(f"{date_str} {sunset}", fmt)
        end = tz.localize(end)

        while current <= end:
            sun = get_sun_position(pt['lat'], pt['lng'], current)

            if sun['altitude'] > 0:
                shadows = compute_scene_shadows(
                    b_data, sun['azimuth'], sun['altitude']
                )
                combined = shadows.get('combined')
                is_shaded = False
                if combined is not None:
                    is_shaded = combined.contains(point_geom)

                total_minutes += interval
                if not is_shaded:
                    sunlight_minutes += interval

                timeline.append({
                    'time': current.strftime('%H:%M'),
                    'sunlit': not is_shaded,
                    'altitude': round(sun['altitude'], 1),
                    'azimuth': round(sun['azimuth'], 1),
                })

            current += timedelta(minutes=interval)

        sunlight_hours = sunlight_minutes / 60
        total_hours = total_minutes / 60
        shade_hours = (total_minutes - sunlight_minutes) / 60

        results.append({
            'point': {'lat': pt['lat'], 'lng': pt['lng']},
            'sunlight_hours': round(sunlight_hours, 2),
            'shade_hours': round(shade_hours, 2),
            'total_daylight_hours': round(total_hours, 2),
            'sunlight_percentage': round(
                (sunlight_minutes / total_minutes * 100) if total_minutes > 0 else 0, 1
            ),
            'compliant': sunlight_hours >= 2.5,  # SNiP minimum
            'timeline': timeline,
        })

    return Response({
        'date': date_str,
        'sunrise': sunrise,
        'sunset': sunset,
        'results': results,
    })
