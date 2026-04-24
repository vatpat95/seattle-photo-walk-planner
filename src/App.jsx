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
import DayForecast from './components/dashboard/DayForecast';
import FeedbackButton from './components/feedback/FeedbackButton';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ErrorBanner from './components/shared/ErrorBanner';

const RAINIER_IDS = new Set(['rainier-paradise', 'rainier-reflection', 'rainier-tipsoo']);

function ViewToggle({ activeView, onChange }) {
  const views = [
    { id: 'locations', icon: '📍', label: 'Locations' },
    { id: 'webcams',   icon: '📡', label: 'Live Webcams' },
  ];
  return (
    <div className="flex gap-1.5 bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.06]">
      {views.map(v => (
        <button key={v.id} onClick={() => onChange(v.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeView === v.id
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
          }`}>
          <span>{v.icon}</span>
          <span>{v.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const {
    seattleData, rainierData, currentHourIndex, todayIndex,
    loading, error, fetchedAt, isStale, reload,
  } = useWeatherData();

  const webcamTimestamp = useWebcamRefresh(5 * 60 * 1000);
  const [activeView, setActiveView] = useState('locations');
  const [activeTab, setActiveTab] = useState('city');
  const [activeSubcategory, setActiveSubcategory] = useState('All');

  // Reset subcategory chip when switching main tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveSubcategory('All');
  };

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
    city:      scoredLocations.filter(l => l.category === 'city').length,
    viewpoint: scoredLocations.filter(l => l.category === 'viewpoint').length,
    nature:    scoredLocations.filter(l => l.category === 'nature').length,
  }), [scoredLocations]);

  const isGoldenHour = lightQuality === 'golden';

  return (
    <div className="min-h-screen bg-[#04040a]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <Header fetchedAt={fetchedAt} />

        {isStale && !loading && (
          <div className="mb-6 rounded-xl bg-amber-950/40 border border-amber-500/20 px-4 py-2.5 flex items-center justify-between">
            <span className="text-amber-400/80 text-xs">Weather data may be outdated</span>
            <button onClick={reload} className="text-amber-400 text-xs underline hover:text-amber-300 transition-colors">Refresh</button>
          </div>
        )}

        {loading && <LoadingSpinner />}
        {error && !loading && <ErrorBanner message={error} onRetry={reload} />}

        {!loading && !error && seattleData && (
          <div className="space-y-6">
            {/* Always-visible top section */}
            <DayVerdictBanner cityScore={cityAvg} natureScore={natureAvg} />

            <div className="space-y-4">
              <ConditionsSummary conditions={currentConditions} />
              {currentConditions?.sunrise && currentConditions?.sunset && (
                <SunTimeline sunrise={currentConditions.sunrise} sunset={currentConditions.sunset} />
              )}
              <DayForecast
                seattleData={seattleData}
                todayIndex={todayIndex}
                currentHourIndex={currentHourIndex}
              />
            </div>

            {/* View toggle */}
            <ViewToggle activeView={activeView} onChange={setActiveView} />

            {/* Switched content */}
            {activeView === 'locations' && (
              <div className="space-y-4">
                <LocationTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  counts={tabCounts}
                  scoredLocations={scoredLocations}
                  activeSubcategory={activeSubcategory}
                  onSubcategoryChange={setActiveSubcategory}
                />
                <LocationGrid
                  scoredLocations={scoredLocations}
                  activeTab={activeTab}
                  activeSubcategory={activeSubcategory}
                  isGoldenHour={isGoldenHour}
                />
              </div>
            )}

            {activeView === 'webcams' && (
              <WebcamSection timestamp={webcamTimestamp} />
            )}
          </div>
        )}

        <Footer />
      </div>

      <FeedbackButton />
    </div>
  );
}
