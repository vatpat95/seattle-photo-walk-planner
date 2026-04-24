const SEATTLE_TZ = 'America/Los_Angeles';

// Returns "YYYY-MM-DDTHH:MM" expressed in Seattle's current local time.
// Matches the format of Open-Meteo's hourly.time strings.
export function getNowSeattleIso() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SEATTLE_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const g = t => parts.find(p => p.type === t).value;
  // Intl gives hour "24" for midnight in some engines — normalise to "00"
  const hh = g('hour') === '24' ? '00' : g('hour');
  return `${g('year')}-${g('month')}-${g('day')}T${hh}:${g('minute')}`;
}

// Parses getNowSeattleIso() as browser-local time, producing a ms value
// that is directly comparable to new Date(apiTimeString).getTime().
// Both are "wrong" in absolute UTC terms but share the same reference frame,
// so comparisons (before/after/between) are correct.
export function getNowSeattleMs() {
  return new Date(getNowSeattleIso()).getTime();
}

// Returns "YYYY-MM-DD" in Seattle's timezone — for matching daily.time entries.
export function getTodaySeattleDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SEATTLE_TZ }).format(new Date());
}
