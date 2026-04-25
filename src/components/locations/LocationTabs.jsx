import { useRef, useState, useEffect } from 'react';

const MAIN_TABS = [
  { id: 'city',      label: 'City & Urban',   icon: '🏙️' },
  { id: 'viewpoint', label: 'Viewpoints',     icon: '🔭' },
  { id: 'nature',    label: 'Nature & Hiking', icon: '🌿' },
];

function useScrollArrow(ref) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setShow(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [ref]);
  return show;
}

export default function LocationTabs({
  activeTab, onTabChange, counts = {},
  scoredLocations = [], activeSubcategory, onSubcategoryChange,
}) {
  const tabsRef     = useRef(null);
  const showTabArrow = useScrollArrow(tabsRef);

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
      <div className="relative">
        <div ref={tabsRef}
          className="flex gap-1.5 bg-surface rounded-2xl p-1.5 border border-border overflow-x-auto scrollbar-hide">
          {MAIN_TABS.map(tab => (
            <button key={tab.id} onClick={() => onTabChange(tab.id)}
              className={`shrink-0 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                          text-sm font-medium transition-all duration-200 whitespace-nowrap
                          ${activeTab === tab.id
                            ? 'bg-gold-dim text-gold border border-gold/30 shadow-inner'
                            : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
                          }`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {counts[tab.id] != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-gold/20 text-gold' : 'bg-surface text-text-muted'
                }`}>{counts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>

        {showTabArrow && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 bg-bg-elevated/90 border border-border rounded-full px-2 py-1 shadow-lg">
            <span className="text-text-secondary text-xs font-medium">more</span>
            <span className="text-text-secondary text-sm">›</span>
          </div>
        )}
      </div>

      {/* Subcategory filter chips */}
      {subcategories.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {subcategories.map(sub => (
            <button key={sub} onClick={() => onSubcategoryChange(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                activeSubcategory === sub
                  ? 'bg-surface-hover text-text-primary border-border'
                  : 'bg-transparent text-text-muted border-border-subtle hover:text-text-secondary hover:border-border'
              }`}>
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
