import * as SunCalc from 'suncalc';
import { Building, DailyPvResult, ApartmentInsolationResult, HourlyPvRecord, HourlyInsolationRecord } from '@/types';
import { calculateSunPosition } from './shadowCalculator';

const TASHKENT_LAT = 41.31108;
const TASHKENT_LNG = 69.27974;
const ELECTRICITY_TARIFF_UZS = 900; // 900 UZS / kWh in Uzbekistan

/**
 * Calculates optimal tilt angle for Tashkent based on date/season
 */
export function getOptimalTilt(date: Date): { seasonalDeg: number; annualAvgDeg: number } {
    // Tashkent latitude = 41.3 deg
    // Optimal seasonal tilt approx = Latitude - Declination
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    
    // Declination in degrees
    const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
    
    // Seasonal tilt bounded between 15 deg and 60 deg
    const seasonal = Math.round(Math.max(15, Math.min(60, 41.3 - declination)));
    
    return {
        seasonalDeg: seasonal,
        annualAvgDeg: 35, // Tashkent annual average optimum
    };
}

/**
 * Computes clear-sky solar irradiance (GHI, DNI, DHI, POA) for Tashkent
 */
function calculateIrradiance(altitudeDeg: number, azimuthDeg: number, tiltDeg: number, surfaceAzimuthDeg: number = 180) {
    if (altitudeDeg <= 1.0) {
        return { ghi: 0, dni: 0, dhi: 0, poa: 0 };
    }

    const altRad = (altitudeDeg * Math.PI) / 180;
    const azRad = (azimuthDeg * Math.PI) / 180;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    const surfAzRad = (surfaceAzimuthDeg * Math.PI) / 180;

    // Clear sky global horizontal irradiance (Haurwitz model tuned for sunny Tashkent)
    const sinAlt = Math.sin(altRad);
    const ghi = Math.max(0, 1098 * sinAlt * Math.exp(-0.057 / sinAlt));
    
    // Direct normal irradiance
    const dni = ghi > 0 ? (ghi * 0.82) / sinAlt : 0;
    const dhi = ghi * 0.18;

    // Angle of incidence on panel facing south (surfaceAzimuthDeg = 180)
    // cos(theta) = cos(alt) * sin(tilt) * cos(sunAz - surfAz) + sin(alt) * cos(tilt)
    const cosIncidence = Math.cos(altRad) * Math.sin(tiltRad) * Math.cos(azRad - surfAzRad) + Math.sin(altRad) * Math.cos(tiltRad);
    const cosTheta = Math.max(0, cosIncidence);

    // Plane of Array (POA) Irradiance (W/m2)
    const beamPoa = dni * cosTheta;
    const diffusePoa = dhi * ((1 + Math.cos(tiltRad)) / 2);
    const albedoPoa = ghi * 0.2 * ((1 - Math.cos(tiltRad)) / 2);

    const poa = Math.min(1200, Math.max(0, beamPoa + diffusePoa + albedoPoa));

    return { ghi, dni, dhi, poa };
}

/**
 * Predicts daily PV solar energy generation (kWh/kun) for a building on a specific date
 */
export function calculateDailyPv(
    building: Building,
    dateStr: string,
    capacityKwOverride?: number
): DailyPvResult {
    const dateObj = new Date(`${dateStr}T12:00:00+05:00`);
    const { seasonalDeg, annualAvgDeg } = getOptimalTilt(dateObj);

    // Calculate system capacity based on building roof area or standard residential sizing
    let systemCapacityKw = capacityKwOverride || 5.0;
    if (!capacityKwOverride && building.height > 25) {
        // High-rise / commercial building
        systemCapacityKw = 15.0;
    }

    const hourlyGeneration: HourlyPvRecord[] = [];
    let totalKwh = 0;
    let unshadedTotalKwh = 0;
    let peakKw = 0;

    // Evaluate each hour from 05:00 to 20:00
    for (let h = 5; h <= 20; h++) {
        const timeStr = `${h.toString().padStart(2, '0')}:00`;
        const hourDate = new Date(`${dateStr}T${timeStr}:00+05:00`);
        const sun = calculateSunPosition(TASHKENT_LAT, TASHKENT_LNG, hourDate);

        let pvKw = 0;
        let isShaded = false;
        let irradianceW = 0;

        if (sun.altitudeDeg > 2.0) {
            const irr = calculateIrradiance(sun.altitudeDeg, sun.azimuthDeg, seasonalDeg, 180);
            irradianceW = Math.round(irr.poa);

            // Shading factor: morning/evening shadows if low height
            if (building.height < 15 && (sun.altitudeDeg < 15 || h === 6 || h === 19)) {
                isShaded = true;
            }

            // System efficiency: 86% (inverter + wire losses)
            const sysEff = 0.86;
            const unshadedKw = (systemCapacityKw * (irr.poa / 1000)) * sysEff;
            unshadedTotalKwh += unshadedKw;

            if (isShaded) {
                // When shaded, only diffuse light reaches panels (~20% output)
                pvKw = (systemCapacityKw * (irr.dhi / 1000)) * sysEff;
            } else {
                pvKw = unshadedKw;
            }

            if (pvKw > peakKw) {
                peakKw = pvKw;
            }
            totalKwh += pvKw;
        }

        hourlyGeneration.push({
            hour: h,
            timeStr,
            pvKw: Math.round(pvKw * 100) / 100,
            irradianceW,
            isShaded,
            sunAltitude: Math.round(sun.altitudeDeg),
        });
    }

    const shadingLossPercent = unshadedTotalKwh > 0 
        ? Math.round(((unshadedTotalKwh - totalKwh) / unshadedTotalKwh) * 100)
        : 0;

    const roundedDailyKwh = Math.round(totalKwh * 10) / 10;
    const roundedUnshaded = Math.round(unshadedTotalKwh * 10) / 10;
    const dailySavings = Math.round(roundedDailyKwh * ELECTRICITY_TARIFF_UZS);

    return {
        date: dateStr,
        dailyKwh: roundedDailyKwh,
        peakKw: Math.round(peakKw * 10) / 10,
        systemCapacityKw,
        shadingLossPercent,
        unshadedDailyKwh: roundedUnshaded,
        dailySavingsUzs: dailySavings,
        optimalTiltDeg: seasonalDeg,
        optimalAzimuthDeg: 180, // True South
        annualAvgTiltDeg: annualAvgDeg,
        hourlyGeneration,
    };
}

/**
 * Analyzes apartment / window sunlight exposure (morning, noon, evening) for home buyers
 */
export function calculateApartmentInsolation(
    building: Building,
    dateStr: string
): ApartmentInsolationResult {
    const noonDate = new Date(`${dateStr}T12:00:00+05:00`);
    const sunTimes = SunCalc.getTimes(noonDate, TASHKENT_LAT, TASHKENT_LNG);

    const sunriseStr = sunTimes.sunrise 
        ? `${sunTimes.sunrise.getHours().toString().padStart(2, '0')}:${sunTimes.sunrise.getMinutes().toString().padStart(2, '0')}`
        : '06:00';
    const sunsetStr = sunTimes.sunset
        ? `${sunTimes.sunset.getHours().toString().padStart(2, '0')}:${sunTimes.sunset.getMinutes().toString().padStart(2, '0')}`
        : '19:30';

    const daylightHours = sunTimes.sunset && sunTimes.sunrise 
        ? Math.round(((sunTimes.sunset.getTime() - sunTimes.sunrise.getTime()) / (1000 * 3600)) * 10) / 10
        : 12.0;

    const timeline: HourlyInsolationRecord[] = [];
    let morningSunHours = 0;
    let noonSunHours = 0;
    let eveningSunHours = 0;
    let totalSunHours = 0;

    for (let h = 5; h <= 21; h++) {
        const timeStr = `${h.toString().padStart(2, '0')}:00`;
        const hourDate = new Date(`${dateStr}T${timeStr}:00+05:00`);
        const sun = calculateSunPosition(TASHKENT_LAT, TASHKENT_LNG, hourDate);

        let status: 'sunny' | 'shaded' | 'night' = 'night';
        let facade: 'east' | 'south' | 'west' | 'north' | 'none' = 'none';

        if (sun.altitudeDeg > 1.0) {
            // Determine facade orientation receiving primary sun based on sun azimuth
            // Azimuth in degrees: -180 to +180 or 0 to 360.
            // SunCalc azimuth: 0 = South, -90 = East, +90 = West, +/-180 = North.
            // Or degrees from North:
            const azFromNorth = (sun.azimuthDeg + 360) % 360;

            if (h < 11) {
                facade = 'east';
            } else if (h <= 15) {
                facade = 'south';
            } else {
                facade = 'west';
            }

            // Check if shadow falls on building (ground obstruction for lower floors)
            const isLowFloorObstruction = building.height < 10 && sun.altitudeDeg < 12;

            if (isLowFloorObstruction) {
                status = 'shaded';
            } else {
                status = 'sunny';
                totalSunHours += 1;
                if (h >= 6 && h < 11) morningSunHours += 1;
                else if (h >= 11 && h <= 15) noonSunHours += 1;
                else if (h > 15 && h <= 19) eveningSunHours += 1;
            }
        }

        timeline.push({
            hour: h,
            timeStr,
            status,
            altitudeDeg: Math.round(sun.altitudeDeg),
            azimuthDeg: Math.round(sun.azimuthDeg),
            facadeFacing: facade,
        });
    }

    // Uzbekistan ShNQ (SNiP) 2.07.01 requirement: minimum 2.5 hours continuous direct sunlight
    const isCompliant = totalSunHours >= 2.5;
    const shadingRatio = daylightHours > 0 
        ? Math.round(((daylightHours - totalSunHours) / daylightHours) * 100) 
        : 0;

    return {
        date: dateStr,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        daylightHours,
        totalSunHours,
        morningSunHours,
        noonSunHours,
        eveningSunHours,
        isCompliant,
        shadingRatio: Math.max(0, shadingRatio),
        timeline,
    };
}
