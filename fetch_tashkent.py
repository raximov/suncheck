import json
import time
import requests

sectors = [
    ('central', 'Central (Amir Timur, Navoi, Broadway)', 41.29, 69.25, 41.33, 69.30),
    ('mirzo_ulugbek', 'Mirzo Ulugbek (IT Park, Buyuk Ipak Yoli)', 41.33, 69.30, 41.37, 69.36),
    ('yunusobod', 'Yunusobod (Minor, Bodomzor, Shahriston)', 41.33, 69.25, 41.38, 69.30),
    ('chilonzor', 'Chilonzor (Bunyodkor, Qatortol)', 41.26, 69.19, 41.30, 69.25),
    ('mirobod', 'Mirobod (Oybek, Vokzal, Nukus)', 41.27, 69.26, 41.31, 69.32),
    ('chorsu', 'Shayxontohur (Chorsu, Eski Shahar)', 41.31, 69.20, 41.35, 69.25),
]

headers = {'User-Agent': 'SunCheckApp/1.0 (contact@suncheck.uz)'}
overpass_url = 'https://overpass-api.de/api/interpreter'

all_features = []
seen_ids = set()

print('=' * 60)
print('Downloading Tashkent City 3D Buildings with Heights')
print('=' * 60)

for code, name, s, w, n, e in sectors:
    print(f'\nSector: {name} ({s}, {w}) to ({n}, {e})...')
    query = f'''
    [out:json][timeout:35];
    (
      way["building"]({s},{w},{n},{e});
    );
    out geom;
    '''
    
    try:
        r = requests.post(overpass_url, data={'data': query}, headers=headers, timeout=40)
        if r.status_code != 200:
            print(f'  Status {r.status_code}, skipping...')
            continue
            
        data = r.json()
        elements = data.get('elements', [])
        count = 0
        
        for el in elements:
            if el['id'] in seen_ids:
                continue
            seen_ids.add(el['id'])
            
            coords = [[pt['lon'], pt['lat']] for pt in el.get('geometry', [])]
            if len(coords) < 3:
                continue
            if coords[0] != coords[-1]:
                coords.append(coords[0])
                
            tags = el.get('tags', {})
            b_name = tags.get('name') or tags.get('name:ru') or tags.get('name:uz') or ''
            
            # Accurate height logic
            levels = tags.get('building:levels')
            if levels:
                try:
                    height = float(levels) * 3.3
                except:
                    height = 16.0
            elif 'height' in tags:
                try:
                    height = float(tags['height'].replace('m', '').strip())
                except:
                    height = 16.0
            else:
                b_type = tags.get('building', '')
                if b_type in ['apartments', 'residential']:
                    height = 18.0
                elif b_type in ['commercial', 'office', 'hotel']:
                    height = 28.0
                elif b_type in ['house', 'detached']:
                    height = 8.0
                else:
                    height = 14.0
                    
            all_features.append({
                'type': 'Feature',
                'id': el['id'],
                'properties': {
                    'id': str(el['id']),
                    'name': b_name,
                    'height': round(height, 1),
                    'levels': levels,
                    'district': code
                },
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [coords]
                }
            })
            count += 1
            
        print(f'  Loaded {count} buildings. Total collected: {len(all_features)}')
        time.sleep(1) # respectful API pause
    except Exception as err:
        print(f'  Error in {code}: {err}')

fc = {
    'type': 'FeatureCollection',
    'features': all_features
}

with open('frontend/public/tashkent_buildings.json', 'w', encoding='utf-8') as f:
    json.dump(fc, f, ensure_ascii=False)

print('\n' + '=' * 60)
print(f'SUCCESS: Saved {len(all_features)} 3D buildings to frontend/public/tashkent_buildings.json')
print('=' * 60)
