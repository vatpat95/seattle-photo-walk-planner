const TABS = [
  { id: 'city',      label: 'City & Urban',      icon: '🏙️' },
  { id: 'viewpoint', label: 'Viewpoints',         icon: '🔭' },
  { id: 'nature',    label: 'Nature & Hiking',    icon: '🌿' },
];

export default function LocationTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="flex gap-1.5 bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.06]">
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-inner'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
          }`}>
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          {counts[tab.id] != null && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-sky-500/30 text-sky-300' : 'bg-white/[0.07] text-slate-500'
            }`}>{counts[tab.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
