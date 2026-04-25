import { useState, useMemo } from 'react';
import { useWeatherData, extractHourlySlice, deriveConditions } from './hooks/useWeatherData';
import { useWebcamRefresh } from './hooks/useWebcamRefresh';
import { LOCATIONS } from './constants/locations';
import { scoreCityLocation, scoreNatureLocation, getLightQuality, average } from './utils/scoring';
import { getNowSeattleMs } from './utils/timezone';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import DayVerdictBanner from './components/dashboard/DayVerdictBanner';
import ConditionsSummary from './components/dashboard/ConditionsSummary';
import SunTimeline from './components/dashboard/SunTimeline';
import LocationTabs from './components/locations/LocationTabs';
import LocationGrid from './components/locations/LocationGrid';
import SpotlightCard from './components/locations/SpotlightCard';
import WebcamSection from './components/webcams/WebcamSection';
import GuideSection from './components/guide/GuideSection';
import DayForecast from './components/dashboard/DayForecast';
import FeedbackButton from './components/feedback/FeedbackButton';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ErrorBanner from './components/shared/ErrorBanner';

const RAINIER_IDS = new Set(['rainier-paradise', 'rainier-reflection', 'rainier-tipsoo']);

function ViewToggle({ activeView, onChange }) {
  const views = [
    { id: 'locations', icon: '📍', label: 'Locations' },
    { id: 'webcams',   icon: '📡', label: 'Live Webcams' },
    { id: 'guide',     icon: 'ℹ️', label: 'How it works' },
  ];
  return (
    <div className="hidden sm:flex gap-1.5 bg-surface rounded-2xl p-1.5 border border-border">
      {views.map(v => (
        <button key={v.id} onClick={() => onChange(v.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-xl
                      text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200
                      ${activeView === v.id
                        ? 'bg-gold-dim text-gold border border-gold/30'
                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
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

  const { timestamp: webcamTimestamp, refresh: refreshWebcams } = useWebcamRefresh(5 * 60 * 1000);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('city');
  const [activeSubcategory, setActiveSubcategory] = useState('All');

  const handleNavChange = (view) => {
    setActiveView(view);
    // Defer scroll until after React re-render commits, otherwise the
    // state update's DOM flush can cancel an in-progress smooth scroll.
    setTimeout(() => {
      const el = document.getElementById(`mobile-section-${view}`);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'instant' });
      }
    }, 0);
  };

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
      getNowSeattleMs(),
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

  const cityAvg      = useMemo(() => average(scoredLocations.filter(l => l.category === 'city').map(l => l.score)),      [scoredLocations]);
  const viewpointAvg = useMemo(() => average(scoredLocations.filter(l => l.category === 'viewpoint').map(l => l.score)), [scoredLocations]);
  const natureAvg    = useMemo(() => average(scoredLocations.filter(l => l.category === 'nature').map(l => l.score)),    [scoredLocations]);

  const tabCounts = useMemo(() => ({
    city:      scoredLocations.filter(l => l.category === 'city').length,
    viewpoint: scoredLocations.filter(l => l.category === 'viewpoint').length,
    nature:    scoredLocations.filter(l => l.category === 'nature').length,
  }), [scoredLocations]);

  const isGoldenHour = lightQuality === 'golden';

  const topLocation = useMemo(() =>
    scoredLocations.length
      ? scoredLocations.reduce((best, loc) => loc.score > best.score ? loc : best, scoredLocations[0])
      : null,
    [scoredLocations]);

  const SidebarContent = (
    <div className="space-y-5">
      <DayVerdictBanner cityScore={cityAvg} viewpointScore={viewpointAvg} natureScore={natureAvg} />
      <ConditionsSummary conditions={currentConditions} />
      {currentConditions?.sunrise && currentConditions?.sunset && (
        <SunTimeline sunrise={currentConditions.sunrise} sunset={currentConditions.sunset} />
      )}
      <DayForecast seattleData={seattleData} todayIndex={todayIndex} currentHourIndex={currentHourIndex} />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg pb-20 sm:pb-0">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[28rem] h-96 blob-gold rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 blob-cyan rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <Header fetchedAt={fetchedAt} />

        {isStale && !loading && (
          <div className="mb-6 rounded-xl bg-gold-dim border border-gold/20 px-4 py-2.5 flex items-center justify-between">
            <span className="text-gold-muted text-xs">Weather data may be outdated</span>
            <button onClick={reload} className="text-gold text-xs underline hover:text-gold-muted transition-colors">
              Refresh
            </button>
          </div>
        )}

        {loading && <LoadingSpinner />}
        {error && !loading && <ErrorBanner message={error} onRetry={reload} />}

        {!loading && !error && seattleData && (
          <>
            {/* Mobile: single scrollable page — all sections always rendered */}
            <div className="sm:hidden space-y-8">
              <div id="mobile-section-dashboard">{SidebarContent}</div>

              <div id="mobile-section-locations" className="space-y-4">
                {topLocation && <SpotlightCard location={topLocation} isGoldenHour={isGoldenHour} />}
                <LocationTabs
                  activeTab={activeTab} onTabChange={handleTabChange}
                  counts={tabCounts} scoredLocations={scoredLocations}
                  activeSubcategory={activeSubcategory} onSubcategoryChange={setActiveSubcategory}
                />
                <LocationGrid
                  scoredLocations={scoredLocations} activeTab={activeTab}
                  activeSubcategory={activeSubcategory} isGoldenHour={isGoldenHour}
                />
              </div>

              <div id="mobile-section-webcams">
                <WebcamSection timestamp={webcamTimestamp} onRefresh={refreshWebcams} />
              </div>

              <div id="mobile-section-guide">
                <GuideSection />
              </div>
            </div>

            {/* Tablet + Desktop layout */}
            <div className="hidden sm:block">
              <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-8 lg:items-start">
                {/* Sidebar — visible lg+ only */}
                <div className="hidden lg:block space-y-5 lg:sticky lg:top-8">
                  {SidebarContent}
                </div>

                {/* Main content */}
                <div className="space-y-5 mt-6 lg:mt-0">
                  {/* Tablet: sidebar stacked above tabs */}
                  <div className="sm:block lg:hidden">
                    {SidebarContent}
                  </div>

                  <ViewToggle activeView={activeView} onChange={setActiveView} />

                  {activeView === 'locations' && (
                    <div className="space-y-4">
                      {topLocation && (
                        <SpotlightCard location={topLocation} isGoldenHour={isGoldenHour} />
                      )}
                      <LocationTabs
                        activeTab={activeTab} onTabChange={handleTabChange}
                        counts={tabCounts} scoredLocations={scoredLocations}
                        activeSubcategory={activeSubcategory} onSubcategoryChange={setActiveSubcategory}
                      />
                      <LocationGrid
                        scoredLocations={scoredLocations} activeTab={activeTab}
                        activeSubcategory={activeSubcategory} isGoldenHour={isGoldenHour}
                      />
                    </div>
                  )}

                  {activeView === 'webcams' && (
                    <WebcamSection timestamp={webcamTimestamp} onRefresh={refreshWebcams} />
                  )}

                  {activeView === 'guide' && <GuideSection />}
                </div>
              </div>
            </div>
          </>
        )}

        <Footer />
      </div>

      <BottomNav activeView={activeView} onChange={handleNavChange} />
      <FeedbackButton />
    </div>
  );
}
