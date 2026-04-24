import LocationCard from './LocationCard';

export default function LocationGrid({ scoredLocations, activeTab, isGoldenHour }) {
  const filtered = scoredLocations
    .filter(l => l.category === activeTab)
    .sort((a, b) => b.score - a.score);

  if (!filtered.length) {
    return (
      <div className="text-center py-16 text-slate-600">
        <p className="text-3xl mb-3">📍</p>
        <p className="text-sm">No locations in this category.</p>
      </div>
    );
  }

  // Group by subcategory
  const groups = filtered.reduce((acc, loc) => {
    const key = loc.subcategory ?? 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([subcategory, locs]) => (
        <div key={subcategory}>
          <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="h-px flex-1 bg-white/[0.05]" />
            {subcategory}
            <span className="h-px flex-1 bg-white/[0.05]" />
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locs.map(loc => (
              <LocationCard
                key={loc.id}
                location={loc}
                score={loc.score}
                conditions={loc.conditions}
                isGoldenHour={isGoldenHour}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
