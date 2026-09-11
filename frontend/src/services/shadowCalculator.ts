import * as SunCalc from 'suncalc';

export function calculateSunPosition(lat: number, lng: number, date: Date) {
    const pos = SunCalc.getPosition(date, lat, lng);
    // SunCalc returns altitude and azimuth in DEGREES
    const altitudeDeg = pos.altitude;
    const azimuthDeg = pos.azimuth;

    const altitudeRad = (altitudeDeg * Math.PI) / 180;
    const azimuthRad = (azimuthDeg * Math.PI) / 180;

    return {
        altitudeDeg,
        altitudeRad,
        azimuthDeg,
        azimuthRad,
    };
}

function metersToDegrees(metersX: number, metersY: number, lat: number): [number, number] {
    const rEarth = 6378137.0;
    const degY = (metersY / rEarth) * (180 / Math.PI);
    const degX = (metersX / (rEarth * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI);
    return [degX, degY];
}

export function projectShadows(buildingsGeoJson: any, date: Date): any {
    if (!buildingsGeoJson || !buildingsGeoJson.features) return null;

    const centerLat = 41.3364;
    const centerLng = 69.3340;
    const sun = calculateSunPosition(centerLat, centerLng, date);

    // If sun is below horizon or lower than 2 degrees, no ground shadow
    if (sun.altitudeDeg <= 2.0) {
        return { type: 'FeatureCollection', features: [] };
    }

    // Shadow length = height / tan(altitude)
    // In Tashkent at 12:00-13:00, altitude is 50-60 deg -> shadow length factor is ~0.6x-0.8x (short shadow)
    const shadowFactor = Math.min(1.0 / Math.tan(sun.altitudeRad), 7.0);

    // Shadow points away from the sun:
    // dx (East/West): -sin(azimuth) * length
    // dy (North/South): -cos(azimuth) * length
    const dxMetersUnit = -Math.sin(sun.azimuthRad);
    const dyMetersUnit = -Math.cos(sun.azimuthRad);

    const shadowFeatures: any[] = [];

    for (const feature of buildingsGeoJson.features) {
        if (!feature.geometry || feature.geometry.type !== 'Polygon') continue;

        const height = feature.properties?.height || 16.0;
        const shadowLength = height * shadowFactor;

        const dxM = dxMetersUnit * shadowLength;
        const dyM = dyMetersUnit * shadowLength;

        const ring = feature.geometry.coordinates[0];
        if (!ring || ring.length < 3) continue;

        const [dLng, dLat] = metersToDegrees(dxM, dyM, ring[0][1]);

        const coords = ring.slice(0, -1);
        const shadowCoords = coords.map(([lng, lat]: [number, number]) => [lng + dLng, lat + dLat]);

        const n = coords.length;
        const allPoints = [...coords, ...shadowCoords];

        // Convex hull of base and shadow points for smooth realistic ground shadow
        const hull = computeConvexHull(allPoints);
        hull.push(hull[0]);

        shadowFeatures.push({
            type: 'Feature',
            id: 'shadow-' + (feature.id || feature.properties?.id || 'bldg'),
            properties: {
                buildingId: feature.properties?.id,
                height,
                sunAltitude: Math.round(sun.altitudeDeg),
                sunAzimuth: Math.round(sun.azimuthDeg),
            },
            geometry: {
                type: 'Polygon',
                coordinates: [hull],
            },
        });
    }

    return {
        type: 'FeatureCollection',
        features: shadowFeatures,
    };
}

function computeConvexHull(points: number[][]): number[][] {
    if (points.length <= 3) return points;

    const sorted = points.slice().sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);

    const cross = (o: number[], a: number[], b: number[]) => {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    };

    const lower: number[][] = [];
    for (const p of sorted) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper: number[][] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
}
