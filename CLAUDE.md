# CLAUDE.md — Instructions for Claude Code Sessions

> This file gives Claude Code the context it needs to work productively in this repo without re-learning the architecture every session. Read it before making non-trivial changes.

---

## Project Purpose

**Seattle Photo Walk Planner** is a zero-backend React SPA that scores ~45 Seattle-area photography locations against the current hour's weather and tells the user where and when to shoot. It fetches weather from Open-Meteo (free, no key), runs everything client-side, caches in `localStorage`, and deploys to Vercel.

**Users are photographers** — the UX must be scannable in under 5 seconds ("Is today a city day or a nature day?"). Avoid clutter, avoid jargon.

---

## Architecture at a Glance

```
main.jsx
  └── <App />                             src/App.jsx — top-level state + layout
        ├── useWeatherData()              src/hooks/useWeatherData.js
        │     └── Open-Meteo API × 2 (Seattle + Rainier), cached 5 min in localStorage
        ├── Header / Footer               src/components/layout/
        ├── DayVerdictBanner              three category scores (city/viewpoint/nature)
        ├── ConditionsSummary             temp, cloud, wind, rain, visibility chips
        ├── SunTimeline                   sunrise → now → sunset bar
        ├── DayForecast                   72-hour hourly scroller
        ├── LocationTabs + LocationGrid   browseable, filterable, scored cards
        └── WebcamSection                 6 live image feeds, 5-min refresh
```

**Data flow per render:**

1. `useWeatherData` returns `{ seattleData, rainierData, currentHourIndex, todayIndex, loading, error, fetchedAt, isStale, reload }`.
2. `App.jsx` extracts the current hour's slice for each location via `extractHourlySlice()`.
3. `scoreCityLocation(slice)` or `scoreNatureLocation(slice, lightQuality)` returns 0–100.
4. Locations flow into `LocationGrid` filtered by the active tab/subcategory.
5. Category averages flow into `DayVerdictBanner`.

---

## Module Responsibilities

### Entry points

- **`src/main.jsx`** — Mounts `<App />` in `StrictMode`, wraps in Vercel `<Analytics />`. Do not add business logic here.
- **`src/App.jsx`** — Orchestration only: owns `activeView`, `activeTab`, `activeSubcategory`. Delegates all data fetching to hooks and all UI to components.

### Hooks (`src/hooks/`)

- **`useWeatherData.js`** — All Open-Meteo fetching + localStorage caching lives here. Exports the hook plus stateless helpers `deriveConditions` and `extractHourlySlice`. **No other file should call Open-Meteo directly.**
- **`useWebcamRefresh.js`** — Returns `{ timestamp, refresh }`. Auto-ticks every 5 min; `refresh()` is the manual button.
- **`useWikipediaImage.js`** — Fetches a Wikipedia Commons thumbnail by `wikiTitle`. Used inside `LocationCard` only.

### Utils (`src/utils/`) — pure functions, no React

- **`scoring.js`** — `scoreCityLocation`, `scoreNatureLocation`, `scoreAstroLocation`, `getLightQuality`, `scoreColor`, `scoreLabel`, `average`. **All scoring rules live here. Do not inline scoring logic in components.**
- **`weatherHelpers.js`** — `describeWmoCode`, `findCurrentHourIndex`, `findTodayIndex`.
- **`timezone.js`** — Seattle-local time helpers. Use these instead of raw `Date` arithmetic so DST behaves correctly.
- **`formatters.js`** — Display-layer formatting. Components should use these rather than building strings inline.

### Components (`src/components/`) — organized by domain

- **`dashboard/`** — DayVerdictBanner, ConditionsSummary, DayForecast, SunTimeline
- **`locations/`** — LocationTabs, LocationGrid, LocationCard
- **`webcams/`** — WebcamSection, WebcamFeed
- **`layout/`** — Header, Footer
- **`shared/`** — ScoreRing, WeatherIcon, LoadingSpinner, ErrorBanner
- **`feedback/`** — FeedbackButton (Web3Forms)

### Constants (`src/constants/`)

- **`locations.js`** — The single source of truth for what the app ranks. Two exports: `LOCATIONS` (array of ~45 curated spots) and `WEBCAMS` (6 live feeds). See **Adding a new location** below for the required shape.

---

## Key Design Decisions

### Why Open-Meteo (not OpenWeather / NWS)?
Open-Meteo is **free**, has **no rate limits** for light usage, and requires **no API key**. It returns hourly cloud cover, visibility, precipitation probability, wind, UV, and weather code in one call. The 5-min localStorage cache keeps load trivial and protects against bursty refreshes.

### Why client-side only?
The app has no user accounts, no persistent state that matters beyond one session, and no server-side secrets worth hiding. A static bundle on Vercel + browser cache is cheaper, faster, and simpler than any backend we'd design. If a scraping/aggregation layer becomes necessary (e.g., scoring becomes expensive), a Vercel cron could write a single JSON blob to KV — we don't need that yet.

### Why three independent category scores?
Previously the app averaged *all* location scores into a single "day verdict." That number was misleading because viewpoint locations (which score well in clear weather) would hide poor nature scores when skies were hazy, and vice versa. Separating city/viewpoint/nature averages makes the verdict actionable — you can see at a glance which category is having its moment today.

### Why separate `scoreCityLocation` and `scoreNatureLocation`?
They reward **opposite** weather. Street photography benefits from overcast, diffuse light and no rain. Landscape photography needs clear skies and long visibility. One unified formula couldn't capture both without washing out.

### Why a versioned localStorage key (`spwp_weather_v1`)?
So we can bump the version and silently invalidate old cache entries when the shape of cached data changes — no user action required.

### Why Tailwind v4 (not v3)?
v4's Vite plugin has zero-config CSS generation and much faster HMR. No `tailwind.config.js` needed — tokens are set with `@theme` in `index.css`. Utilities like `scrollbar-hide` and `card-hover` are defined in `@layer utilities`.

---

## Conventions

### Styling

- Tailwind utility classes only. No CSS modules, no styled-components.
- Dark theme only. Background anchor: `bg-[#04040a]`. Primary text: `text-slate-200` / `text-white`. Accents: `text-sky-400`, `text-amber-400`, `text-emerald-400`.
- Match existing radius scale: cards `rounded-2xl`, chips/pills `rounded-full`, badges `rounded-xl`.
- Scrollable rows that might overflow **must** use the `useScrollArrow` pattern (see `LocationTabs.jsx`) so users can tell there's more.

### State & hooks

- **No global state library.** `App.jsx` owns top-level UI state; everything else is props.
- **`useMemo`** around any derived array/object passed to children (scored locations, averages, tab counts).
- **`useCallback`** around handlers only when they're passed into memoized children or effect dep arrays.

### Naming

- Components: `PascalCase.jsx`, one component per file, default-exported.
- Hooks: `useCamelCase.js`, always start with `use`.
- Utils: lowercase file, named exports only.
- Constants: `UPPER_SNAKE_CASE` inside files.

### Comments

Default to no comments. Add one only when the *why* is non-obvious (a constraint, a workaround, a subtle invariant). Don't narrate what the code does — identifiers should do that.

---

## How to Work on This Project

### When adding a new location

Append an entry to `LOCATIONS` in `src/constants/locations.js`:

```js
{
  id: 'kerry-park',              // kebab-case, must be unique
  name: 'Kerry Park',
  category: 'viewpoint',         // 'city' | 'viewpoint' | 'nature'
  subcategory: 'City Skyline',   // see existing list; stays within the category
  lat: 47.6295,
  lng: -122.3596,
  distanceMiles: 3,              // from downtown Seattle
  notes: 'Best at blue hour for skyline + Mt Rainier.',
  wikiTitle: 'Kerry_Park_(Seattle)',  // for Wikipedia image lookup — optional
}
```

**Rainier-adjacent locations** (IDs `rainier-paradise`, `rainier-reflection`, `rainier-tipsoo`) are scored against Rainier-specific weather instead of Seattle's. If you add another Rainier location, also add its id to `RAINIER_IDS` in `App.jsx`.

### When adjusting scoring

All rules live in `src/utils/scoring.js`. Keep the functions pure (no side effects, no React). If you change inputs, update `extractHourlySlice` in `useWeatherData.js` so the slice includes every field scoring needs.

Always re-check that scores still cover the full 0–100 range on both sunny and rainy days — tests happen by eye right now.

### When changing cached data shape

If you change what `fetchLocation` returns, or add a new field `deriveConditions`/`extractHourlySlice` reads, **bump `CACHE_KEY`** in `useWeatherData.js` (`'spwp_weather_v1'` → `'spwp_weather_v2'`) so users aren't stuck with incompatible cached payloads.

### When adding an external dependency

Only add to `dependencies` if it runs in the browser bundle. Everything else goes in `devDependencies`. Prefer zero-dep solutions — this is a small app and bundle size matters.

### When touching the UI

- Test on **mobile width** (≤ 420 px) first. The app is mobile-first; desktop is just the two-column layout above 1024 px.
- Any horizontally-scrolling container needs a visible affordance (see `LocationTabs` + `ConditionsSummary` for the pattern).
- Run `npm run build` before considering a UI change done — Tailwind v4's JIT can surprise you.

### When debugging weather issues

- Check the network tab for the Open-Meteo URLs. Both Seattle (47.6062, -122.3321) and Rainier (46.7852, -121.7368) should fire on a cold load.
- `localStorage.getItem('spwp_weather_v1')` shows the cached payload. Delete the key to force a refetch.
- `findCurrentHourIndex` uses Seattle-local time via `getNowSeattleIso()` — if the "current" hour looks wrong in another timezone, this is why.

---

## Environment & Commands

```bash
# local dev
npm install
npm run dev            # http://localhost:5173

# production build
npm run build          # outputs to dist/
npm run preview        # serves dist/ locally

# lint
npm run lint
```

### Env vars (all `VITE_*` prefixed)

| Var                   | Required | Purpose                                 |
| --------------------- | -------- | --------------------------------------- |
| `VITE_WEB3FORMS_KEY`  | Optional | Enables in-app feedback form            |

Set locally in `.env` (gitignored) and in the Vercel dashboard for deployments.

---

## Gotchas Worth Knowing

- **Tailwind v4 syntax** — There's no `tailwind.config.js`. Tokens go in `@theme` blocks, utilities in `@layer utilities`. Don't try to `require('tailwindcss')` in a config file.
- **React 19** — `StrictMode` runs effects twice in dev. That will appear as two Open-Meteo fetches on a cold load *in development*; it's a single fetch in production.
- **`vercel.json` SPA rewrite** is what makes refreshes on any path work. Don't delete it.
- **Date arithmetic** — Always go through `src/utils/timezone.js` helpers. `new Date()` is the user's local timezone, which breaks comparisons against Open-Meteo's `timezone: 'auto'` responses (PST/PDT).
- **Webcam images** — Some sources (e.g., NPS) serve stale cached images even with a `?t=` cache-buster. That's a server-side limitation we can't fix; the 5-min refresh is the best we can do.
- **Feedback button is hidden if `VITE_WEB3FORMS_KEY` is unset** — this is intentional and not a bug.

---

## Out of Scope (Don't Propose These)

- Server-side rendering — adds cost and complexity for zero user benefit.
- A database or user accounts — the app is anonymous by design.
- Paid weather providers — Open-Meteo is more than sufficient.
- TypeScript migration — not blocked on it; happy to take a PR but don't sprinkle half a migration.
- Non-Seattle locations — the app's tagline is "Seattle." Forks for other cities are encouraged.

---

## Reference

- Open-Meteo docs: https://open-meteo.com/en/docs
- Tailwind v4 migration: https://tailwindcss.com/docs/v4-beta
- Web3Forms: https://web3forms.com
- Vercel Analytics: https://vercel.com/docs/analytics
