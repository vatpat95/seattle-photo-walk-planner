import { useState, useMemo } from 'react';
import { scoreCityLocation, scoreNatureLocation, getLightQuality, scoreColor } from '../../utils/scoring';
import { extractHourlySlice } from '../../hooks/useWeatherData';

function fmt12(hour) {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

function findBestWindow(hourlyScores, threshold) {
  let best = null;
  let current = null;

  for (let i = 0; i < hourlyScores.length; i++) {
    if (hourlyScores[i] >= threshold) {
      if (!current) current = { start: i, end: i, maxScore: hourlyScores[i] };
      else { current.end = i; current.maxScore = Math.max(current.maxScore, hourlyScores[i]); }
    } else {
      if (current) {
        if (!best || current.maxScore > best.maxScore) best = current;
        current = null;
      }
    }
  }
  if (current && (!best || current.maxScore > best.maxScore)) best = current;
  return best;
}

export default function DayForecast({ seattleData, todayIndex, currentHourIndex }) {
  const [open, setOpen] = useState(false);

  const { hours, cityScores, natureScores, sunrise, sunset } = useMemo(() => {
    if (!seattleData) return { hours: [], cityScores: [], natureScores: [], sunrise: null, sunset: null };

    const baseIdx = todayIndex * 24;
    const sunriseStr = seattleData.daily.sunrise?.[todayIndex];
    const sunsetStr = seattleData.daily.sunset?.[todayIndex];
    const sunriseMs = sunriseStr ? new Date(sunriseStr).getTime() : null;
    const sunsetMs = sunsetStr ? new Date(sunsetStr).getTime() : null;

    const hours = [];
    const cityScores = [];
    const natureScores = [];

    for (let h = 0; h < 24; h++) {
      const idx = baseIdx + h;
      const slice = extractHourlySlice(seattleData, idx);
      const hourMs = sunriseMs
        ? new Date(seattleData.hourly.time?.[idx] ?? 0).getTime()
        : null;
      const light = sunriseMs && sunsetMs && hourMs
        ? getLightQuality(hourMs, sunriseMs, sunsetMs)
        : 'normal';

      hours.push(h);
      cityScores.push(scoreCityLocation(slice));
      natureScores.push(scoreNatureLocation(slice, light));
    }

    return { hours, cityScores, natureScores, sunrise: sunriseStr, sunset: sunsetStr };
  }, [seattleData, todayIndex]);

  const cityWindow = useMemo(() => findBestWindow(cityScores, 65), [cityScores]);
  const natureWindow = useMemo(() => findBestWindow(natureScores, 55), [natureScores]);

  const todayHour = currentHourIndex % 24;

  if (!seattleData) return null;

  const sunriseHour = sunrise ? new Date(sunrise).getHours() : 6;
  const sunsetHour = sunset ? new Date(sunset).getHours() : 20;

  return (
    <div className="rounded-2xl bg-[#0c0d14] border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🗓️</span>
          <span className="text-sm font-semibold text-white">Today's Best Windows</span>
          {!open && cityWindow && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              City: {fmt12(cityWindow.start)}–{fmt12(cityWindow.end + 1)}
              {natureWindow ? ` · Nature: ${fmt12(natureWindow.start)}–${fmt12(natureWindow.end + 1)}` : ''}
            </span>
          )}
        </div>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Hour bars */}
          <div>
            <div className="flex items-end gap-0.5 h-14">
              {hours.map(h => {
                const cityS = cityScores[h];
                const natureS = natureScores[h];
                const isCurrent = h === todayHour;
                const isDark = h < sunriseHour || h > sunsetHour;
                const cityCol = scoreColor(cityS);
                const cityBg = {
                  emerald: 'bg-emerald-500',
                  lime: 'bg-lime-500',
                  amber: 'bg-amber-500',
                  red: 'bg-red-500/60',
                }[cityCol];

                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                      <div className="font-semibold text-white">{fmt12(h)}</div>
                      <div className="text-sky-300">City {cityS}</div>
                      <div className="text-emerald-300">Nature {natureS}</div>
                    </div>
                    <div
                      className={`w-full rounded-sm transition-all ${cityBg} ${isDark ? 'opacity-30' : ''} ${isCurrent ? 'ring-1 ring-white/60' : ''}`}
                      style={{ height: `${Math.max(4, cityS * 0.52)}px` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Hour labels — show every 3 hours */}
            <div className="flex mt-1">
              {hours.map(h => (
                <div key={h} className={`flex-1 text-center text-[9px] ${h % 3 === 0 ? 'text-slate-600' : 'text-transparent'}`}>
                  {h % 3 === 0 ? fmt12(h) : '·'}
                </div>
              ))}
            </div>
          </div>

          {/* Legend + summary */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500" /> bars = city score · hover for details · dimmed = before sunrise / after sunset
            </div>
            {cityWindow && (
              <p className="text-slate-400">
                🏙️ Best city window: <span className="text-white font-medium">{fmt12(cityWindow.start)}–{fmt12(cityWindow.end + 1)}</span>
                <span className="text-slate-600 ml-1">(peak {cityWindow.maxScore})</span>
              </p>
            )}
            {natureWindow && (
              <p className="text-slate-400">
                🌿 Best nature window: <span className="text-white font-medium">{fmt12(natureWindow.start)}–{fmt12(natureWindow.end + 1)}</span>
                <span className="text-slate-600 ml-1">(peak {natureWindow.maxScore})</span>
              </p>
            )}
            {!cityWindow && !natureWindow && (
              <p className="text-slate-500">No strong photography windows today — conditions are poor.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
