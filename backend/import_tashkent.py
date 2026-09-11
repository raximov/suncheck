import os
import sys
import time
import requests
import django

# Setup Django environment
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.gis.geos import GEOSGeometry, Polygon as GEOSPolygon
from apps.projects.models import Project
from apps.buildings.models import Building
from apps.accounts.models import User

print('=' * 60)
print('SunCheck — Tashkent City Full 3D Buildings Importer')
print('=' * 60)

# Ensure admin user and project exist
user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@suncheck.uz'})
project, _ = Project.objects.get_or_create(
    name='Tashkent City 3D',
    defaults={
        'owner': user,
        'center_lat': 41.3111,
        'center_lng': 69.2797,
        'zoom_level': 14
    }
)
print(f'Target Project: {project.name} (ID: {project.id})')

# Grid sectors covering Greater Tashkent
# Latitude: 41.20 to 41.38 (South to North)
# Longitude: 69.16 to 69.38 (West to East)
lat_steps = [
    (41.20, 41.25), # Sergeli / Bektemir / Yangihayot
    (41.25, 41.29), # Chilonzor / Yakkasaroy / Mirobod (South)
    (41.29, 41.33), # Central Tashkent (Amir Timur, Chorsu, Navoi)
    (41.33, 41.37), # Mirzo Ulug'bek / Yunusobod / Olmazor
    (41.37, 41.40), # Northern Tashkent / Qorasuv / TTZ
]

lng_steps = [
    (69.16, 69.21), # Uchtepa / Algoritm
    (69.21, 69.26), # Chilonzor / Shayxontohur
    (69.26, 69.31), # Yunusobod / Mirobod / Center
    (69.31, 69.36), # Mirzo Ulug'bek / Yashnobod
    (69.36, 69.40), # TTZ / Rohat / Dustlik
]

total_inserted = 0
total_skipped = 0
sector_idx = 0
total_sectors = len(lat_steps) * len(lng_steps)

overpass_url = 'https://overpass-api.de/api/interpreter'
headers = {'User-Agent': 'SunCheckApp/1.0 (contact@suncheck.uz)'}

for lat_min, lat_max in lat_steps:
    for lng_min, lng_max in lng_steps:
        sector_idx += 1
        print(f'\n[{sector_idx}/{total_sectors}] Fetching sector ({lat_min:.2f}, {lng_min:.2f}) to ({lat_max:.2f}, {lng_max:.2f})...')
        
        query = f'''
        [out:json][timeout:35];
        (
          way["building"]({lat_min},{lng_min},{lat_max},{lng_max});
        );
        out geom;
        '''
        
        try:
            resp = requests.post(overpass_url, data={'data': query}, headers=headers, timeout=40)
            if resp.status_code != 200:
                print(f'  Overpass returned status {resp.status_code}, waiting 5s...')
                time.sleep(5)
                continue
                
            data = resp.json()
            elements = data.get('elements', [])
            print(f'  Found {len(elements)} buildings in sector.')
            
            new_buildings = []
            existing_osm_ids = set(Building.objects.filter(project=project).values_list('osm_id', flat=True))
            
            for el in elements:
                osm_id = el['id']
                if osm_id in existing_osm_ids:
                    continue
                    
                geometry = el.get('geometry', [])
                if len(geometry) < 3:
                    continue
                    
                coords = [(pt['lon'], pt['lat']) for pt in geometry]
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                    
                tags = el.get('tags', {})
                name = tags.get('name') or tags.get('name:ru') or tags.get('name:uz') or ''
                
                # Height calculation
                levels = tags.get('building:levels')
                floors = None
                height = 14.0 # sensible urban default
                
                if levels:
                    try:
                        floors = int(float(levels))
                        height = float(floors * 3.3)
                    except:
                        pass
                elif 'height' in tags:
                    try:
                        height = float(tags['height'].replace('m', '').strip())
                    except:
                        pass
                else:
                    b_type = tags.get('building', '')
                    if b_type in ['apartments', 'residential']:
                        height = 16.5
                        floors = 5
                    elif b_type in ['commercial', 'office']:
                        height = 24.0
                        floors = 7
                    elif b_type in ['house', 'detached']:
                        height = 7.0
                        floors = 2
                    elif b_type in ['industrial', 'warehouse']:
                        height = 10.0
                        
                try:
                    # Create GEOS Polygon
                    geom = GEOSGeometry(f'SRID=4326;POLYGON(({", ".join(f"{c[0]} {c[1]}" for c in coords)}))')
                    if not geom.valid:
                        geom = geom.buffer(0)
                        
                    new_buildings.append(Building(
                        project=project,
                        source='osm',
                        osm_id=osm_id,
                        geometry=geom,
                        height=height,
                        floors=floors,
                        name=name,
                        properties=tags
                    ))
                except Exception as e:
                    total_skipped += 1
                    continue
                    
            if new_buildings:
                Building.objects.bulk_create(new_buildings, batch_size=500)
                total_inserted += len(new_buildings)
                print(f'  Saved {len(new_buildings)} buildings to PostGIS. Total in DB: {total_inserted}')
                
            # Polite rate limiting for Overpass API
            time.sleep(2)
            
        except Exception as err:
            print(f'  Error in sector {sector_idx}: {err}')
            time.sleep(3)

print('\n' + '=' * 60)
print(f'TASHKENT IMPORT COMPLETE!')
print(f'Total Buildings Inserted: {total_inserted}')
print(f'Total Skipped (Invalid): {total_skipped}')
print('=' * 60)
