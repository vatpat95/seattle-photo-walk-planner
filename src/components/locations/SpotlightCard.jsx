import { useState } from 'react';
import { scoreColor } from '../../utils/scoring';
import { useWikipediaImage } from '../../hooks/useWikipediaImage';
import ScoreRing from '../shared/ScoreRing';

const borderColors = {
  emerald: 'border-emerald-500/40',
  lime:    'border-lime-500/40',
  amber:   'border-amber-500/40',
  red:     'border-red-500/30',
};

export default function SpotlightCard({
  location,
  isGoldenHour,
  label = "Today's Top Pick",
  reasons = [],
  timeWindow = null,
  onViewDetails = null,
}) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = useWikipediaImage(location.wikiTitle);
  const color    = scoreColor(location.score);
  const borderCls = borderColors[color];

  return (
    <div className={`relative rounded-2xl overflow-hidden border ${borderCls} bg-bg-card card-hover`}>
      {/* Background image */}
      <div className="absolute inset-0">
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={location.name}
            className="w-full h-full object-cover opacity-25"
            onError={() => setImgError(true)}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, var(--bg-card) 40%, color-mix(in srgb, var(--bg-card) 60%, transparent) 70%, transparent 100%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative flex items-start gap-4 p-5 sm:p-6">
        <div className="shrink-0 pt-1">
          <ScoreRing score={location.score} size={80} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-gold text-[10px] font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span>★</span> {label}
            {isGoldenHour && location.category !== 'city' && (
              <span className="ml-2 text-amber-500 animate-pulse">✨ Golden Hour</span>
            )}
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight leading-snug text-text-primary">
            {location.name}
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-text-muted text-xs bg-surface border border-border px-2 py-0.5 rounded-full">
              {location.subcategory}
            </span>
            {location.distanceMiles > 0 && (
              <span className="text-text-faint text-xs">{location.distanceMiles} mi from downtown</span>
            )}
          </div>

          {/* Reason pills */}
          {reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {reasons.map((reason, i) => (
                <span
                  key={i}
                  className="text-text-muted text-[10px] bg-surface border border-border px-2 py-0.5 rounded-full leading-relaxed"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          {/* Best time window */}
          {timeWindow && (
            <p className="text-gold text-[10px] font-medium mt-2">
              ⏱ Best window: {timeWindow}
            </p>
          )}

          {/* CTAs — mobile only (desktop CTAs are in the right column) */}
          <div className="flex sm:hidden gap-2 mt-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl
                         bg-gold-dim border border-gold/30 text-gold text-[10px] font-semibold
                         hover:bg-gold/20 transition-colors"
            >
              📍 Directions
            </a>
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl
                           bg-surface border border-border text-text-secondary text-[10px] font-semibold
                           hover:bg-surface-hover transition-colors"
              >
                ↓ View details
              </button>
            )}
          </div>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex flex-col gap-2 shrink-0">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                       bg-gold-dim border border-gold/30 text-gold text-xs font-semibold
                       hover:bg-gold/20 transition-colors whitespace-nowrap"
          >
            📍 Directions
          </a>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                         bg-surface border border-border text-text-secondary text-xs font-semibold
                         hover:bg-surface-hover transition-colors whitespace-nowrap"
            >
              ↓ View details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
