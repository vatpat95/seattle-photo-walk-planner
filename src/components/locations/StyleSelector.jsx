const STYLES = [
  { id: null,                label: 'All' },
  { id: 'landscape',         label: '🏔️ Landscape' },
  { id: 'street',            label: '🏙️ Street' },
  { id: 'architecture',      label: '🏛️ Architecture' },
  { id: 'portrait',          label: '🧍 Portrait' },
  { id: 'night',             label: '🌙 Night' },
  { id: 'rainy-moody',       label: '🌧️ Rainy / Moody' },
  { id: 'beginner-friendly', label: '📷 Beginner-Friendly' },
];

export default function StyleSelector({ selectedStyle, onStyleChange }) {
  return (
    <div className="bg-surface border border-border rounded-2xl px-4 py-3 mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted shrink-0">
        Photography Style
      </span>
      <div className="flex gap-2 flex-wrap">
        {STYLES.map(s => {
          const isReset = s.id === null;
          const isActive = selectedStyle === s.id;
          const label = isReset && selectedStyle !== null ? '✕ Clear' : s.label;
          return (
            <button
              key={String(s.id)}
              onClick={() => onStyleChange(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                isActive
                  ? 'bg-gold-dim text-gold border-gold/30'
                  : 'bg-transparent text-text-muted border-border-subtle hover:text-text-secondary hover:border-border'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
