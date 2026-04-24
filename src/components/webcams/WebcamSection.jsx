import WebcamFeed from './WebcamFeed';
import { WEBCAMS } from '../../constants/locations';

export default function WebcamSection({ timestamp }) {
  const nextRefresh = new Date(timestamp + 5 * 60 * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-white font-semibold">📡 Live Webcams</h2>
          <p className="text-slate-600 text-xs mt-0.5">See conditions right now before heading out</p>
        </div>
        <span className="text-slate-600 text-xs bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full">
          Refreshes at {nextRefresh}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WEBCAMS.map(cam => (
          <WebcamFeed key={cam.id} webcam={cam} timestamp={timestamp} />
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-3 text-center">
        <p className="text-slate-600 text-xs">
          More cameras:{' '}
          <a href="https://www.spaceneedle.com/webcam" target="_blank" rel="noopener noreferrer"
            className="text-sky-600 hover:text-sky-400 transition-colors">Space Needle</a>
          {' · '}
          <a href="https://wsdot.com/travel/real-time/mountainpasses/Snoqualmie" target="_blank" rel="noopener noreferrer"
            className="text-sky-600 hover:text-sky-400 transition-colors">Snoqualmie Pass (WSDOT)</a>
          {' · '}
          <a href="https://www.nps.gov/mora/learn/photosmultimedia/webcams.htm" target="_blank" rel="noopener noreferrer"
            className="text-sky-600 hover:text-sky-400 transition-colors">All NPS Rainier Cams</a>
        </p>
      </div>
    </div>
  );
}
