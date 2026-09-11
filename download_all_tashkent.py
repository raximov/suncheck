import json
import time
import os
import sys
import requests

mirrors = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter"
]

new_districts = [
    ("yashnobod", "Yashnobod", 41.27, 69.30, 41.33, 69.38),
    ("sergeli", "Sergeli", 41.20, 69.19, 41.26, 69.26),
    ("yangihayot", "Yangihayot", 41.17, 69.18, 41.23, 69.25),
    ("uchtepa", "Uchtepa", 41.27, 69.14, 41.32, 69.20),
    ("olmazor", "Olmazor", 41.33, 69.18, 41.39, 69.25),
    ("yakkasaroy", "Yakkasaroy", 41.26, 69.23, 41.30, 69.27),
    ("bektemir", "Bektemir", 41.20, 69.31, 41.26, 69.38)
]

json_path = "frontend/public/tashkent_buildings.json"
districts_dir = "frontend/public/districts"
os.makedirs(districts_dir, exist_ok=True)

headers = {"User-Agent": "SunCheckTashkent/2.0 (contact@suncheck.uz)"}

print("SunCheck — Toshkent Shahri Tumanlarini Yuklash", flush=True)

for code, name, s, w, n, e in new_districts:
    dist_file = os.path.join(districts_dir, f"{code}.json")
    if os.path.exists(dist_file):
        print(f"[{code}] Allaqachon mavjud, o'tkazib yuboriladi.", flush=True)
        continue

    print(f"\n[{code}] {name} yuklanmoqda ({s},{w} -> {n},{e})...", flush=True)
    query = f"""[out:json][timeout:30];
(
  way["building"]({s},{w},{n},{e});
);
out geom;"""

    success = False
    for attempt in range(len(mirrors)):
        mirror = mirrors[attempt]
        print(f"  Mirror: {mirror} ...", end=" ", flush=True)
        try:
            resp = requests.post(mirror, data={"data": query}, headers=headers, timeout=30)
            if resp.status_code == 200:
                elements = resp.json().get("elements", [])
                print(f"OK! Topildi: {len(elements)} bino.", flush=True)

                district_features = []
                for el in elements:
                    el_id = el["id"]
                    coords = [[pt["lon"], pt["lat"]] for pt in el.get("geometry", [])]
                    if len(coords) < 3:
                        continue
                    if coords[0] != coords[-1]:
                        coords.append(coords[0])

                    tags = el.get("tags", {})
                    b_name = tags.get("name") or tags.get("name:ru") or tags.get("name:uz") or ""
                    levels = tags.get("building:levels")
                    
                    if levels:
                        try:
                            height = float(levels) * 3.3
                        except:
                            height = 16.0
                    elif "height" in tags:
                        try:
                            height = float(tags["height"].replace("m", "").strip())
                        except:
                            height = 16.0
                    else:
                        b_type = tags.get("building", "")
                        if b_type in ["apartments", "residential"]:
                            height = 18.0
                        elif b_type in ["commercial", "office", "hotel"]:
                            height = 28.0
                        elif b_type in ["house", "detached"]:
                            height = 8.0
                        else:
                            height = 14.0

                    district_features.append({
                        "type": "Feature",
                        "id": el_id,
                        "properties": {
                            "id": str(el_id),
                            "name": b_name,
                            "height": round(height, 1),
                            "levels": levels,
                            "district": code,
                            "source": "OpenStreetMap"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [coords]
                        }
                    })

                dist_fc = {"type": "FeatureCollection", "features": district_features}
                with open(dist_file, "w", encoding="utf-8") as df:
                    json.dump(dist_fc, df)
                print(f"  Fayl saqlandi: {dist_file} ({len(district_features)} bino)", flush=True)
                success = True
                break
            else:
                print(f"Status: {resp.status_code}", flush=True)
        except Exception as err:
            print(f"Xato: {err}", flush=True)
        time.sleep(1)

    time.sleep(1)

print("\nBarcha yangi tumanlar yuklandi!", flush=True)