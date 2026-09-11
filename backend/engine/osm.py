import requests

def fetch_buildings_from_osm(south: float, west: float, north: float, east: float) -> list[dict]:
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json][timeout:25];
    (
      way["building"]({south},{west},{north},{east});
      relation["building"]({south},{west},{north},{east});
    );
    out geom;
    """
    headers = {'User-Agent': 'SunCheckApp/1.0 (contact@suncheck.uz)'}
    try:
        response = requests.post(overpass_url, data={'data': query}, headers=headers, timeout=30)
        if response.status_code != 200:
            return []
    except Exception:
        return []
        
    data = response.json()
    buildings = []
    
    for element in data.get('elements', []):
        if 'geometry' in element:
            coords = [[pt['lon'], pt['lat']] for pt in element['geometry']]
            if len(coords) < 3:
                continue
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            
            tags = element.get('tags', {})
            levels = float(tags.get('building:levels', 3))
            height = float(tags.get('height', levels * 3.0))
            
            buildings.append({
                'id': element['id'],
                'height': height,
                'tags': tags,
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [coords]
                }
            })
            
    return buildings
