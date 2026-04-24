# Seattle Photo Walk Planner

A single-page web app that tells Seattle-area photographers **where to shoot and when**, based on live weather, cloud cover, visibility, and light quality. Each of ~45 curated locations (city, viewpoints, nature) is scored 0–100 for the current hour, and the dashboard surfaces the best category window of the day at a glance.

**Live site:** [seattle-photo-walk-planner.vercel.app](https://seattle-photo-walk-planner.vercel.app)

---

## Features

- **Real-time scoring** — Every location scored 0–100 from the current hour's cloud cover, visibility, precipitation, wind, and (for nature) ambient light quality.
- **Three photography verdicts** — Independent averages for *City*, *Viewpoints*, and *Nature* so one poor category doesn't drag the others down.
- **Golden / blue hour awareness** — Nature scores get a bonus during the ±1 hr / ±30 min windows around sunrise and sunset.
- **Live webcams** — Six Mt Rainier, UW campus, and Snoqualmie Pass feeds auto-refresh every 5 minutes. Each card links to its source page.
- **3-day hourly forecast** — Scroll through the next 72 hours to plan ahead.
- **Client-side weather caching** — Open-Meteo responses cached in `localStorage` for 5 min; page refreshes within that window hit zero APIs.
- **Mobile-first responsive layout** — Sticky-sidebar on desktop, single-column on mobile, with scroll affordances so hidden tabs never stay hidden.
- **Zero backend** — Runs entirely in the browser. Deploys to any static host.

---

## Tech Stack

| Layer           | Tool                                      |
| --------------- | ----------------------------------------- |
| Framework       | React 19 + Vite 8                         |
| Styling         | Tailwind CSS v4 (Vite plugin)             |
| Weather API     | [Open-Meteo](https://open-meteo.com) — free, no key |
| Feedback        | [Web3Forms](https://web3forms.com) — free, no backend |
| Analytics       | `@vercel/analytics`                       |
| Hosting         | Vercel (static SPA)                       |
| Linting         | ESLint 10 with `react-hooks`, `react-refresh` plugins |

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/vatpat95/seattle-photo-walk-planner.git
cd seattle-photo-walk-planner
npm install

# 2. (Optional) enable the feedback button
cp .env.example .env
# Edit .env and paste your Web3Forms access key

# 3. Run the dev server
npm run dev         # http://localhost:5173
```

**No API key is required for weather** — Open-Meteo is free and unauthenticated. The feedback button stays hidden if `VITE_WEB3FORMS_KEY` is unset; everything else works out of the box.

### Available scripts

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR                      |
| `npm run build`   | Type-check-free production build to `dist/`        |
| `npm run preview` | Serve the built `dist/` locally for smoke-testing  |
| `npm run lint`    | Run ESLint over `src/`                              |

---

## Environment Variables

All runtime env vars must be prefixed `VITE_` to be exposed to the browser bundle.

| Variable               | Required | Purpose                                    |
| ---------------------- | -------- | ------------------------------------------ |
| `VITE_WEB3FORMS_KEY`   | Optional | Enables the in-app feedback form           |

Set them locally in `.env` (gitignored) or in the Vercel project's **Environment Variables** panel for deployments.

---

## Project Structure

```
seattle-photo-walk-planner/
├── public/                         static assets served as-is
├── src/
│   ├── App.jsx                     root orchestrator — owns view/tab state
│   ├── main.jsx                    React root + Vercel Analytics wrapper
│   ├── index.css                   Tailwind v4 entry + custom utilities
│   ├── components/
│   │   ├── dashboard/              DayVerdictBanner, ConditionsSummary, DayForecast, SunTimeline
│   │   ├── locations/              LocationTabs, LocationGrid, LocationCard
│   │   ├── webcams/                WebcamSection, WebcamFeed
│   │   ├── layout/                 Header, Footer
│   │   ├── feedback/               FeedbackButton (Web3Forms modal)
│   │   └── shared/                 ScoreRing, WeatherIcon, LoadingSpinner, ErrorBanner
│   ├── hooks/
│   │   ├── useWeatherData.js       Open-Meteo fetch + localStorage cache
│   │   ├── useWebcamRefresh.js     5-min interval + manual refresh
│   │   └── useWikipediaImage.js    Wikipedia Commons image lookup
│   ├── utils/
│   │   ├── scoring.js              City / nature / astro score functions
│   │   ├── weatherHelpers.js       WMO code descriptions, time-array indexing
│   │   ├── timezone.js             Seattle-local time helpers (America/Los_Angeles)
│   │   └── formatters.js           Display-layer formatting (temp, time, visibility)
│   └── constants/
│       └── locations.js            45 curated locations + 6 webcam feeds
├── vercel.json                     SPA rewrite rule
├── vite.config.js                  React + Tailwind v4 plugins
└── eslint.config.js                flat-config ESLint setup
```

---

## How the Scoring Works

Every location runs through one of two functions in `src/utils/scoring.js`, returning an integer 0–100.

### City locations — `scoreCityLocation(conditions)`
Favors **overcast, dry, visible** conditions (soft diffused light).

- Base 50
- Cloud cover 40–80% → +25  | 80–95% → +10  | <40% → +5
- Precipitation 0 mm → +15  | ≤0.5 mm → +10  | >2 mm → −20
- Rain probability <20% → +10  | <50% → +5  | >75% → −10
- Visibility <5 km → −25  | <10 km → −10

### Nature & Viewpoints — `scoreNatureLocation(conditions, lightQuality)`
Favors **clear skies, long visibility, low wind, and golden/blue-hour light**.

- Base 30
- Cloud cover ≤15% → +35  | ≤30% → +25  | ≤50% → +10  | ≤70% → −5  | >70% → −20
- Visibility ≥20 km → +20  | ≥10 km → +10  | ≥5 km → −10  | <5 km → −30
- Light quality `golden` → +15  | `blue` → +8
- Wind <10 mph → +5  | ≥15 mph → −10  | ≥25 mph → −20
- Precip 0 mm & prob <20% → +15  | ≤0.2 mm → 0  | ≤1 mm → −15  | >1 mm → −35

`getLightQuality(nowMs, sunriseMs, sunsetMs)` returns `'golden' | 'blue' | 'normal'`:

- **golden** — within ±1 hr of sunrise or sunset
- **blue**   — within ±30 min (but outside golden)
- **normal** — any other time

The dashboard's *Day Verdict* banner shows three scores — the average of every location inside each category — so you can pick the right activity for the conditions.

---

## Caching Strategy

Weather data is fetched from Open-Meteo and cached in `localStorage` under key **`spwp_weather_v1`** with a 5-minute TTL.

| Scenario                         | Result                                          |
| -------------------------------- | ----------------------------------------------- |
| First visit / cache empty        | Fetch Seattle + Rainier in parallel, write cache |
| Refresh within 5 min             | Read from cache instantly — **zero** API calls  |
| Refresh after 5 min              | Cache expired → fetch fresh, update cache       |
| Click **Refresh** in stale banner | Force-fetch, bypassing cache entirely          |
| `localStorage` unavailable       | Graceful fallback — always fetch                |

A "Weather data may be outdated" banner appears if the cached data is older than **45 minutes** (even if cache is still technically valid).

Bump the `CACHE_KEY` version in `src/hooks/useWeatherData.js` when the cached data shape changes.

---

## Deployment

Configured for **Vercel**:

- `vercel.json` rewrites all routes to `/index.html` so the SPA handles routing.
- Build command: `npm run build`  •  Output directory: `dist`
- Environment variables are set in the Vercel project dashboard (**Settings → Environment Variables**).
- `@vercel/analytics` streams traffic data automatically once the project is deployed.

Any static host (Netlify, Cloudflare Pages, GitHub Pages, S3) also works — just make sure the host rewrites unknown routes to `index.html`.

---

## Data Sources & Attribution

- **Weather** — [Open-Meteo](https://open-meteo.com). Free, no API key, no attribution required.
- **Webcams** — Linked directly to the hosting organization's page: [NPS Mt Rainier](https://www.nps.gov/mora/learn/photosmultimedia/webcams.htm), [UW Atmospheric Sciences](https://a.atmos.washington.edu/data/webcams.html), [WSDOT Snoqualmie Pass](https://wsdot.com/travel/real-time/mountainpasses/Snoqualmie).
- **Location images** — Fetched from Wikipedia Commons by page title; falls back gracefully when none is found.

---

## Contributing

Feedback goes through the in-app form (if Web3Forms is configured) or directly to issues on this repo. Pull requests for new locations, scoring tweaks, or UI polish are welcome — keep changes small, focused, and run `npm run lint && npm run build` before opening the PR.

---

## License

MIT.
