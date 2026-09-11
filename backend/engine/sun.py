import pandas as pd
import pvlib
from datetime import datetime, date, timedelta
import pytz
import numpy as np


def get_sun_position(lat: float, lng: float, dt: datetime, tz: str = 'Asia/Tashkent') -> dict:
    """Get sun azimuth, altitude, zenith using NREL SPA via pvlib."""
    if dt.tzinfo is None:
        dt = pytz.timezone(tz).localize(dt)
    times = pd.DatetimeIndex([dt])
    solpos = pvlib.solarposition.get_solarposition(times, lat, lng)
    return {
        'azimuth': float(solpos['azimuth'].iloc[0]),
        'altitude': float(solpos['apparent_elevation'].iloc[0]),
        'zenith': float(solpos['apparent_zenith'].iloc[0]),
    }


def get_sunrise_sunset(lat: float, lng: float, target_date: str, tz: str = 'Asia/Tashkent') -> dict:
    """Compute actual sunrise and sunset times using pvlib sun_rise_set_transit_spa."""
    tzinfo = pytz.timezone(tz)
    d = datetime.strptime(target_date, '%Y-%m-%d').date()

    # Generate minute-resolution solar positions for the day
    times = pd.date_range(
        start=datetime.combine(d, datetime.min.time()),
        end=datetime.combine(d, datetime.max.time().replace(microsecond=0)),
        freq='1min',
        tz=tzinfo,
    )
    solpos = pvlib.solarposition.get_solarposition(times, lat, lng)
    elevation = solpos['apparent_elevation']

    # Find sunrise: first time elevation crosses above 0
    above = elevation > 0
    transitions_up = above.astype(int).diff()

    sunrise_idx = transitions_up[transitions_up == 1].index
    sunset_idx = transitions_up[transitions_up == -1].index

    sunrise_str = sunrise_idx[0].strftime('%H:%M') if len(sunrise_idx) > 0 else None
    sunset_str = sunset_idx[0].strftime('%H:%M') if len(sunset_idx) > 0 else None

    return {
        'sunrise': sunrise_str,
        'sunset': sunset_str,
        'daylight_hours': round((len(elevation[above]) / 60), 2) if sunrise_str else 0,
    }


def get_sun_positions_range(
    lat: float,
    lng: float,
    target_date: str,
    time_start: str,
    time_end: str,
    interval_minutes: int,
    tz: str = 'Asia/Tashkent',
) -> list[dict]:
    """Get sun positions at regular intervals throughout a time range."""
    tzinfo = pytz.timezone(tz)

    # Support both HH:MM and HH:MM:SS formats
    fmt = '%Y-%m-%d %H:%M:%S' if len(time_start) > 5 else '%Y-%m-%d %H:%M'
    start_dt = tzinfo.localize(datetime.strptime(f'{target_date} {time_start}', fmt))

    fmt_end = '%Y-%m-%d %H:%M:%S' if len(time_end) > 5 else '%Y-%m-%d %H:%M'
    end_dt = tzinfo.localize(datetime.strptime(f'{target_date} {time_end}', fmt_end))

    positions = []
    curr = start_dt
    while curr <= end_dt:
        pos = get_sun_position(lat, lng, curr, tz)
        pos['time'] = curr.isoformat()
        positions.append(pos)
        curr += timedelta(minutes=interval_minutes)
    return positions
