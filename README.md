# ☀️ SunCheck — 3D Solar Shadow & Insolation Analysis Platform for Tashkent City

<div align="center">

**Toshkent shahri uchun 3D binolar, real vaqt quyosh soyalari, xonadon insolyatsiyasi va quyosh paneli (PV) texnik-iqtisodiy tahlil platformasi**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-3D%20Globe-blue)](https://cesium.com/)
[![Django](https://img.shields.io/badge/Django-5.1%20DRF-green?logo=django)](https://www.djangoproject.com/)
[![PostGIS](https://img.shields.io/badge/PostGIS-16--3.4-blue?logo=postgresql)](https://postgis.net/)
[![License](https://img.shields.io/badge/license-MIT-purple)]()

</div>

---

## 📌 Loyiha Haqida (Overview)

**SunCheck** — shaharsozlik, xonadon xaridorlari va quyosh energetikasi muhandislari uchun yaratilgan professional 3D platforma.
Katta Toshkent shahrining **13 ta tumani** bo'yicha **199,615 ta unikal 3D bino** asosida ishlaydi.

### Asosiy Funksiyalar:
1. **3D Binolar va Real Vaqt Soyalari**:
   - Yandex Maps 3D uslubidagi me'moriy vizualizatsiya (`CesiumJS` WebGL).
   - Toshkent koordinatalari ($41.31^\circ\text{N}, 69.28^\circ\text{E}$, UTC+5) bo'yicha NREL SPA / SunCalc quyosh azimuti va balandligi orqali hisoblangan aniq yer soyalari.
2. **Xonadon Xaridori Uchun Deraza Tahlili**:
   - O'zbekiston **ShNQ 2.07.01-03** normativi (kamida $2.5$ soat to'g'ridan-to'g'ri quyosh tushishi) bo'yicha audit.
   - Sharqiy (ertalabki), Janubiy (tushdagi) va G'arbiy (shom) fasadlar bo'yicha quyosh soati.
   - Xaridor maqsadiga mos interaktiv tavsiya filtri (ertalabki quyosh, salqin shimoliy xonalar, va h.k.).
   - 24-soatlik interaktiv quyosh/soya lentasi.
3. **Quyosh Paneli (Solar PV) Texnik-Iqtisodiy Hisobi**:
   - Tanlangan aniq sana uchun kunlik elektr energiyasi generatsiyasi: **`XX.X kWh / kun`**.
   - Atrofdagi baland binolar tufayli yuzaga keladigan soya yo'qotishi ($-XX\%$).
   - Toshkent uchun optimal parametrlar: **To'g'ri Janub ($180^\circ$)**, optimal qiyalik burchagi ($35^\circ$).
   - Kunlik va yillik iqtisodiy tejov ($900\text{ so'm/kWh}$ tarifi bo'yicha).
   - Soatbay PV quvvat chiqishi grafigi ($06:00 - 19:00$).
4. **Rasmiy Ekspertiza Dalolatnomasi (PDF)**:
   - ShNQ 2.07.01 va Yashil Energetika dasturi talablari asosida shakllantiriladigan, chop etish va PDF saqlashga tayyor rasmiy dalolatnoma.

---

## 🏛️ Toshkent Shahri Tumanlari (199,615 Bino)

| # | Tuman Nomi | 3D Bino Soni | Ma'lumot Fayli |
|---|---|---|---|
| 1 | **Olmazor tumani** | 30,478 | `frontend/public/districts/olmazor.json` |
| 2 | **Yashnobod tumani** | 27,121 | `frontend/public/districts/yashnobod.json` |
| 3 | **Uchtepa tumani** | 24,041 | `frontend/public/districts/uchtepa.json` |
| 4 | **Sergeli tumani** | 22,356 | `frontend/public/districts/sergeli.json` |
| 5 | **Bektemir tumani** | 19,819 | `frontend/public/districts/bektemir.json` |
| 6 | **Shayxontohur / Chorsu** | 19,525 | `frontend/public/districts/chorsu.json` |
| 7 | **Yangihayot tumani** | 17,103 | `frontend/public/districts/yangihayot.json` |
| 8 | **Yunusobod tumani** | 16,575 | `frontend/public/districts/yunusobod.json` |
| 9 | **Chilonzor tumani** | 15,170 | `frontend/public/districts/chilonzor.json` |
| 10 | **Mirzo Ulug'bek tumani** | 12,765 | `frontend/public/districts/mirzo_ulugbek.json` |
| 11 | **Mirobod tumani** | 12,175 | `frontend/public/districts/mirobod.json` |
| 12 | **Yakkasaroy tumani** | 10,875 | `frontend/public/districts/yakkasaroy.json` |
| 13 | **Markaz / Amir Temur** | 6,211 | `frontend/public/districts/central.json` |
| ⭐ | **Do'rmon yo'li / IT Park (Demo)** | 2,880 | `frontend/public/demo_buildings.json` |
| **JAMI** | **Katta Toshkent Shahri** | **199,615** | `frontend/public/tashkent_buildings.json` |

---

## 🛠️ Texnologiyalar (Tech Stack)

* **Frontend**:
  * [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
  * [CesiumJS](https://cesium.com/platform/cesiumjs/) (3D Geospatial Engine)
  * [Tailwind CSS](https://tailwindcss.com/)
  * [Zustand](https://github.com/pmndrs/zustand) (State Management)
  * [SunCalc](https://github.com/mourner/suncalc) (Astronomical solar equations)
  * [Lucide React](https://lucide.dev/) (UI Icons)
* **Backend**:
  * Python 3.12, Django 5.1, Django REST Framework
  * [PostGIS 16-3.4](https://postgis.net/) (Spatial geometry indexing & shadow polygons)
  * [pvlib-python](https://pvlib-python.readthedocs.io/) (NREL solar radiation models)
  * [Shapely](https://shapely.readthedocs.io/) (2D Polygon clipping & convex hulls)
  * Celery & Redis 7

---

## 🚀 O'rnatish va Ishga Tushirish (Quickstart)

### 1. Repository'ni klonlash:
```bash
git clone https://github.com/USERNAME/suncheck.git
cd suncheck
```

### 2. Frontend'ni ishga tushirish:
```bash
cd frontend
npm install
npm run dev
```
Brauzerda oching: `http://localhost:3000/project/demo`

### 3. Backend va Bazani ishga tushirish (Docker):
```bash
docker-compose up -d
```
* Django API: `http://localhost:8000/api/docs/`
* PostGIS port: `5433` (yoki `5432`)

---

## 📄 Litsenziya

MIT License © 2026 SunCheck Team.