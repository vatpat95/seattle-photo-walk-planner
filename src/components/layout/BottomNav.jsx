const NAV_ITEMS = [
  { id: 'dashboard', icon: '☀️', label: 'Conditions' },
  { id: 'locations', icon: '📍', label: 'Locations' },
  { id: 'webcams',   icon: '📡', label: 'Webcams' },
  { id: 'guide',     icon: 'ℹ️', label: 'Guide' },
];

export default function BottomNav({ activeView, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden
                 bg-bg-elevated/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5
                        py-2 touch-target text-[10px] font-semibold tracking-wide
                        transition-colors duration-150
                        ${isActive
                          ? 'text-gold'
                          : 'text-text-muted hover:text-text-secondary'
                        }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gold" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
