import { useState, useEffect, useCallback } from 'react';
import { findCurrentHourIndex, findTodayIndex } from '../utils/weatherHelpers';
import { visibilityToKm } from '../utils/formatters';

const SEATTLE = { lat: 47.6062, lng: -122.3321 };
const RAINIER = { lat: 46.7852, lng: -121.7368 };
const STALE_THRESHOLD_MS = 45 * 60 * 1000;

function buildUrl({ lat, lng }) {
  const base = 'https://api.open-meteo.com/v1/forecast';
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    hourly: [
      'cloud_cover', 'cloud_cover_low', 'visibility', 'precipitation',
      'precipitation_probability', 'shortwave_radiation', 'uv_index',
      'wind_speed_10m', 'weather_code', 'apparent_temperature',
    ].join(','),
    daily: 'sunrise,sunset,weather_code,sunshine_duration,precipitation_sum',
    forecast_days: 3,
    timezone: 'auto',
    wind_speed_unit: 'mph',
    temperature_unit: 'fahrenheit',
  });
  return `${base}?${params}`;
}

async function fetchLocation(coords, signal) {
  const res = await fetch(buildUrl(coords), { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useWeatherData() {
  const [state, setState] = useState({
    seattleData: null,
    rainierData: null,
    currentHourIndex: 12,
    todayIndex: 0,
    loading: true,
    error: null,
    fetchedAt: null,
  });

  const load = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    setState(s => ({ ...s, loading: true, error: null }));

    try {
      const [seattle, rainier] = await Promise.all([
        fetchLocation(SEATTLE, controller.signal),
        fetchLocation(RAINIER, controller.signal),
      ]);

      const hourIdx = findCurrentHourIndex(seattle.hourly.time);
      const dayIdx = findTodayIndex(seattle.daily.time);

      setState({
        seattleData: seattle,
        rainierData: rainier,
        currentHourIndex: hourIdx >= 0 ? hourIdx : 12,
        todayIndex: dayIdx,
        loading: false,
        error: null,
        fetchedAt: Date.now(),
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setState(s => ({ ...s, loading: false, error: 'Request timed out. Check your connection.' }));
      } else {
        setState(s => ({ ...s, loading: false, error: 'Could not load weather data. Check your connection.' }));
      }
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isStale = state.fetchedAt && Date.now() - state.fetchedAt > STALE_THRESHOLD_MS;

  // Derive a conditions snapshot from the current hour
  const currentConditions = state.seattleData
    ? deriveConditions(state.seattleData, state.currentHourIndex, state.todayIndex)
    : null;

  return { ...state, currentConditions, isStale, reload: load };
}

export function deriveConditions(data, hourIdx, dayIdx) {
  const h = data.hourly;
  const d = data.daily;
  return {
    temp: h.apparent_temperature?.[hourIdx] ?? null,
    cloudCover: h.cloud_cover?.[hourIdx] ?? 50,
    windMph: h.wind_speed_10m?.[hourIdx] ?? 0,
    precipProb: h.precipitation_probability?.[hourIdx] ?? 0,
    precipMM: h.precipitation?.[hourIdx] ?? 0,
    visibilityKm: visibilityToKm(h.visibility?.[hourIdx]),
    wmoCode: h.weather_code?.[hourIdx] ?? 0,
    sunrise: d.sunrise?.[dayIdx] ?? null,
    sunset: d.sunset?.[dayIdx] ?? null,
  };
}

export function extractHourlySlice(data, hourIdx) {
  const h = data?.hourly;
  if (!h) return {};
  return {
    cloudCover: h.cloud_cover?.[hourIdx] ?? 50,
    precipMM: h.precipitation?.[hourIdx] ?? 0,
    precipProb: h.precipitation_probability?.[hourIdx] ?? 0,
    visibilityKm: visibilityToKm(h.visibility?.[hourIdx]),
    windMph: h.wind_speed_10m?.[hourIdx] ?? 0,
  };
}
