export function describeWmoCode(code) {
  if (code === 0) return { label: 'Clear sky', icon: '☀️' };
  if (code <= 2) return { label: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { label: 'Overcast', icon: '☁️' };
  if (code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow', icon: '❄️' };
  if (code <= 82) return { label: 'Rain showers', icon: '🌦️' };
  if (code <= 86) return { label: 'Snow showers', icon: '🌨️' };
  if (code <= 99) return { label: 'Thunderstorm', icon: '⛈️' };
  return { label: 'Unknown', icon: '🌡️' };
}

import { getNowSeattleIso, getTodaySeattleDate } from './timezone';

export function findCurrentHourIndex(timeArray) {
  if (!timeArray?.length) return 0;
  // Compare ISO strings directly — both API times and nowSeattle are in the same
  // Seattle-local format ("YYYY-MM-DDTHH:MM"), which sorts lexicographically.
  const now = getNowSeattleIso();
  for (let i = 0; i < timeArray.length - 1; i++) {
    if (timeArray[i] <= now && now < timeArray[i + 1]) return i;
  }
  return timeArray.length - 2;
}

export function findTodayIndex(timeArray) {
  // Use Seattle's current date — avoids UTC midnight crossing for non-Seattle users
  const today = getTodaySeattleDate();
  const idx = timeArray.findIndex(t => t === today);
  return idx >= 0 ? idx : 0;
}
