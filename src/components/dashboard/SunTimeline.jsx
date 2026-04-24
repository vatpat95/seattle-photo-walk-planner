import { formatTime } from '../../utils/formatters';
import { getLightQuality } from '../../utils/scoring';
import { getNowSeattleMs } from '../../utils/timezone';

// Add/subtract whole hours directly in the ISO string — no Date() needed.
function addHours(isoStr, h) {
  const [date, time] = isoStr.split('T');
  const [hh, mm] = time.split(':').map(Number);
  const newHh = ((hh + h) % 24 + 24) % 24;
  return `${date}T${String(newHh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function Zone({ left, width, right, tooltip, children }) {
  return (
    <div
      className="absolute top-0 bottom-0 group/zone"
      style={right != null ? { left: `${left}%`, right: 0 } : { left: `${left}%`, width: `${width}%` }}
    >
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover/zone:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
}

export default function SunTimeline({ sunrise, sunset }) {
  if (!sunrise || !sunset) return null;

  const now         = getNowSeattleMs();
  const sunriseMs   = new Date(sunrise).getTime();
  const sunsetMs    = new Date(sunset).getTime();
  const sunriseHr   = new Date(sunrise).getHours();
  const sunsetHr    = new Date(sunset).getHours();

  // Timeline spans 4am → midnight for context
  const spanStart   = new Date(sunrise).setHours(4, 0, 0, 0);
  const spanEnd     = new Date(sunrise).setHours(24, 0, 0, 0);
  const totalSpan   = spanEnd - spanStart;
  const clamp       = v => Math.max(0, Math.min(100, v));
  const pct         = ms => clamp(((ms - spanStart) / totalSpan) * 100);

  const sunrisePct      = pct(sunriseMs);
  const sunsetPct       = pct(sunsetMs);
  const goldenEndMorn   = pct(sunriseMs + 60 * 60 * 1000);
  const goldenStartEve  = pct(sunsetMs  - 60 * 60 * 1000);
  const nowPct          = pct(now);
  const isInSpan        = now >= spanStart && now <= spanEnd;

  const lightQuality = getLightQuality(now, sunriseMs, sunsetMs);
  const lightLabel   = lightQuality === 'golden'
    ? '✨ Golden Hour — ideal for nature shots'
    : lightQuality === 'blue'
    ? '💙 Blue Hour — magical city light'
    : null;

  // Derived times for tooltips
  const goldenMornEnd = addHours(sunrise, 1);
  const goldenEveStart = addHours(sunset, -1);

  const tickHours = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  function fmt12h(h) {
    if (h === 0 || h === 24) return '12am';
    if (h === 12) return '12pm';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Sun Timeline</span>
        {lightLabel && (
          <span className="text-amber-400 text-xs font-semibold animate-pulse">{lightLabel}</span>
        )}
      </div>

      {/* Timeline bar with hoverable zones */}
      <div className="relative h-5 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-visible">
        {/* Clip inner content to rounded bounds */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Night (pre-sunrise) */}
          <div className="absolute top-0 bottom-0 left-0 bg-slate-900/60" style={{ width: `${sunrisePct}%` }} />
          {/* Morning golden */}
          <div className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-600/60 to-amber-500/30"
            style={{ left: `${sunrisePct}%`, width: `${goldenEndMorn - sunrisePct}%` }} />
          {/* Midday */}
          <div className="absolute top-0 bottom-0 bg-sky-900/20"
            style={{ left: `${goldenEndMorn}%`, width: `${goldenStartEve - goldenEndMorn}%` }} />
          {/* Evening golden */}
          <div className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500/30 to-amber-600/60"
            style={{ left: `${goldenStartEve}%`, width: `${sunsetPct - goldenStartEve}%` }} />
          {/* Night (post-sunset) */}
          <div className="absolute top-0 bottom-0 bg-slate-900/60"
            style={{ left: `${sunsetPct}%`, right: 0 }} />
          {/* Sunrise/sunset tick marks */}
          <div className="absolute top-0.5 bottom-0.5 w-px bg-amber-400/60" style={{ left: `${sunrisePct}%` }} />
          <div className="absolute top-0.5 bottom-0.5 w-px bg-amber-400/60" style={{ left: `${sunsetPct}%` }} />
          {/* Now marker */}
          {isInSpan && (
            <div className="absolute top-0 bottom-0 w-0.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.4)]"
              style={{ left: `calc(${nowPct}% - 1px)` }} />
          )}
        </div>

        {/* Tooltip zones — overflow-visible so tooltips show above bar */}
        <Zone left={0} width={sunrisePct}
          tooltip={<>🌙 <span className="font-medium">Night</span> · before {formatTime(sunrise)}</>}>
        </Zone>
        <Zone left={sunrisePct} width={goldenEndMorn - sunrisePct}
          tooltip={<>✨ <span className="font-medium">Golden Hour</span> · {formatTime(sunrise)} – {formatTime(goldenMornEnd)}</>}>
        </Zone>
        <Zone left={goldenEndMorn} width={goldenStartEve - goldenEndMorn}
          tooltip={<>☀️ <span className="font-medium">Daytime</span> · {formatTime(goldenMornEnd)} – {formatTime(goldenEveStart)}</>}>
        </Zone>
        <Zone left={goldenStartEve} width={sunsetPct - goldenStartEve}
          tooltip={<>✨ <span className="font-medium">Golden Hour</span> · {formatTime(goldenEveStart)} – {formatTime(sunset)}</>}>
        </Zone>
        <Zone left={sunsetPct} right={0}
          tooltip={<>🌙 <span className="font-medium">Night</span> · after {formatTime(sunset)}</>}>
        </Zone>
      </div>

      {/* Hour tick labels */}
      <div className="relative h-4">
        {tickHours.map(h => {
          const ms = new Date(sunrise).setHours(h, 0, 0, 0);
          const p  = pct(ms);
          const isNight = h < sunriseHr || h > sunsetHr;
          return (
            <span key={h}
              className={`absolute text-[9px] -translate-x-1/2 ${isNight ? 'text-slate-700' : 'text-slate-600'}`}
              style={{ left: `${p}%` }}>
              {fmt12h(h)}
            </span>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="text-slate-400">🌅 {formatTime(sunrise)}</span>
        <div className="flex gap-3 items-center">
          <span className="text-amber-600/80">■ Golden hour</span>
          <span className="text-slate-600/80">■ Night</span>
          <span className="text-slate-700 text-[10px]">Seattle PT</span>
        </div>
        <span className="text-slate-400">🌇 {formatTime(sunset)}</span>
      </div>
    </div>
  );
}
