import { scoreColor, scoreLabel } from '../../utils/scoring';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const config = {
  emerald: { stroke: '#10b981', glow: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' },
  lime:    { stroke: '#84cc16', glow: 'drop-shadow(0 0 6px rgba(132,204,22,0.5))' },
  amber:   { stroke: '#f59e0b', glow: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' },
  red:     { stroke: '#ef4444', glow: 'drop-shadow(0 0 4px rgba(239,68,68,0.4))' },
};

export default function ScoreRing({ score, size = 80 }) {
  const color  = scoreColor(score);
  const label  = scoreLabel(score);
  const { stroke, glow } = config[color];
  const filled = CIRCUMFERENCE * (score / 100);

  return (
    <svg width={size} height={size} viewBox="0 0 100 110"
      aria-label={`Score: ${score} out of 100`}
      style={{ filter: glow }}>
      {/* Track ring */}
      <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="7" stroke="var(--border)" />
      {/* Score arc */}
      <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="7"
        stroke={stroke}
        strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Score number */}
      <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="900"
        fill="var(--text-primary)" dominantBaseline="middle">{score}</text>
      {/* /100 label */}
      <text x="50" y="62" textAnchor="middle" fontSize="9"
        fill="var(--text-muted)" dominantBaseline="middle">/100</text>
      {/* Verdict label */}
      <text x="50" y="76" textAnchor="middle" fontSize="7" fontWeight="700"
        fill={stroke} dominantBaseline="middle" letterSpacing="1">
        {label.toUpperCase()}
      </text>
    </svg>
  );
}
