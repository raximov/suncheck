import json
import time
import requests

mirrors = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass-api.de/api/interpreter',
]

remaining_sectors = [
    ('central', 'Central (Amir Timur, Navoi, Broadway)', 41.29, 69.25, 41.33, 69.30),
    ('chilonzor', 'Chilonzor (Bunyodkor, Qatortol)', 41.26, 69.19, 41.30, 69.25),
    ('mirobod', 'Mirobod (Oybek, Vokzal, Nukus)', 41.27, 69.26, 41.31, 69.32),
    ('chorsu', 'Shayxontohur (Chorsu, Eski Shahar)', 41.31, 69.20, 41.35, 69.25),
    ('sergeli', 'Sergeli / Yangihayot', 41.20, 41.25, 69.18, 69.25),
]

# Load existing 29,340 buildings
with open('frontend/public/tashkent_buildings.json', 'r', encoding='utf-8') as f:
    fc = json.load(f)

existing_features = fc.get('features', [])
seen_ids = set(f['id'] for f in existing_features)
print(f'Starting with {len(existing_features)} existing buildings.')

headers = {'User-Agent': 'SunCheckApp/1.0 (contact@suncheck.uz)'}

for idx, (code, name, s, w, n, e) in enumerate(remaining_sectors):
    url = mirrors[idx % len(mirrors)]
    print(f'\nFetching {name} from mirror {url}...')
    query = f'''
    [out:json][timeout:45];
    (
      way["building"]({s},{w},{n},{e});
    );
    out geom;
    '''
    
    for attempt in range(3):
        try:
            r = requests.post(url, data={'data': query}, headers=headers, timeout=50)
            if r.status_code == 200:
                data = r.json()
                elements = data.get('elements', [])
                added = 0
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
                        elif b_type in ['commercial', 'office']:
                            height = 26.0
                        elif b_type in ['house', 'detached']:
                            height = 8.0
                        else:
                            height = 14.0
                            
                    existing_features.append({
                        'type': 'Feature',
                        'id': el['id'],
                        'properties': {
                            'id': str(el['id']),
                            'name': tags.get('name') or tags.get('name:ru') or tags.get('name:uz') or '',
                            'height': round(height, 1),
                            'levels': levels,
                            'district': code
                        },
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [coords]
                        }
                    })
                    added += 1
                print(f'  Successfully added {added} buildings. Total: {len(existing_features)}')
                break
            else:
                print(f'  Attempt {attempt+1} got status {r.status_code}, rotating mirror...')
                url = mirrors[(idx + attempt + 1) % len(mirrors)]
                time.sleep(3)
        except Exception as err:
            print(f'  Attempt {attempt+1} failed: {err}')
            url = mirrors[(idx + attempt + 1) % len(mirrors)]
            time.sleep(3)
            
    time.sleep(2)

fc['features'] = existing_features
with open('frontend/public/tashkent_buildings.json', 'w', encoding='utf-8') as f:
    json.dump(fc, f, ensure_ascii=False)

print('\n' + '=' * 60)
print(f'FINAL TOTAL: {len(existing_features)} 3D BUILDINGS IN TASHKENT!')
print('=' * 60)
