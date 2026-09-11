import json
import os

with open('frontend/public/tashkent_buildings.json', 'r', encoding='utf-8') as f:
    fc = json.load(f)

districts_dir = 'frontend/public/districts'
os.makedirs(districts_dir, exist_ok=True)

district_buckets = {}
for feat in fc.get('features', []):
    d = feat['properties'].get('district', 'other')
    if d not in district_buckets:
        district_buckets[d] = []
    district_buckets[d].append(feat)

print('Splitting by district:')
for d, feats in district_buckets.items():
    path = os.path.join(districts_dir, f'{d}.json')
    with open(path, 'w', encoding='utf-8') as out:
        json.dump({'type': 'FeatureCollection', 'features': feats}, out, ensure_ascii=False)
    print(f' - {d}.json: {len(feats)} buildings')

print('Done!')
