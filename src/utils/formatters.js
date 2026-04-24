export function formatTime(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
