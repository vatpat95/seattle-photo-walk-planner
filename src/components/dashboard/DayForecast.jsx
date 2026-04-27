import { useState, useMemo } from 'react';
import {
  scoreCityLocation, scoreNatureLocation, scoreAstroLocation,
  getLightQuality, findBestWindow,
} from '../../utils/scoring';
import { extractHourlySlice } from '../../hooks/useWeatherData';

function fmt12(hour) {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

const TRACKS = [
  { key: 'city',   label: '🏙️ City',   activeColor: 'bg-sky-400',    dimColor: 'bg-sky-900/20',    threshold: 70 },
  { key: 'nature', label: '🌿 Nature', activeColor: 'bg-emerald-400', dimColor: 'bg-emerald-900/20', threshold: 65 },
  { key: 'astro',  label: '⭐ Astro',  activeColor: 'bg-violet-400',  dimColor: 'bg-violet-900/20',  threshold: 50 },
];

const WINDOW_LABELS = ['🏙️ Best city', '🌿 Best nature', '⭐ Best astro'];

export default function DayForecast({ seattleData, todayIndex, currentHourIndex }) {
  const [open, setOpen] = useState(false);

  const computed = useMemo(() => {
    if (!seattleData) return null;

    const baseIdx    = todayIndex * 24;
    const sunriseStr = seattleData.daily.sunrise?.[todayIndex];
    const sunsetStr  = seattleData.daily.sunset?.[todayIndex];
    const sunriseMs  = sunriseStr ? new Date(sunriseStr).getTime() : null;
    const sunsetMs   = sunsetStr  ? new Date(sunsetStr).getTime()  : null;
    const sunriseHr  = sunriseMs ? new Date(sunriseMs).getHours() : 6;
    const sunsetHr   = sunsetMs  ? new Date(sunsetMs).getHours()  : 20;

    const city = [], nature = [], astro = [];
    const daySet = new Set(), nightSet = new Set();

    for (let h = 0; h < 24; h++) {
      const idx   = baseIdx + h;
      const slice = extractHourlySlice(seattleData, idx);
      const hourMs = seattleData.hourly.time?.[idx]
        ? new Date(seattleData.hourly.time[idx]).getTime()
        : null;
      const light = sunriseMs && sunsetMs && hourMs
        ? getLightQuality(hourMs, sunriseMs, sunsetMs)
        : 'normal';

      city.push(scoreCityLocation(slice));
      nature.push(scoreNatureLocation(slice, light));
      astro.push(scoreAstroLocation(slice));

      if (h >= sunriseHr && h <= sunsetHr) daySet.add(h);
      else nightSet.add(h);
    }

    return { city, nature, astro, daySet, nightSet, sunriseHr, sunsetHr };
  }, [seattleData, todayIndex]);

  const windows = useMemo(() => {
    if (!computed) return [null, null, null];
    const { city, nature, astro, daySet, nightSet } = computed;
    return [
      findBestWindow(city,   daySet,   TRACKS[0].threshold),
      findBestWindow(nature, daySet,   TRACKS[1].threshold),
      findBestWindow(astro,  nightSet, TRACKS[2].threshold),
    ];
  }, [computed]);

  if (!seattleData || !computed) return null;

  const { city, nature, astro, daySet, nightSet } = computed;
  const allScores  = [city, nature, astro];
  const activeSets = [daySet, daySet, nightSet];
  const todayHour  = currentHourIndex % 24;
  const hours      = Array.from({ length: 24 }, (_, i) => i);
  const hasWindow  = windows.some(Boolean);

  const collapsedSummary = windows
    .map((w, i) => w ? `${['City','Nature','Astro'][i]} ${fmt12(w.start)}–${fmt12(w.end + 1)}` : null)
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="rounded-2xl bg-bg-card border border-border overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">🗓️</span>
          <span className="text-sm font-semibold text-text-primary shrink-0">Today's Best Windows</span>
          {!open && collapsedSummary && (
            <span className="text-xs text-text-muted truncate hidden sm:block">{collapsedSummary}</span>
          )}
        </div>
        <span className="text-text-muted text-xs shrink-0 ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {TRACKS.map((track, ti) => {
            const scores    = allScores[ti];
            const activeSet = activeSets[ti];

            return (
              <div key={track.key}>
                <div className="text-xs text-text-muted mb-1.5 font-medium">{track.label}</div>
                <div className="flex items-end gap-px h-12">
                  {hours.map(h => {
                    const score     = scores[h];
                    const isActive  = activeSet.has(h);
                    const isPast    = h < todayHour;
                    const isCurrent = h === todayHour;

                    return (
                      <div key={h} className="flex-1 relative group/bar flex flex-col justify-end">
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-bg-elevated border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover/bar:opacity-100 pointer-events-none z-10 shadow-xl">
                          <span className="text-text-primary font-semibold">{fmt12(h)}</span>
                          <span className={`ml-1 ${score >= track.threshold ? 'text-emerald-400' : 'text-text-muted'}`}>{score}</span>
                        </div>
                        <div
                          className={`w-full rounded-sm ${isActive ? track.activeColor : track.dimColor} ${isPast ? 'opacity-25' : 'opacity-90'} ${isCurrent ? 'ring-1 ring-border opacity-100' : ''}`}
                          style={{ height: `${Math.max(2, score * 0.44)}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex mt-0.5">
                  {hours.map(h => (
                    <div key={h} className={`flex-1 text-center text-[8px] leading-tight ${h % 6 === 0 ? 'text-text-muted' : 'text-transparent select-none'}`}>
                      {fmt12(h)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="border-t border-border-subtle" />

          <div className="space-y-1.5">
            {hasWindow
              ? windows.map((win, i) => win && (
                  <p key={i} className="text-xs text-text-secondary">
                    {WINDOW_LABELS[i]}:{' '}
                    <span className="text-text-primary font-medium">{fmt12(win.start)}–{fmt12(win.end + 1)}</span>
                    <span className="text-text-muted ml-1">(peak {win.maxScore})</span>
                  </p>
                ))
              : <p className="text-xs text-text-muted">No strong photography windows today — conditions are poor across all three modes.</p>
            }
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span>Dimmed bars = opposite time of day</span>
            <span>Faded = already passed</span>
            <span className="ring-1 ring-border rounded px-1">□ = now</span>
          </div>
        </div>
      )}
    </div>
  );
}
