import { useRef, useState, useEffect } from 'react';
import { describeWmoCode } from '../../utils/weatherHelpers';
import { formatTemp, formatVisibility } from '../../utils/formatters';

function Stat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/[0.04] rounded-xl border border-white/[0.07] px-4 py-3 min-w-[80px]">
      <span className="text-xl">{icon}</span>
      <span className="text-white font-semibold text-sm tabular-nums">{value}</span>
      <span className="text-slate-500 text-xs">{label}</span>
    </div>
  );
}

export default function ConditionsSummary({ conditions }) {
  if (!conditions) return null;
  const { temp, cloudCover, windMph, precipProb, visibilityKm, wmoCode } = conditions;
  const { label } = describeWmoCode(wmoCode ?? 0);

  const scrollRef = useRef(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Current Conditions</span>
        <span className="text-slate-600 text-xs">·</span>
        <span className="text-slate-400 text-xs">{label}</span>
      </div>

      <div className="relative">
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <Stat icon="🌡️" label="Feels like"  value={formatTemp(temp)} />
          <Stat icon="☁️"  label="Cloud cover" value={`${cloudCover ?? '--'}%`} />
          <Stat icon="💨"  label="Wind"        value={windMph != null ? `${Math.round(windMph)} mph` : '--'} />
          <Stat icon="🌧️" label="Rain chance" value={`${precipProb ?? '--'}%`} />
          <Stat icon="👁️" label="Visibility"  value={formatVisibility((visibilityKm ?? 15) * 1000)} />
        </div>

        {/* Scroll arrow indicator */}
        {showArrow && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 bg-slate-800/90 border border-white/10 rounded-full px-2 py-1 shadow-lg">
            <span className="text-slate-300 text-xs font-medium">scroll</span>
            <span className="text-slate-300 text-sm">›</span>
          </div>
        )}
      </div>
    </div>
  );
}
