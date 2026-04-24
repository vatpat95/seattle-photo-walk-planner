import { formatDate } from '../../utils/formatters';

export default function Header({ fetchedAt, onReload }) {
  const lastUpdated = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null;

  return (
    <header className="text-center pb-8 mb-2 relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-3xl">📸</span>
          <h1 className="gradient-text text-3xl sm:text-4xl font-bold tracking-tight">
            Seattle Photo Walk Planner
          </h1>
        </div>

        <p className="text-slate-400 text-sm">
          {formatDate()}
          {lastUpdated && (
            <span className="text-slate-600 ml-3">· updated {lastUpdated}</span>
          )}
        </p>
      </div>
    </header>
  );
}
