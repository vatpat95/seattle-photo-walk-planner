import { useState } from 'react';
import ScoreRing from '../shared/ScoreRing';
import { scoreColor } from '../../utils/scoring';

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

export default function LocationCard({ location, score, conditions, isGoldenHour }) {
  const [imgError, setImgError] = useState(false);
  const color = scoreColor(score);
  const ring = ringColors[color];
  const showGoldenBanner = isGoldenHour && location.category !== 'city';
  const { cloudCover, precipProb, windMph, visibilityKm } = conditions;
  const gradient = categoryGradients[location.category] ?? 'from-slate-800 to-slate-900';

  return (
    <div className={`group rounded-2xl bg-[#0c0d14] ring-1 ${ring} overflow-hidden card-hover flex flex-col`}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-slate-900">
        {showGoldenBanner && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold text-center py-1 tracking-wider">
            ✨ GOLDEN HOUR NOW
          </div>
        )}
        {!imgError && location.image ? (
          <img src={location.image} alt={location.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            onError={() => setImgError(true)} />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-end p-3`}>
            <span className="text-slate-600 text-xs">{location.subcategory}</span>
          </div>
        )}
        {/* gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-[#0c0d14]/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-slate-500 text-xs bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.06]">
                {location.subcategory}
              </span>
              {location.distanceMiles > 0 && (
                <span className="text-slate-600 text-xs">{location.distanceMiles} mi</span>
              )}
            </div>
            <h3 className="text-white font-semibold text-sm leading-snug">{location.name}</h3>
          </div>
          <div className="shrink-0">
            <ScoreRing score={score} size={68} />
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed">{location.notes}</p>

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
      </div>
    </div>
  );
}

function StatPill({ children }) {
  return (
    <span className="bg-white/[0.05] border border-white/[0.07] text-slate-400 text-xs px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}
