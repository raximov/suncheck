import math
from shapely.geometry import Polygon, MultiPolygon
from shapely.geometry import shape, mapping

def meters_to_degrees(meters_x: float, meters_y: float, latitude: float) -> tuple[float, float]:
    r_earth = 6378137.0
    deg_y = (meters_y / r_earth) * (180 / math.pi)
    deg_x = (meters_x / (r_earth * math.cos(math.pi * latitude / 180))) * (180 / math.pi)
    return deg_x, deg_y

def polygon_to_shapely(geojson_coords: dict) -> Polygon:
    return shape(geojson_coords)

def shapely_to_geojson(geom) -> dict:
    return mapping(geom)
