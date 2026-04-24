import { formatTime } from '../../utils/formatters';
import { getLightQuality } from '../../utils/scoring';

export default function SunTimeline({ sunrise, sunset }) {
  if (!sunrise || !sunset) return null;

  const now = Date.now();
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const totalMs = sunsetMs - sunriseMs;
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const pct = (ms) => clamp(((ms - sunriseMs) / totalMs) * 100);

  const nowPct = pct(now);
  const goldenEndMorn = pct(sunriseMs + 60 * 60 * 1000);
  const goldenStartEve = pct(sunsetMs - 60 * 60 * 1000);
  const blueEndEve = pct(sunsetMs + 30 * 60 * 1000);
  const blueStartMorn = pct(sunriseMs - 30 * 60 * 1000);

  const lightQuality = getLightQuality(now, sunriseMs, sunsetMs);
  const isBeforeSunrise = now < sunriseMs;
  const isAfterSunset = now > sunsetMs + 30 * 60 * 1000;

  const lightLabel = lightQuality === 'golden'
    ? '✨ Golden Hour — ideal for nature shots'
    : lightQuality === 'blue'
    ? '💙 Blue Hour — magical city light'
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Sun Timeline</span>
        {lightLabel && (
          <span className="text-amber-400 text-xs font-semibold animate-pulse">{lightLabel}</span>
        )}
      </div>

      <div className="relative h-5 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        {/* morning golden zone */}
        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-600/50 to-amber-500/30"
          style={{ left: '0%', width: `${goldenEndMorn}%` }} />
        {/* midday */}
        <div className="absolute top-0 bottom-0 bg-sky-900/20"
          style={{ left: `${goldenEndMorn}%`, width: `${goldenStartEve - goldenEndMorn}%` }} />
        {/* evening golden zone */}
        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500/30 to-amber-600/60"
          style={{ left: `${goldenStartEve}%`, width: `${100 - goldenStartEve}%` }} />
        {/* now marker */}
        {!isBeforeSunrise && !isAfterSunset && (
          <div className="absolute top-0.5 bottom-0.5 w-0.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.4)]"
            style={{ left: `calc(${nowPct}% - 1px)` }} />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="text-slate-400">🌅 {formatTime(sunrise)}</span>
        <div className="flex gap-3">
          <span className="text-amber-600/80">■ Golden hour</span>
        </div>
        <span className="text-slate-400">🌇 {formatTime(sunset)}</span>
      </div>
    </div>
  );
}
