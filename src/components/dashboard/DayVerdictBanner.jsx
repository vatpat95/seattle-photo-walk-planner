import { scoreColor, scoreLabel } from '../../utils/scoring';

const verdictConfig = {
  emerald: {
    ring: 'ring-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-400',
    bg: 'from-emerald-950/60 to-transparent',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  lime: {
    ring: 'ring-lime-500/30',
    glow: 'shadow-lime-500/20',
    text: 'text-lime-400',
    bg: 'from-lime-950/60 to-transparent',
    badge: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  },
  amber: {
    ring: 'ring-amber-500/30',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-400',
    bg: 'from-amber-950/60 to-transparent',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  red: {
    ring: 'ring-red-500/20',
    glow: 'shadow-red-500/10',
    text: 'text-red-400',
    bg: 'from-red-950/60 to-transparent',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
};

const tips = {
  city: {
    great: 'Overcast skies diffuse harsh shadows — perfect soft light for market vendors, architecture, and street scenes.',
    fair: 'Decent light for city shots. Pockets of interesting shadow and glow throughout the day.',
    poor: 'Heavy rain or dense fog ahead. Seek covered spots like Pike Place arcades or the Central Library interior.',
  },
  nature: {
    great: 'Clear skies and long visibility — mountain peaks sharp, alpine lakes glass-still for reflections.',
    fair: 'Partial clearing possible. Shoot waterfall trails and forest paths where cloud cover adds mood.',
    poor: 'Mountain views likely obscured. Rain in the forecast — consider waterfalls or misty forest scenes instead.',
  },
};

function VerdictCard({ label, score, icon }) {
  const verdict = scoreLabel(score);
  const color = scoreColor(score);
  const cfg = verdictConfig[color];

  return (
    <div className={`flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.bg} ring-1 ${cfg.ring} shadow-lg ${cfg.glow} p-6`}>
      <div className="absolute inset-0 bg-[#0c0d14]/80 rounded-2xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{icon}</span>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{label}</span>
          </div>
          <div className="flex items-end gap-2 mt-2">
            <span className={`text-6xl font-black tabular-nums ${cfg.text}`}>{score}</span>
            <span className="text-slate-600 text-lg mb-2">/100</span>
          </div>
          <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full border ${cfg.badge}`}>
            {verdict.toUpperCase()}
          </span>
        </div>
        {/* decorative arc */}
        <svg className="w-20 h-20 opacity-20 shrink-0" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" strokeWidth="6" stroke="currentColor"
            className={cfg.text}
            strokeDasharray={`${2 * Math.PI * 32 * score / 100} ${2 * Math.PI * 32}`}
            transform="rotate(-90 40 40)" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default function DayVerdictBanner({ cityScore, natureScore }) {
  const recommended = cityScore >= natureScore ? 'city' : 'nature';
  const verdict = scoreLabel(recommended === 'city' ? cityScore : natureScore).toLowerCase();
  const tip = tips[recommended][verdict] ?? tips[recommended].fair;
  const icon = recommended === 'city' ? '🏙️' : '🌲';

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-col sm:flex-row">
        <VerdictCard label="City Walk" score={cityScore} icon="🏙️" />
        <VerdictCard label="Nature / Hiking" score={natureScore} icon="🌲" />
      </div>
      <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
        <span className="text-sky-400 text-lg shrink-0 mt-0.5">{icon}</span>
        <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
      </div>
    </div>
  );
}
