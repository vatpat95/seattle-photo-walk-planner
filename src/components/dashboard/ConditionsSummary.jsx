import { describeWmoCode } from '../../utils/weatherHelpers';
import { formatTemp, formatVisibility } from '../../utils/formatters';

function Stat({ icon, label, value, sub }) {
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Current Conditions</span>
        <span className="text-slate-600 text-xs">·</span>
        <span className="text-slate-400 text-xs">{label}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Stat icon="🌡️" label="Feels like" value={formatTemp(temp)} />
        <Stat icon="☁️" label="Cloud cover" value={`${cloudCover ?? '--'}%`} />
        <Stat icon="💨" label="Wind" value={windMph != null ? `${Math.round(windMph)} mph` : '--'} />
        <Stat icon="🌧️" label="Rain chance" value={`${precipProb ?? '--'}%`} />
        <Stat icon="👁️" label="Visibility" value={formatVisibility((visibilityKm ?? 15) * 1000)} />
      </div>
    </div>
  );
}
