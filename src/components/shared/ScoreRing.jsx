import { scoreColor } from '../../utils/scoring';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const config = {
  emerald: { stroke: '#10b981', glow: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' },
  lime:    { stroke: '#84cc16', glow: 'drop-shadow(0 0 6px rgba(132,204,22,0.5))' },
  amber:   { stroke: '#f59e0b', glow: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' },
  red:     { stroke: '#ef4444', glow: 'drop-shadow(0 0 4px rgba(239,68,68,0.4))' },
};

export default function ScoreRing({ score, size = 80 }) {
  const color = scoreColor(score);
  const { stroke, glow } = config[color];
  const filled = CIRCUMFERENCE * (score / 100);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`Score: ${score} out of 100`}
      style={{ filter: glow }}>
      <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="7" stroke="rgba(255,255,255,0.06)" />
      <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="7"
        stroke={stroke}
        strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="50" y="47" textAnchor="middle" fontSize="21" fontWeight="800"
        fill="white" dominantBaseline="middle">{score}</text>
      <text x="50" y="64" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)"
        dominantBaseline="middle">/100</text>
    </svg>
  );
}
