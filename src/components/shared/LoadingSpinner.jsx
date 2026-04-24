export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-5">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
      </div>
      <div className="text-center">
        <p className="text-slate-300 text-sm font-medium">Loading Seattle weather...</p>
        <p className="text-slate-600 text-xs mt-1">Fetching Open-Meteo data</p>
      </div>
    </div>
  );
}
