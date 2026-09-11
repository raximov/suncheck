import json
import glob
import os

def calculate_polygon_area_approx(coords):
    # Shoelace formula in meters approx at Tashkent latitude 41.3
    if len(coords) < 3:
        return 50.0
    lat_m = 111132.0
    lng_m = 111132.0 * 0.751 # cos(41.3 deg)
    pts = [(p[0] * lng_m, p[1] * lat_m) for p in coords]
    n = len(pts)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += pts[i][0] * pts[j][1]
        area -= pts[j][0] * pts[i][1]
    return abs(area) / 2.0

def assign_smart_height(feat):
    props = feat.setdefault("properties", {})
    existing_h = props.get("height")
    existing_l = props.get("levels")
    
    coords = feat.get("geometry", {}).get("coordinates", [[]])[0]
    area = calculate_polygon_area_approx(coords)
    props["area_m2"] = round(area, 1)

    # If reliable levels exist
    if existing_l:
        try:
            l = float(existing_l)
            if l >= 1:
                props["height"] = round(l * 3.3, 1)
                props["levels"] = int(l)
                return
        except:
            pass

    # If valid height exists
    if existing_h:
        try:
            h = float(existing_h)
            if h >= 3.0:
                props["height"] = round(h, 1)
                props["levels"] = max(1, round(h / 3.3))
                return
        except:
            pass

    # Smart contextual height based on building footprint area & type
    # Small structures (garages, outbuildings)
    if area < 65:
        props["height"] = 3.8
        props["levels"] = 1
    # Tashkent mahalla private houses / cottages (standard 2 floors)
    elif area < 260:
        props["height"] = 7.2
        props["levels"] = 2
    # Medium buildings, clinics, schools, 3-4 floor residences
    elif area < 550:
        props["height"] = 13.5
        props["levels"] = 4
    # Standard 5-story blocks (Khrushchevka / Novostroyka)
    elif area < 1000:
        props["height"] = 17.5
        props["levels"] = 5
    # Large 9-16 story complexes, hospitals, business centers
    elif area < 2200:
        props["height"] = 29.7
        props["levels"] = 9
    else:
        props["height"] = 36.0
        props["levels"] = 11

print("Updating heights across all districts...", flush=True)

# 1. Update all district files
dist_files = glob.glob("frontend/public/districts/*.json")
for df in dist_files:
    with open(df, "r", encoding="utf-8") as f:
        data = json.load(f)
    for feat in data.get("features", []):
        assign_smart_height(feat)
    with open(df, "w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"  Updated {os.path.basename(df)} ({len(data['features'])} buildings)")

# 2. Update master tashkent_buildings.json
master_file = "frontend/public/tashkent_buildings.json"
with open(master_file, "r", encoding="utf-8") as f:
    master_data = json.load(f)

for feat in master_data.get("features", []):
    assign_smart_height(feat)

with open(master_file, "w", encoding="utf-8") as f:
    json.dump(master_data, f)
print(f"Master file updated: {master_file} ({len(master_data['features'])} buildings)")

# 3. Create rich demo_buildings.json covering the entire Do'rmon yo'li / Ziyolilar / Hospital area
with open("frontend/public/districts/mirzo_ulugbek.json", "r", encoding="utf-8") as f:
    mu_data = json.load(f)

demo_feats = []
for feat in mu_data.get("features", []):
    coords = feat["geometry"]["coordinates"][0]
    c_lng = sum(p[0] for p in coords) / len(coords)
    c_lat = sum(p[1] for p in coords) / len(coords)
    if 41.326 <= c_lat <= 41.348 and 69.320 <= c_lng <= 69.350:
        demo_feats.append(feat)

demo_fc = {
    "type": "FeatureCollection",
    "features": demo_feats
}

with open("frontend/public/demo_buildings.json", "w", encoding="utf-8") as f:
    json.dump(demo_fc, f)
print(f"Demo file updated: frontend/public/demo_buildings.json ({len(demo_feats)} buildings with 100% 3D heights & shadows!)")