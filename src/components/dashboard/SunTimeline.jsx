import { formatTime } from '../../utils/formatters';
import { getLightQuality } from '../../utils/scoring';

function fmt12h(hour) {
  if (hour === 0 || hour === 24) return '12am';
  if (hour === 12) return '12pm';
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

export default function SunTimeline({ sunrise, sunset }) {
  if (!sunrise || !sunset) return null;

  const now        = Date.now();
  const sunriseMs  = new Date(sunrise).getTime();
  const sunsetMs   = new Date(sunset).getTime();
  const sunriseHr  = new Date(sunriseMs).getHours();
  const sunsetHr   = new Date(sunsetMs).getHours();

  // Timeline spans 4am → midnight for context
  const spanStart  = new Date(sunriseMs).setHours(4, 0, 0, 0);
  const spanEnd    = new Date(sunriseMs).setHours(24, 0, 0, 0);
  const totalSpan  = spanEnd - spanStart;
  const clamp      = v => Math.max(0, Math.min(100, v));
  const pct        = ms => clamp(((ms - spanStart) / totalSpan) * 100);

  const nowPct          = pct(now);
  const sunrisePct      = pct(sunriseMs);
  const sunsetPct       = pct(sunsetMs);
  const goldenEndMorn   = pct(sunriseMs + 60 * 60 * 1000);
  const goldenStartEve  = pct(sunsetMs  - 60 * 60 * 1000);

  const lightQuality    = getLightQuality(now, sunriseMs, sunsetMs);
  const isBeforeSpan    = now < spanStart;
  const isAfterSpan     = now > spanEnd;

  const lightLabel = lightQuality === 'golden'
    ? '✨ Golden Hour'
    : lightQuality === 'blue'
    ? '💙 Blue Hour'
    : null;

  // Hour ticks to display across the timeline span (4am to midnight)
  const tickHours = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Sun Timeline</span>
        {lightLabel && (
          <span className="text-amber-400 text-xs font-semibold animate-pulse">{lightLabel}</span>
        )}
      </div>

      {/* Timeline bar */}
      <div className="relative h-5 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        {/* Night zones (before sunrise and after sunset) */}
        <div className="absolute top-0 bottom-0 bg-slate-900/60 left-0" style={{ width: `${sunrisePct}%` }} />
        <div className="absolute top-0 bottom-0 bg-slate-900/60" style={{ left: `${sunsetPct}%`, right: 0 }} />

        {/* Morning golden zone */}
        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-600/60 to-amber-500/30"
          style={{ left: `${sunrisePct}%`, width: `${goldenEndMorn - sunrisePct}%` }} />
        {/* Midday zone */}
        <div className="absolute top-0 bottom-0 bg-sky-900/20"
          style={{ left: `${goldenEndMorn}%`, width: `${goldenStartEve - goldenEndMorn}%` }} />
        {/* Evening golden zone */}
        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500/30 to-amber-600/60"
          style={{ left: `${goldenStartEve}%`, width: `${sunsetPct - goldenStartEve}%` }} />

        {/* Sunrise marker */}
        <div className="absolute top-0.5 bottom-0.5 w-px bg-amber-400/60"
          style={{ left: `${sunrisePct}%` }} />
        {/* Sunset marker */}
        <div className="absolute top-0.5 bottom-0.5 w-px bg-amber-400/60"
          style={{ left: `${sunsetPct}%` }} />

        {/* Now marker */}
        {!isBeforeSpan && !isAfterSpan && (
          <div className="absolute top-0 bottom-0 w-0.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.4)]"
            style={{ left: `calc(${nowPct}% - 1px)` }} />
        )}
      </div>

      {/* Hour tick labels */}
      <div className="relative h-4">
        {tickHours.map(h => {
          const ms = new Date(sunriseMs).setHours(h, 0, 0, 0);
          const p = pct(ms);
          const isNight = h < sunriseHr || h > sunsetHr;
          return (
            <span
              key={h}
              className={`absolute text-[9px] -translate-x-1/2 ${isNight ? 'text-slate-700' : 'text-slate-600'}`}
              style={{ left: `${p}%` }}
            >
              {fmt12h(h)}
            </span>
          );
        })}
      </div>

      {/* Footer: sunrise / legend / sunset */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="text-slate-400">🌅 {formatTime(sunrise)}</span>
        <div className="flex gap-3">
          <span className="text-amber-600/80">■ Golden hour</span>
          <span className="text-slate-600/80">■ Night</span>
        </div>
        <span className="text-slate-400">🌇 {formatTime(sunset)}</span>
      </div>
    </div>
  );
}
