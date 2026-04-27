import ScoreRing from '../shared/ScoreRing';
import { scoreColor, getLocationTags, getScoreReasons } from '../../utils/scoring';

const rankColors = ['text-amber-400', 'text-slate-400', 'text-amber-700'];

const tagColors = {
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  lime:    'bg-lime-500/10 text-lime-500 border-lime-500/20',
  amber:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
  red:     'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function TopThreeSection({ topThree, lightQuality, onViewDetails }) {
  if (!topThree?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted px-1">
        Top 3 Today
      </p>

      {topThree.map((loc, i) => {
        const color  = scoreColor(loc.score);
        const tags   = getLocationTags(loc, lightQuality);
        const reason = getScoreReasons(loc, loc.conditions, lightQuality)[0];

        return (
          <div
            key={loc.id}
            className="flex items-center gap-3 bg-bg-card border border-border rounded-2xl px-4 py-3 card-hover"
          >
            {/* Rank */}
            <span className={`font-display text-lg font-bold w-5 shrink-0 text-center ${rankColors[i]}`}>
              {i + 1}
            </span>

            {/* Score ring */}
            <div className="shrink-0">
              <ScoreRing score={loc.score} size={44} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-semibold text-sm leading-tight truncate">
                {loc.name}
              </p>
              {tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tagColors[color]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-text-faint text-[11px] mt-1 truncate">{reason}</p>
            </div>

            {/* CTA */}
            <button
              onClick={() => onViewDetails(loc)}
              className="shrink-0 text-xs font-medium text-text-muted hover:text-text-primary transition-colors whitespace-nowrap"
            >
              View →
            </button>
          </div>
        );
      })}
    </div>
  );
}
