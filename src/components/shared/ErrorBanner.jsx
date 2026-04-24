export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-2xl bg-red-950/50 border border-red-500/20 p-6 text-center space-y-3">
      <div className="text-3xl">⚠️</div>
      <p className="text-red-300 font-medium text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="px-5 py-2 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors">
          Try again
        </button>
      )}
    </div>
  );
}
