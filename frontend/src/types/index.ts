export interface Building {
    id: string;
    name?: string;
    height: number;
    floors?: number;
    source: string;
    sunlight_hours?: number;
    properties?: any;
    coordinates?: [number, number][];
    area_m2?: number;
    centroid?: [number, number];
}

export interface Project {
    id: string;
    name: string;
}

export interface ShadowResult {
    shadow_polygon: any;
}

export interface SunPosition {
    azimuthDeg: number;
    azimuthRad: number;
    altitudeDeg: number;
    altitudeRad: number;
}

export interface HourlyPvRecord {
    hour: number;
    timeStr: string;
    pvKw: number;
    irradianceW: number;
    isShaded: boolean;
    sunAltitude: number;
}

export interface DailyPvResult {
    date: string;
    dailyKwh: number;
    peakKw: number;
    systemCapacityKw: number;
    shadingLossPercent: number;
    unshadedDailyKwh: number;
    dailySavingsUzs: number;
    optimalTiltDeg: number;
    optimalAzimuthDeg: number;
    annualAvgTiltDeg: number;
    hourlyGeneration: HourlyPvRecord[];
}

export interface HourlyInsolationRecord {
    hour: number;
    timeStr: string;
    status: 'sunny' | 'shaded' | 'night';
    altitudeDeg: number;
    azimuthDeg: number;
    facadeFacing: 'east' | 'south' | 'west' | 'north' | 'none';
}

export interface ApartmentInsolationResult {
    date: string;
    sunrise: string;
    sunset: string;
    daylightHours: number;
    totalSunHours: number;
    morningSunHours: number; // 06:00 - 11:30 (Sharq)
    noonSunHours: number;    // 11:30 - 15:30 (Janub)
    eveningSunHours: number; // 15:30 - 19:30 (G'arb)
    isCompliant: boolean;    // ShNQ >= 2.5 hrs
    shadingRatio: number;
    timeline: HourlyInsolationRecord[];
}
