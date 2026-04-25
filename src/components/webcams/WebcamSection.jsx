import WebcamFeed from './WebcamFeed';
import { WEBCAMS } from '../../constants/locations';

export default function WebcamSection({ timestamp, onRefresh }) {
  const nextRefresh = new Date(timestamp + 5 * 60 * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-text-primary font-semibold">📡 Live Webcams</h2>
          <p className="text-text-muted text-xs mt-0.5">Tap any camera to open its source page</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs bg-surface border border-border px-3 py-1 rounded-full">
            Auto-refresh at {nextRefresh}
          </span>
          <button onClick={onRefresh}
            className="text-cyan text-xs font-semibold bg-cyan-dim border border-cyan/20 hover:bg-cyan/20 px-3 py-1 rounded-full transition-colors">
            ↻ Refresh now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WEBCAMS.map(cam => (
          <WebcamFeed key={cam.id} webcam={cam} timestamp={timestamp} />
        ))}
      </div>

      <div className="rounded-xl bg-surface border border-border-subtle px-4 py-3 text-center">
        <p className="text-text-muted text-xs">
          More cameras:{' '}
          <a href="https://www.spaceneedle.com/webcam" target="_blank" rel="noopener noreferrer"
            className="text-cyan hover:text-cyan-muted transition-colors">Space Needle</a>
          {' · '}
          <a href="https://wsdot.com/travel/real-time/mountainpasses/Snoqualmie" target="_blank" rel="noopener noreferrer"
            className="text-cyan hover:text-cyan-muted transition-colors">Snoqualmie Pass (WSDOT)</a>
          {' · '}
          <a href="https://www.nps.gov/mora/learn/photosmultimedia/webcams.htm" target="_blank" rel="noopener noreferrer"
            className="text-cyan hover:text-cyan-muted transition-colors">All NPS Rainier Cams</a>
        </p>
      </div>
    </div>
  );
}
