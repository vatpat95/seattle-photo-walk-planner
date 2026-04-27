import { useState } from 'react';
import ScoreRing from '../shared/ScoreRing';
import { scoreColor, getScoreFactors } from '../../utils/scoring';
import { useWikipediaImage } from '../../hooks/useWikipediaImage';
import { buildFlickrUrl } from '../../utils/formatters';

const ringColors = {
  emerald: 'ring-emerald-500/20',
  lime:    'ring-lime-500/20',
  amber:   'ring-amber-500/20',
  red:     'ring-red-500/10',
};

const categoryGradients = {
  city:      'from-slate-800 to-slate-900',
  viewpoint: 'from-indigo-950 to-slate-900',
  nature:    'from-emerald-950 to-slate-900',
};

const ratingConfig = {
  excellent: { label: 'Excellent', cls: 'text-emerald-500 bg-emerald-500/10' },
  good:      { label: 'Good',      cls: 'text-lime-500 bg-lime-500/10' },
  fair:      { label: 'Fair',      cls: 'text-amber-500 bg-amber-500/10' },
  poor:      { label: 'Poor',      cls: 'text-red-400 bg-red-500/10' },
};

export default function LocationCard({ location, score, conditions, isGoldenHour, lightQuality = 'normal' }) {
  const [imgError, setImgError]     = useState(false);
  const [imgLoaded, setImgLoaded]   = useState(false);
  const [showFactors, setShowFactors] = useState(false);

  const imageUrl = useWikipediaImage(location.wikiTitle);
  const color    = scoreColor(score);
  const ring     = ringColors[color];
  const showGoldenBanner = isGoldenHour && location.category !== 'city';
  const { cloudCover, precipProb, windMph, visibilityKm } = conditions;
  const gradient = categoryGradients[location.category] ?? 'from-slate-800 to-slate-900';
  const factors  = showFactors ? getScoreFactors(location, conditions, lightQuality) : null;

  return (
    <div id={`loc-${location.id}`} className={`group rounded-2xl bg-bg-card ring-1 ${ring} overflow-hidden card-hover flex flex-col`}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-bg-elevated">
        {showGoldenBanner && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold text-center py-1 tracking-wider">
            ✨ GOLDEN HOUR NOW
          </div>
        )}
        {!imgLoaded && !imgError && imageUrl && (
          <div className="absolute inset-0 bg-surface animate-pulse" />
        )}
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={location.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imgLoaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-end p-3`}>
            <span className="text-text-faint text-xs">{location.subcategory}</span>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, color-mix(in srgb, var(--bg-card) 30%, transparent) 50%, transparent 100%)' }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-text-muted text-xs bg-surface px-2 py-0.5 rounded-full border border-border">
                {location.subcategory}
              </span>
              {location.distanceMiles > 0 && (
                <span className="text-text-faint text-xs">{location.distanceMiles} mi</span>
              )}
            </div>
            <h3 className="text-text-primary font-semibold text-sm leading-snug">{location.name}</h3>
          </div>
          <div className="shrink-0">
            <ScoreRing score={score} size={68} />
          </div>
        </div>

        <p className="text-text-muted text-xs leading-relaxed">{location.notes}</p>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          <StatPill>☁️ {cloudCover ?? '--'}%</StatPill>
          <StatPill>🌧️ {precipProb ?? '--'}%</StatPill>
          {location.category !== 'city' && (
            <>
              <StatPill>👁️ {visibilityKm != null ? `${Math.round(visibilityKm)}km` : '--'}</StatPill>
              <StatPill>💨 {windMph != null ? `${Math.round(windMph)}mph` : '--'}</StatPill>
            </>
          )}
        </div>

        {/* Score breakdown toggle */}
        <button
          onClick={() => setShowFactors(f => !f)}
          className="text-text-faint text-[10px] hover:text-text-muted transition-colors w-fit -mt-1"
        >
          {showFactors ? '▴ Hide breakdown' : '▾ Score breakdown'}
        </button>

        {/* Score factors */}
        {showFactors && factors && (
          <div className="border-t border-border-subtle pt-2.5 space-y-2">
            {factors.map(f => {
              const { label: rLabel, cls } = ratingConfig[f.rating];
              return (
                <div key={f.label} className="flex items-baseline gap-2 text-xs">
                  <span className="text-text-muted w-[5.5rem] shrink-0 leading-tight">{f.label}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${cls}`}>
                    {rLabel}
                  </span>
                  <span className="text-text-faint leading-tight">{f.description}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Links */}
        <div className="mt-auto pt-2 flex items-center gap-4 flex-wrap">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors w-fit"
            style={{ color: 'var(--cyan)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--cyan)'}
          >
            <span>📍</span> Get Directions
          </a>
          <a
            href={buildFlickrUrl(location.name)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors w-fit"
            style={{ color: 'var(--violet)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--violet-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--violet)'}
          >
            <span>🎨</span> Inspire Me
          </a>
        </div>
      </div>
    </div>
  );
}

function StatPill({ children }) {
  return (
    <span className="bg-surface border border-border text-text-muted text-xs px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}
