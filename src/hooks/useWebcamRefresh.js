import { useState, useEffect, useCallback } from 'react';

export function useWebcamRefresh(intervalMs = 5 * 60 * 1000) {
  const [timestamp, setTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setTimestamp(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const refresh = useCallback(() => setTimestamp(Date.now()), []);

  return { timestamp, refresh };
}
