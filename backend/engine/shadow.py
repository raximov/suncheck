import math
from shapely.geometry import Polygon, MultiPolygon, mapping
from shapely.ops import unary_union
from shapely.validation import make_valid
from .geometry import meters_to_degrees, polygon_to_shapely, shapely_to_geojson


def project_building_shadow(
    polygon: Polygon,
    height: float,
    sun_azimuth: float,
    sun_altitude: float,
    building_lat: float,
) -> Polygon | None:
    if sun_altitude <= 0:
        return None
    if height <= 0:
        return polygon

    shadow_length = height / math.tan(math.radians(sun_altitude))
    shadow_azimuth_rad = math.radians(sun_azimuth)

    # Shadow falls OPPOSITE to sun direction
    # Azimuth: 0=North, 90=East (clockwise). x=East(+), y=North(+)
    dx_meters = -shadow_length * math.sin(shadow_azimuth_rad)
    dy_meters = -shadow_length * math.cos(shadow_azimuth_rad)

    dx_deg, dy_deg = meters_to_degrees(dx_meters, dy_meters, building_lat)

    coords = list(polygon.exterior.coords[:-1])
    n = len(coords)
    if n < 3:
        return polygon

    shadow_coords = [(x + dx_deg, y + dy_deg) for x, y in coords]

    # Build trapezoids for each edge, then union with footprint
    parts = [polygon]
    for i in range(n):
        j = (i + 1) % n
        quad = Polygon([
            coords[i], coords[j],
            shadow_coords[j], shadow_coords[i],
            coords[i],
        ])
        if quad.is_valid and quad.area > 0:
            parts.append(quad)
        else:
            fixed = make_valid(quad)
            if fixed.area > 0:
                parts.append(fixed)

    shadow = unary_union(parts)
    if not shadow.is_valid:
        shadow = make_valid(shadow)
    return shadow


def compute_scene_shadows(
    buildings: list[dict], sun_azimuth: float, sun_altitude: float
) -> dict:
    if sun_altitude <= 0:
        return {'individual': [], 'combined': None}

    individual = []
    shadow_polys = []

    for b in buildings:
        geom = b['geometry']
        poly = polygon_to_shapely(geom) if isinstance(geom, dict) else geom
        height = b.get('height', 10.0)
        lat = b.get('lat', poly.centroid.y)

        shadow = project_building_shadow(poly, height, sun_azimuth, sun_altitude, lat)
        if shadow is not None:
            individual.append({'id': b['id'], 'shadow': shadow})
            shadow_polys.append(shadow)

    combined = unary_union(shadow_polys) if shadow_polys else None
    return {'individual': individual, 'combined': combined}


def shadows_to_geojson(shadows: dict) -> dict:
    features = []

    for item in shadows.get('individual', []):
        shadow = item['shadow']
        if shadow is None:
            continue
        if shadow.geom_type == 'Polygon':
            features.append({
                'type': 'Feature',
                'geometry': shapely_to_geojson(shadow),
                'properties': {'type': 'building_shadow', 'building_id': item['id']},
            })
        elif shadow.geom_type == 'MultiPolygon':
            for poly in shadow.geoms:
                features.append({
                    'type': 'Feature',
                    'geometry': shapely_to_geojson(poly),
                    'properties': {'type': 'building_shadow', 'building_id': item['id']},
                })

    combined = shadows.get('combined')
    if combined is not None:
        if combined.geom_type == 'Polygon':
            features.append({
                'type': 'Feature',
                'geometry': shapely_to_geojson(combined),
                'properties': {'type': 'combined_shadow'},
            })
        elif combined.geom_type == 'MultiPolygon':
            for poly in combined.geoms:
                features.append({
                    'type': 'Feature',
                    'geometry': shapely_to_geojson(poly),
                    'properties': {'type': 'combined_shadow'},
                })

    return {'type': 'FeatureCollection', 'features': features}
