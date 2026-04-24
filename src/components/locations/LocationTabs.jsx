const MAIN_TABS = [
  { id: 'city',      label: 'City & Urban',   icon: '🏙️' },
  { id: 'viewpoint', label: 'Viewpoints',     icon: '🔭' },
  { id: 'nature',    label: 'Nature & Hiking', icon: '🌿' },
];

export default function LocationTabs({
  activeTab, onTabChange, counts = {},
  scoredLocations = [], activeSubcategory, onSubcategoryChange,
}) {
  // Derive subcategories for the current tab
  const subcategories = [
    'All',
    ...Array.from(
      new Set(
        scoredLocations
          .filter(l => l.category === activeTab)
          .map(l => l.subcategory)
          .filter(Boolean)
      )
    ),
  ];

  return (
    <div className="space-y-3">
      {/* Main category tabs */}
      <div className="flex gap-1.5 bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.06] overflow-x-auto scrollbar-hide">
        {MAIN_TABS.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`flex-1 shrink-0 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-inner'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
            }`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {counts[tab.id] != null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-sky-500/30 text-sky-300' : 'bg-white/[0.07] text-slate-500'
              }`}>{counts[tab.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Subcategory filter chips */}
      {subcategories.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {subcategories.map(sub => (
            <button key={sub} onClick={() => onSubcategoryChange(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                activeSubcategory === sub
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-transparent text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/[0.12]'
              }`}>
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
