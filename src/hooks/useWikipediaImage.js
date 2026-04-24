import { useState, useEffect } from 'react';

// Module-level cache so each article is only fetched once per session
const cache = {};

export function useWikipediaImage(wikiTitle) {
  const [imageUrl, setImageUrl] = useState(cache[wikiTitle] ?? null);

  useEffect(() => {
    if (!wikiTitle) return;
    if (cache[wikiTitle]) { setImageUrl(cache[wikiTitle]); return; }

    const controller = new AbortController();

    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
      { signal: controller.signal }
    )
      .then(r => r.json())
      .then(data => {
        // Prefer originalimage for higher resolution, fall back to thumbnail
        const url = data.originalimage?.source || data.thumbnail?.source;
        if (url) {
          cache[wikiTitle] = url;
          setImageUrl(url);
        } else {
          cache[wikiTitle] = null; // mark as checked so we don't retry
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [wikiTitle]);

  return imageUrl;
}
