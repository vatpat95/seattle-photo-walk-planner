import { useState, useMemo } from 'react';
import { useWeatherData, extractHourlySlice, deriveConditions } from './hooks/useWeatherData';
import { useWebcamRefresh } from './hooks/useWebcamRefresh';
import { LOCATIONS } from './constants/locations';
import { scoreCityLocation, scoreNatureLocation, getLightQuality, average } from './utils/scoring';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DayVerdictBanner from './components/dashboard/DayVerdictBanner';
import ConditionsSummary from './components/dashboard/ConditionsSummary';
import SunTimeline from './components/dashboard/SunTimeline';
import LocationTabs from './components/locations/LocationTabs';
import LocationGrid from './components/locations/LocationGrid';
import WebcamSection from './components/webcams/WebcamSection';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ErrorBanner from './components/shared/ErrorBanner';

const RAINIER_IDS = new Set(['rainier-paradise', 'rainier-reflection', 'rainier-tipsoo']);

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/[0.05]" />
      <span className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-1">{label}</span>
      <div className="h-px flex-1 bg-white/[0.05]" />
    </div>
  );
}

export default function App() {
  const {
    seattleData, rainierData, currentHourIndex, todayIndex,
    loading, error, fetchedAt, isStale, reload,
  } = useWeatherData();

  const webcamTimestamp = useWebcamRefresh(5 * 60 * 1000);
  const [activeTab, setActiveTab] = useState('city');

  const currentConditions = useMemo(() => {
    if (!seattleData) return null;
    return deriveConditions(seattleData, currentHourIndex, todayIndex);
  }, [seattleData, currentHourIndex, todayIndex]);

  const lightQuality = useMemo(() => {
    if (!currentConditions?.sunrise || !currentConditions?.sunset) return 'normal';
    return getLightQuality(
      Date.now(),
      new Date(currentConditions.sunrise).getTime(),
      new Date(currentConditions.sunset).getTime(),
    );
  }, [currentConditions]);

  const scoredLocations = useMemo(() => {
    if (!seattleData) return [];
    return LOCATIONS.map(loc => {
      const data = RAINIER_IDS.has(loc.id) ? (rainierData ?? seattleData) : seattleData;
      const slice = extractHourlySlice(data, currentHourIndex);
      const score = loc.category === 'city'
        ? scoreCityLocation(slice)
        : scoreNatureLocation(slice, lightQuality);
      return { ...loc, score, conditions: slice };
    });
  }, [seattleData, rainierData, currentHourIndex, lightQuality]);

  const cityAvg = useMemo(() =>
    average(scoredLocations.filter(l => l.category === 'city').map(l => l.score)),
    [scoredLocations]);
  const natureAvg = useMemo(() =>
    average(scoredLocations.filter(l => l.category !== 'city').map(l => l.score)),
    [scoredLocations]);

  const tabCounts = useMemo(() => ({
    city: scoredLocations.filter(l => l.category === 'city').length,
    viewpoint: scoredLocations.filter(l => l.category === 'viewpoint').length,
    nature: scoredLocations.filter(l => l.category === 'nature').length,
  }), [scoredLocations]);

  const isGoldenHour = lightQuality === 'golden';

  return (
    <div className="min-h-screen bg-[#04040a]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <Header fetchedAt={fetchedAt} />

        {isStale && !loading && (
          <div className="mb-6 rounded-xl bg-amber-950/40 border border-amber-500/20 px-4 py-2.5 flex items-center justify-between">
            <span className="text-amber-400/80 text-xs">Weather data may be outdated</span>
            <button onClick={reload} className="text-amber-400 text-xs underline hover:text-amber-300 transition-colors">
              Refresh
            </button>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {error && !loading && (
          <div className="mt-4">
            <ErrorBanner message={error} onRetry={reload} />
          </div>
        )}

        {!loading && !error && seattleData && (
          <div className="space-y-8">
            <DayVerdictBanner cityScore={cityAvg} natureScore={natureAvg} />

            <SectionDivider label="Right Now" />

            <div className="space-y-5">
              <ConditionsSummary conditions={currentConditions} />
              {currentConditions?.sunrise && currentConditions?.sunset && (
                <SunTimeline sunrise={currentConditions.sunrise} sunset={currentConditions.sunset} />
              )}
            </div>

            <SectionDivider label="Locations" />

            <div className="space-y-4">
              <LocationTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />
              <LocationGrid scoredLocations={scoredLocations} activeTab={activeTab} isGoldenHour={isGoldenHour} />
            </div>

            <SectionDivider label="Live Conditions" />

            <WebcamSection timestamp={webcamTimestamp} />
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
