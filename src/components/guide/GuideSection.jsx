// Keep numeric thresholds in this file aligned with src/utils/scoring.js.
// If scoreCityLocation / scoreNatureLocation / scoreColor / scoreLabel change,
// update the rules tables below to match.

function Section({ icon, title, children }) {
  return (
    <section className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="text-white font-semibold text-base">{title}</h3>
      </div>
      <div className="text-slate-300 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Rule({ rule, points }) {
  const isPositive = points.startsWith('+');
  const isNegative = points.startsWith('−') || points.startsWith('-');
  const color = isPositive
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : isNegative
    ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : 'text-slate-400 bg-white/[0.04] border-white/[0.08]';
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-white/[0.04] last:border-b-0">
      <span className="text-slate-400 text-sm">{rule}</span>
      <span className={`shrink-0 text-xs font-bold tabular-nums px-2 py-0.5 rounded-md border ${color}`}>{points}</span>
    </div>
  );
}

function ColorChip({ swatch, label, range }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className={`w-3 h-3 rounded-full ${swatch}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-semibold">{label}</p>
        <p className="text-slate-500 text-[11px]">{range}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, children }) {
  return (
    <details className="group rounded-xl bg-white/[0.02] border border-white/[0.06] open:bg-white/[0.04] transition-colors">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-4">
        <span className="text-white text-sm font-medium">{q}</span>
        <span className="text-slate-500 text-xs group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed">{children}</div>
    </details>
  );
}

export default function GuideSection() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-white font-semibold text-lg">How it works</h2>
        <p className="text-slate-500 text-xs mt-0.5">Everything you need to know to get the most out of this tool</p>
      </div>

      <Section icon="🚀" title="Quick start">
        <ol className="list-decimal list-outside pl-5 space-y-2">
          <li>
            <span className="text-white">Read the day verdict.</span> Three cards at the top show
            scores for City, Viewpoints, and Nature. Pick whichever category has the strongest score
            for the current hour.
          </li>
          <li>
            <span className="text-white">Open the matching tab.</span> The "Locations" view filters
            spots by category and ranks them by how good they look right now.
          </li>
          <li>
            <span className="text-white">Tap a location card</span> for shooting notes, distance from
            downtown, and a Wikipedia preview. Use the Live Webcams tab if you want eyes on
            conditions before you commit.
          </li>
        </ol>
      </Section>

      <Section icon="🎯" title="Reading the day verdict">
        <p>
          The three scores at the top are independent averages — one for each category — so a poor
          forecast in one doesn't drag the others down. A typical day might read{' '}
          <span className="text-emerald-400 font-semibold">City 78</span>,{' '}
          <span className="text-amber-400 font-semibold">Viewpoint 52</span>,{' '}
          <span className="text-red-400 font-semibold">Nature 38</span> — meaning overcast city
          shooting is excellent, distant viewpoints are mediocre (haze), and Mt Rainier is probably
          obscured. The verdict tip below the cards points you to the strongest category.
        </p>
      </Section>

      <Section icon="🎨" title="What the score colors mean">
        <p>Every score (0–100) gets a color and a label:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ColorChip swatch="bg-emerald-500" label="Great" range="80–100" />
          <ColorChip swatch="bg-lime-500"    label="Good"  range="60–79" />
          <ColorChip swatch="bg-amber-500"   label="Fair"  range="40–59" />
          <ColorChip swatch="bg-red-500"     label="Poor"  range="0–39" />
        </div>
        <p className="text-slate-500 text-xs">
          The text label uses slightly different cutoffs (Great ≥70, Fair ≥50, Poor below 50) so
          you'll occasionally see a "Great" verdict on a lime card — that's expected.
        </p>
      </Section>

      <Section icon="🏙️" title="How city scores are calculated">
        <p>
          City photography rewards <span className="text-white">soft, diffuse light</span> — overcast
          skies, dry pavement, clear visibility. The base score is{' '}
          <span className="text-white font-semibold">50</span>, then:
        </p>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Cloud cover</p>
          <Rule rule="40–80% (overcast — best)"   points="+25" />
          <Rule rule="80–95% (heavy overcast)"     points="+10" />
          <Rule rule="Below 40% (harsh shadows)"   points="+5" />
        </div>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Precipitation</p>
          <Rule rule="0 mm in this hour"           points="+15" />
          <Rule rule="≤ 0.5 mm (light drizzle)"    points="+10" />
          <Rule rule="More than 2 mm"              points="−20" />
        </div>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Rain probability</p>
          <Rule rule="Below 20%"                   points="+10" />
          <Rule rule="Below 50%"                   points="+5" />
          <Rule rule="Above 75%"                   points="−10" />
        </div>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Visibility</p>
          <Rule rule="Below 5 km (heavy fog)"      points="−25" />
          <Rule rule="Below 10 km (hazy)"          points="−10" />
        </div>
      </Section>

      <Section icon="🏔️" title="How nature & viewpoint scores are calculated">
        <p>
          Nature and viewpoint photography rewards <span className="text-white">clear skies, long
          visibility, low wind, and golden / blue-hour light</span>. Base score is{' '}
          <span className="text-white font-semibold">30</span>, then:
        </p>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Cloud cover</p>
          <Rule rule="≤ 15% (clear)"     points="+35" />
          <Rule rule="≤ 30%"             points="+25" />
          <Rule rule="≤ 50%"             points="+10" />
          <Rule rule="≤ 70%"             points="−5" />
          <Rule rule="More than 70%"     points="−20" />
        </div>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Visibility</p>
          <Rule rule="≥ 20 km (crystal clear)"   points="+20" />
          <Rule rule="≥ 10 km"                   points="+10" />
          <Rule rule="≥ 5 km"                    points="−10" />
          <Rule rule="Below 5 km"                points="−30" />
        </div>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Light quality</p>
          <Rule rule="Golden hour"               points="+15" />
          <Rule rule="Blue hour"                 points="+8" />
        </div>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Wind</p>
          <Rule rule="Below 10 mph (calm)"       points="+5" />
          <Rule rule="15–25 mph"                 points="−10" />
          <Rule rule="≥ 25 mph (gusty)"          points="−20" />
        </div>
        <div className="rounded-xl bg-black/30 border border-white/[0.04] p-3">
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mb-2">Precipitation</p>
          <Rule rule="0 mm and < 20% chance"     points="+15" />
          <Rule rule="0.2 – 1 mm"                points="−15" />
          <Rule rule="More than 1 mm"            points="−35" />
        </div>
      </Section>

      <Section icon="🌅" title="Golden & blue hour">
        <p>The light-quality bonus comes from where you are in the day:</p>
        <ul className="space-y-2 list-disc list-outside pl-5">
          <li>
            <span className="text-amber-400 font-semibold">Golden hour</span> — within ±1 hour of
            sunrise or sunset. Warm, low-angle light; the strongest bonus (+15) for nature shots.
          </li>
          <li>
            <span className="text-sky-400 font-semibold">Blue hour</span> — the 30 minutes before
            sunrise and after sunset. Cool tones, balanced sky-to-city brightness; +8 bonus.
          </li>
          <li>
            <span className="text-slate-300 font-semibold">Normal</span> — any other time. No bonus.
          </li>
        </ul>
        <p>
          The Sun Timeline in the sidebar shows where "now" sits between sunrise and sunset so you
          can plan your shot around the next golden window.
        </p>
      </Section>

      <Section icon="📡" title="Live webcams">
        <p>
          Six camera feeds — Mt Rainier (NPS), the UW campus, and Snoqualmie Pass (WSDOT). Each card
          auto-refreshes every <span className="text-white">5 minutes</span>; press{' '}
          <span className="text-white">↻ Refresh now</span> for an immediate update. Tapping a card
          opens the source page so you can see the host's full archive or higher-resolution feed.
        </p>
        <p className="text-slate-500 text-xs">
          A camera marked "offline" usually means the host's server is down or stale-cached — try
          opening the source page directly.
        </p>
      </Section>

      <Section icon="💾" title="Caching & freshness">
        <p>
          Weather data is cached in your browser for <span className="text-white">5 minutes</span>,
          so refreshing the page within that window is instant and uses no API quota. After 5
          minutes the next visit fetches fresh data automatically. If data is older than{' '}
          <span className="text-white">45 minutes</span> a yellow banner appears at the top — click
          "Refresh" to force-pull a new forecast immediately.
        </p>
      </Section>

      <Section icon="❓" title="FAQ">
        <div className="space-y-2">
          <FaqItem q="Why three categories instead of one overall score?">
            City, viewpoint, and nature shots reward opposite weather. Overcast skies are perfect
            for street photography but terrible for Mt Rainier. Combining them into a single score
            washed out the signal — splitting them tells you what kind of day to plan for.
          </FaqItem>
          <FaqItem q="How far ahead can I trust the forecast?">
            Open-Meteo provides a 3-day hourly forecast. Accuracy is highest in the next 24 hours;
            beyond that, treat scores as directional rather than precise. The Day Forecast card lets
            you scrub forward through the next 72 hours.
          </FaqItem>
          <FaqItem q="Why is nature scoring so much lower than city today?">
            Most likely cloud cover or visibility. Nature shooting is heavily penalized when the
            mountains can't be seen, while city scoring actually rewards overcast conditions.
          </FaqItem>
          <FaqItem q="What if a webcam shows offline?">
            The host's image server is unreachable or returning an error. Click the card — its
            source page may still load even when the embedded image doesn't.
          </FaqItem>
          <FaqItem q="Where does the weather data come from?">
            Open-Meteo's free, no-key forecast API. We pull two locations in parallel — downtown
            Seattle and Mt Rainier — so Rainier-area locations get more accurate mountain weather.
          </FaqItem>
          <FaqItem q="Does this work for cities outside Seattle?">
            Not yet — every location and the weather coordinates are hard-coded for the Seattle
            area. The codebase is open source, so a fork for another city is straightforward.
          </FaqItem>
        </div>
      </Section>
    </div>
  );
}
