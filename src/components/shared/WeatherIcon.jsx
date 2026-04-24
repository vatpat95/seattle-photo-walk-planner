import { describeWmoCode } from '../../utils/weatherHelpers';

export default function WeatherIcon({ wmoCode, size = 'text-2xl', showLabel = false }) {
  const { label, icon } = describeWmoCode(wmoCode ?? 0);
  return (
    <span className="inline-flex items-center gap-1">
      <span className={size} role="img" aria-label={label}>{icon}</span>
      {showLabel && <span className="text-zinc-400 text-sm">{label}</span>}
    </span>
  );
}
