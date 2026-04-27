import { useState, useMemo } from 'react';
import { useWeatherData, extractHourlySlice, deriveConditions } from './hooks/useWeatherData';
import { useWebcamRefresh } from './hooks/useWebcamRefresh';
import { LOCATIONS } from './constants/locations';
import { scoreCityLocation, scoreNatureLocation, getLightQuality, average, findBestWindow, getScoreReasons, getStyleFitBonus } from './utils/scoring';
import { getNowSeattleMs } from './utils/timezone';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import DayVerdictBanner from './components/dashboard/DayVerdictBanner';
import ConditionsSummary from './components/dashboard/ConditionsSummary';
import SunTimeline from './components/dashboard/SunTimeline';
import LocationTabs from './components/locations/LocationTabs';
import StyleSelector from './components/locations/StyleSelector';
import LocationGrid from './components/locations/LocationGrid';
import SpotlightCard from './components/locations/SpotlightCard';
import TopThreeSection from './components/locations/TopThreeSection';
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
  const [activeView, setActiveView] = useState('locations');
  const [activeTab, setActiveTab] = useState('city');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState(
    () => localStorage.getItem('spwp_style') ?? null
  );

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
    if (style === null) localStorage.removeItem('spwp_style');
    else localStorage.setItem('spwp_style', style);
  };

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
      const weatherScore = loc.category === 'city'
        ? scoreCityLocation(slice)
        : scoreNatureLocation(slice, lightQuality);
      const styleBonus = getStyleFitBonus(loc, selectedStyle);
      const score = Math.max(0, Math.min(100, weatherScore + styleBonus));
      return { ...loc, score, weatherScore, conditions: slice };
    });
  }, [seattleData, rainierData, currentHourIndex, lightQuality, selectedStyle]);

  const cityAvg      = useMemo(() => average(scoredLocations.filter(l => l.category === 'city').map(l => l.score)),      [scoredLocations]);
  const viewpointAvg = useMemo(() => average(scoredLocations.filter(l => l.category === 'viewpoint').map(l => l.score)), [scoredLocations]);
  const natureAvg    = useMemo(() => average(scoredLocations.filter(l => l.category === 'nature').map(l => l.score)),    [scoredLocations]);

  const styleFilteredLocations = useMemo(() => {
    if (!selectedStyle) return scoredLocations;
    return scoredLocations.filter(
      l => Array.isArray(l.styleTags) && l.styleTags.includes(selectedStyle)
    );
  }, [scoredLocations, selectedStyle]);

  const tabCounts = useMemo(() => ({
    city:      styleFilteredLocations.filter(l => l.category === 'city').length,
    viewpoint: styleFilteredLocations.filter(l => l.category === 'viewpoint').length,
    nature:    styleFilteredLocations.filter(l => l.category === 'nature').length,
  }), [styleFilteredLocations]);

  const isGoldenHour = lightQuality === 'golden';

  const topLocation = useMemo(() =>
    scoredLocations.length
      ? scoredLocations.reduce((best, loc) => loc.score > best.score ? loc : best, scoredLocations[0])
      : null,
    [scoredLocations]);

  const goldenHourLocation = useMemo(() => {
    if (!seattleData || !currentConditions?.sunset) return null;
    const sunsetMs = new Date(currentConditions.sunset).getTime();
    const nowMs = getNowSeattleMs();
    if (sunsetMs - nowMs < -60 * 60 * 1000) return null;
    if (sunsetMs - nowMs > 4 * 60 * 60 * 1000) return null;
    const goldenMs = sunsetMs - 30 * 60 * 1000;
    const goldenTimeStr = new Date(goldenMs).toISOString().slice(0, 13);
    const goldenIdx = seattleData.hourly.time?.findIndex(t => t.startsWith(goldenTimeStr));
    if (goldenIdx == null || goldenIdx < 0) return null;
    const candidates = LOCATIONS
      .filter(loc => loc.category === 'viewpoint' || loc.category === 'nature')
      .map(loc => {
        const data = RAINIER_IDS.has(loc.id) ? (rainierData ?? seattleData) : seattleData;
        const slice = extractHourlySlice(data, goldenIdx);
        return { ...loc, score: scoreNatureLocation(slice, 'golden'), conditions: slice };
      });
    const best = candidates.reduce((a, b) => b.score > a.score ? b : a);
    return best.score >= 50 ? best : null;
  }, [seattleData, rainierData, currentConditions]);

  const heroTimeWindow = useMemo(() => {
    if (!seattleData || !topLocation) return null;
    const baseIdx = todayIndex * 24;
    const sunriseMs = currentConditions?.sunrise ? new Date(currentConditions.sunrise).getTime() : null;
    const sunsetMs  = currentConditions?.sunset  ? new Date(currentConditions.sunset).getTime()  : null;
    const sunriseHr = sunriseMs ? new Date(sunriseMs).getHours() : 6;
    const sunsetHr  = sunsetMs  ? new Date(sunsetMs).getHours()  : 20;
    const daySet = new Set(Array.from({ length: 24 }, (_, h) => h).filter(h => h >= sunriseHr && h <= sunsetHr));
    const scores = Array.from({ length: 24 }, (_, h) => {
      const slice = extractHourlySlice(seattleData, baseIdx + h);
      const hourTs = seattleData.hourly.time?.[baseIdx + h];
      const light = sunriseMs && sunsetMs && hourTs
        ? getLightQuality(new Date(hourTs).getTime(), sunriseMs, sunsetMs)
        : 'normal';
      return topLocation.category === 'city' ? scoreCityLocation(slice) : scoreNatureLocation(slice, light);
    });
    const threshold = topLocation.category === 'city' ? 70 : 65;
    const win = findBestWindow(scores, daySet, threshold);
    if (!win) return null;
    const fmt = h => {
      if (h === 0) return '12 AM';
      if (h === 12) return '12 PM';
      return h < 12 ? `${h} AM` : `${h - 12} PM`;
    };
    return `${fmt(win.start)} – ${fmt(win.end + 1)}`;
  }, [seattleData, topLocation, todayIndex, currentConditions]);

  const topReasons = useMemo(() =>
    topLocation ? getScoreReasons(topLocation, topLocation.conditions, lightQuality, selectedStyle) : [],
    [topLocation, lightQuality, selectedStyle]);

  const goldenReasons = useMemo(() =>
    goldenHourLocation ? getScoreReasons(goldenHourLocation, goldenHourLocation.conditions, 'golden', selectedStyle) : [],
    [goldenHourLocation, selectedStyle]);

  const topThree = useMemo(() =>
    [...scoredLocations].sort((a, b) => b.score - a.score).slice(0, 3),
    [scoredLocations]);

  const handleViewDetails = (loc) => {
    handleTabChange(loc.category === 'viewpoint' ? 'viewpoint' : loc.category);
    setTimeout(() => document.getElementById(`loc-${loc.id}`)?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

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

        <StyleSelector selectedStyle={selectedStyle} onStyleChange={handleStyleChange} />

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
                <div className="space-y-3">
                  {topLocation && (
                    <SpotlightCard
                      location={topLocation}
                      isGoldenHour={isGoldenHour}
                      label="Best right now"
                      reasons={topReasons}
                      timeWindow={heroTimeWindow}
                      onViewDetails={() => handleViewDetails(topLocation)}
                    />
                  )}
                  {goldenHourLocation && (
                    <SpotlightCard
                      location={goldenHourLocation}
                      isGoldenHour={true}
                      label="Best for golden hour"
                      reasons={goldenReasons}
                      timeWindow={null}
                    />
                  )}
                </div>
                <TopThreeSection
                  topThree={topThree}
                  lightQuality={lightQuality}
                  onViewDetails={handleViewDetails}
                  selectedStyle={selectedStyle}
                />
                <LocationTabs
                  activeTab={activeTab} onTabChange={handleTabChange}
                  counts={tabCounts} scoredLocations={styleFilteredLocations}
                  activeSubcategory={activeSubcategory} onSubcategoryChange={setActiveSubcategory}
                />
                <LocationGrid
                  scoredLocations={styleFilteredLocations} activeTab={activeTab}
                  activeSubcategory={activeSubcategory} isGoldenHour={isGoldenHour}
                  lightQuality={lightQuality}
                  selectedStyle={selectedStyle}
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
                      <div className="grid sm:grid-cols-2 gap-4 items-start">
                        {/* Hero card(s) — left column */}
                        <div className="space-y-3">
                          {topLocation && (
                            <SpotlightCard
                              location={topLocation}
                              isGoldenHour={isGoldenHour}
                              label="Best right now"
                              reasons={topReasons}
                              timeWindow={heroTimeWindow}
                              onViewDetails={() => handleViewDetails(topLocation)}
                            />
                          )}
                          {goldenHourLocation && (
                            <SpotlightCard
                              location={goldenHourLocation}
                              isGoldenHour={true}
                              label="Best for golden hour"
                              reasons={goldenReasons}
                              timeWindow={null}
                            />
                          )}
                        </div>
                        {/* Top 3 — right column */}
                        <TopThreeSection
                          topThree={topThree}
                          lightQuality={lightQuality}
                          onViewDetails={handleViewDetails}
                          selectedStyle={selectedStyle}
                        />
                      </div>
                      <LocationTabs
                        activeTab={activeTab} onTabChange={handleTabChange}
                        counts={tabCounts} scoredLocations={styleFilteredLocations}
                        activeSubcategory={activeSubcategory} onSubcategoryChange={setActiveSubcategory}
                      />
                      <LocationGrid
                        scoredLocations={styleFilteredLocations} activeTab={activeTab}
                        activeSubcategory={activeSubcategory} isGoldenHour={isGoldenHour}
                        lightQuality={lightQuality}
                        selectedStyle={selectedStyle}
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
