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

export function findCurrentHourIndex(timeArray) {
  const now = Date.now();
  let idx = 0;
  for (let i = 0; i < timeArray.length - 1; i++) {
    const t = new Date(timeArray[i]).getTime();
    const next = new Date(timeArray[i + 1]).getTime();
    if (t <= now && now < next) {
      idx = i;
      break;
    }
    if (i === timeArray.length - 2) idx = i;
  }
  return idx;
}

export function findTodayIndex(timeArray) {
  const today = new Date().toISOString().slice(0, 10);
  const idx = timeArray.findIndex(t => t === today);
  return idx >= 0 ? idx : 0;
}
