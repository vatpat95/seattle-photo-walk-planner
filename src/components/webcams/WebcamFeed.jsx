import { useState, useEffect } from 'react';

export default function WebcamFeed({ webcam, timestamp }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgSrc = `${webcam.url}?t=${timestamp}`;

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [timestamp]);

  return (
    <a href={webcam.sourceUrl} target="_blank" rel="noopener noreferrer"
      className="group rounded-2xl bg-[#0c0d14] ring-1 ring-white/[0.07] hover:ring-sky-500/40 overflow-hidden card-hover flex flex-col cursor-pointer transition-all">
      <div className="relative bg-[#070709] aspect-video flex items-center justify-center overflow-hidden">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-sky-500/50 animate-spin" />
          </div>
        )}
        {error ? (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <span className="text-2xl opacity-30">📷</span>
            <p className="text-slate-600 text-xs">Camera offline</p>
            <span className="text-sky-500 text-xs underline underline-offset-2">
              View at source →
            </span>
          </div>
        ) : (
          <img src={imgSrc} alt={webcam.label}
            className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)} />
        )}
        {loaded && !error && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white/70 text-xs font-medium">LIVE</span>
          </div>
        )}
        {loaded && !error && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-full px-2 py-1 text-white/90 text-[10px] font-medium">
            Open source ↗
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-white/[0.05]">
        <p className="text-white text-xs font-semibold">{webcam.label}</p>
        <p className="text-slate-600 text-xs mt-0.5">{webcam.sublabel}</p>
      </div>
    </a>
  );
}
