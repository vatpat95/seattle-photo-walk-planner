// Parse time directly from the ISO string — Open-Meteo returns Seattle local times
// without timezone offset, so we extract digits rather than using Date() which
// would interpret the string in the browser's local timezone.
export function formatTime(isoString) {
  if (!isoString) return '--';
  const timePart = isoString.includes('T') ? isoString.split('T')[1] : isoString;
  const [hStr, mStr] = timePart.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatTemp(f) {
  if (f == null) return '--';
  return `${Math.round(f)}°F`;
}

export function formatVisibility(meters) {
  if (meters == null) return '--';
  const km = meters / 1000;
  if (km >= 1) return `${km.toFixed(0)} km`;
  return `${meters}m`;
}

export function visibilityToKm(meters) {
  if (meters == null) return 15;
  return meters / 1000;
}

export function buildFlickrUrl(locationName) {
  return `https://www.flickr.com/search/?q=${encodeURIComponent(locationName + ' seattle')}`;
}
