import { formatDate } from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ fetchedAt }) {
  const { isDark } = useTheme();
  const lastUpdated = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null;

  return (
    <header className="relative pb-8 mb-2">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[32rem] h-40
                      blob-gold rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle — top right */}
      <div className="absolute top-0 right-0 z-10">
        <ThemeToggle />
      </div>

      {/* Hero text — centered */}
      <div className="relative text-center pt-4">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">
          Seattle · Photography Conditions
        </p>

        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl sm:text-4xl" role="img" aria-label="Camera">📸</span>
          <h1 className={`font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight
                          ${isDark ? 'gradient-text-dark' : 'gradient-text-light'}`}>
            Photo Walk Planner
          </h1>
        </div>

        <p className="text-text-secondary text-sm font-medium">
          {formatDate()}
          {lastUpdated && (
            <span className="text-text-faint ml-3">· updated {lastUpdated}</span>
          )}
        </p>
      </div>
    </header>
  );
}
