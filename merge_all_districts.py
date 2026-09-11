import json
import glob
import os

districts_dir = "frontend/public/districts"
output_file = "frontend/public/tashkent_buildings.json"

all_features = []
seen_ids = set()
district_counts = {}

files = sorted(glob.glob(os.path.join(districts_dir, "*.json")))
print(f"Jami topilgan tuman fayllari: {len(files)}")

for f in files:
    d_name = os.path.splitext(os.path.basename(f))[0]
    with open(f, "r", encoding="utf-8") as fp:
        data = json.load(fp)
        feats = data.get("features", [])
        d_added = 0
        for feat in feats:
            f_id = feat.get("id") or feat.get("properties", {}).get("id")
            if f_id and f_id not in seen_ids:
                seen_ids.add(f_id)
                all_features.append(feat)
                d_added += 1
        district_counts[d_name] = len(feats)
        print(f"  {d_name:15}: {len(feats):6} bino (yangi qo'shildi: {d_added})")

print("=" * 50)
print(f"Barcha Toshkent shahri bo'yicha jami unikal binolar: {len(all_features)}")

fc = {
    "type": "FeatureCollection",
    "features": all_features
}

with open(output_file, "w", encoding="utf-8") as out:
    json.dump(fc, out)

size_mb = os.path.getsize(output_file) / (1024 * 1024)
print(f"Fayl saqlandi: {output_file} ({size_mb:.2f} MB)")