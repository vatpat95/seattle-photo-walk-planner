export function findBestWindow(scores, eligibleSet, threshold) {
  const eligible = Array.from(eligibleSet).sort((a, b) => a - b);
  let best = null;
  let current = null;

  for (const h of eligible) {
    if (scores[h] >= threshold) {
      if (!current) current = { start: h, end: h, maxScore: scores[h] };
      else { current.end = h; current.maxScore = Math.max(current.maxScore, scores[h]); }
    } else {
      if (current) {
        if (!best || current.maxScore > best.maxScore) best = { ...current };
        current = null;
      }
    }
  }
  if (current && (!best || current.maxScore > best.maxScore)) best = current;
  return best;
}

export function getScoreReasons(loc, conditions, lightQuality) {
  const { cloudCover = 50, precipMM = 0, precipProb = 0, visibilityKm = 15, windMph = 10 } = conditions ?? {};
  const factors = [];

  if (loc.category === 'city') {
    if (cloudCover >= 40 && cloudCover <= 80) factors.push({ score: 25, text: `Partly cloudy (${cloudCover}%) — ideal diffused light` });
    else if (cloudCover > 80 && cloudCover <= 95) factors.push({ score: 10, text: `Overcast (${cloudCover}%) — soft, even light` });
    else if (cloudCover < 40) factors.push({ score: 5, text: `Clear (${cloudCover}%) — watch for harsh shadows` });
    else factors.push({ score: -10, text: `Heavy overcast (${cloudCover}%) — flat grey light` });

    if (lightQuality === 'golden') factors.push({ score: 15, text: 'Golden hour — warm directional light' });
    else if (lightQuality === 'blue') factors.push({ score: 8, text: 'Blue hour — cool even light' });

    if (precipMM === 0 && precipProb < 20) factors.push({ score: 15, text: 'Dry — no rain risk' });
    else if (precipMM > 2) factors.push({ score: -20, text: `Rain likely (${precipMM}mm)` });
    else if (precipProb > 75) factors.push({ score: -10, text: `High rain chance (${precipProb}%)` });
    else factors.push({ score: 0, text: `Light rain possible (${precipProb}%)` });

    if (visibilityKm >= 10) factors.push({ score: 10, text: `Strong visibility (${visibilityKm}km)` });
    else if (visibilityKm < 5) factors.push({ score: -25, text: `Poor visibility (${visibilityKm}km) — haze reducing contrast` });
  } else {
    if (lightQuality === 'golden') factors.push({ score: 15, text: 'Golden hour — best light for landscapes' });
    else if (lightQuality === 'blue') factors.push({ score: 8, text: 'Blue hour — moody, cool tones' });

    if (cloudCover <= 15) factors.push({ score: 35, text: `Clear skies (${cloudCover}%) — excellent visibility` });
    else if (cloudCover <= 30) factors.push({ score: 25, text: `Mostly clear (${cloudCover}%) — good conditions` });
    else if (cloudCover <= 50) factors.push({ score: 10, text: `Partly cloudy (${cloudCover}%)` });
    else if (cloudCover > 70) factors.push({ score: -20, text: `Heavy cloud cover (${cloudCover}%) — obstructing views` });
    else factors.push({ score: -5, text: `Cloudy (${cloudCover}%) — limited views` });

    if (visibilityKm >= 20) factors.push({ score: 20, text: `Excellent visibility (${visibilityKm}km)` });
    else if (visibilityKm >= 10) factors.push({ score: 10, text: `Good visibility (${visibilityKm}km)` });
    else if (visibilityKm < 5) factors.push({ score: -30, text: `Poor visibility (${visibilityKm}km)` });

    if (windMph < 10) factors.push({ score: 5, text: `Calm winds (${windMph}mph) — good for reflections` });
    else if (windMph >= 15) factors.push({ score: windMph >= 25 ? -20 : -10, text: `Windy (${windMph}mph) — affects exposures` });

    if (precipMM === 0 && precipProb < 20) factors.push({ score: 15, text: 'Dry conditions' });
    else if (precipMM > 1) factors.push({ score: -35, text: `Rain likely (${precipMM}mm)` });
    else factors.push({ score: -5, text: `Rain possible (${precipProb}%)` });
  }

  factors.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  const top3 = factors.slice(0, 3).map(f => f.text);
  while (top3.length < 3) top3.push('Conditions within normal range');
  return top3;
}

export function getLightQuality(nowMs, sunriseMs, sunsetMs) {
  const afterSunrise = nowMs - sunriseMs;
  const beforeSunset = sunsetMs - nowMs;
  const hr = 60 * 60 * 1000;

  if ((afterSunrise >= 0 && afterSunrise <= hr) || (beforeSunset >= 0 && beforeSunset <= hr)) {
    return 'golden';
  }
  if ((afterSunrise >= -0.5 * hr && afterSunrise < 0) || (beforeSunset >= -0.5 * hr && beforeSunset < 0)) {
    return 'blue';
  }
  return 'normal';
}

export function scoreCityLocation(h) {
  const { cloudCover = 50, precipMM = 0, precipProb = 0, visibilityKm = 15 } = h;
  let score = 50;

  if (cloudCover >= 40 && cloudCover <= 80) score += 25;
  else if (cloudCover > 80 && cloudCover <= 95) score += 10;
  else if (cloudCover < 40) score += 5;
  // >95% adds nothing — flat grey

  if (precipMM === 0) score += 15;
  else if (precipMM <= 0.5) score += 10;
  else if (precipMM > 2.0) score -= 20;

  if (precipProb < 20) score += 10;
  else if (precipProb < 50) score += 5;
  else if (precipProb > 75) score -= 10;

  if (visibilityKm < 5) score -= 25;
  else if (visibilityKm < 10) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreNatureLocation(h, lightQuality = 'normal') {
  const { cloudCover = 50, precipMM = 0, precipProb = 0, visibilityKm = 15, windMph = 10 } = h;
  let score = 30;

  if (cloudCover <= 15) score += 35;
  else if (cloudCover <= 30) score += 25;
  else if (cloudCover <= 50) score += 10;
  else if (cloudCover <= 70) score -= 5;
  else score -= 20;

  if (visibilityKm >= 20) score += 20;
  else if (visibilityKm >= 10) score += 10;
  else if (visibilityKm >= 5) score -= 10;
  else score -= 30;

  if (lightQuality === 'golden') score += 15;
  else if (lightQuality === 'blue') score += 8;

  if (windMph < 10) score += 5;
  else if (windMph >= 25) score -= 20;
  else if (windMph >= 15) score -= 10;

  if (precipMM === 0 && precipProb < 20) score += 15;
  else if (precipMM <= 0.2) score += 0;
  else if (precipMM <= 1.0) score -= 15;
  else score -= 35;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreFactors(loc, conditions, lightQuality) {
  const { cloudCover = 50, precipMM = 0, precipProb = 0, visibilityKm = 15, windMph = 10 } = conditions ?? {};
  const isCity = loc.category === 'city';

  // Light quality — city prefers diffused cloud; nature prefers golden/clear
  let light;
  if (isCity) {
    if (lightQuality === 'golden')                       light = { rating: 'excellent', description: 'Golden hour glow' };
    else if (lightQuality === 'blue')                    light = { rating: 'excellent', description: 'Blue hour — soft and even' };
    else if (cloudCover >= 40 && cloudCover <= 80)       light = { rating: 'good',      description: 'Diffused cloud light — flattering for cities' };
    else if (cloudCover > 80)                            light = { rating: 'fair',      description: 'Overcast — flat but consistent' };
    else                                                 light = { rating: 'fair',      description: 'Direct sun — watch for harsh shadows' };
  } else {
    if (lightQuality === 'golden')                       light = { rating: 'excellent', description: 'Golden hour — warm, dramatic light' };
    else if (lightQuality === 'blue')                    light = { rating: 'good',      description: 'Blue hour — cool, moody tones' };
    else if (cloudCover <= 30)                           light = { rating: 'good',      description: 'Clear sky — crisp, bright light' };
    else if (cloudCover <= 60)                           light = { rating: 'fair',      description: 'Partly cloudy — variable light' };
    else                                                 light = { rating: 'poor',      description: 'Heavy cloud — views may be obscured' };
  }

  // Visibility
  let visibility;
  if (visibilityKm >= 20)      visibility = { rating: 'excellent', description: 'Crystal clear — 20+ km' };
  else if (visibilityKm >= 10) visibility = { rating: 'good',      description: `Good — ${Math.round(visibilityKm)}km` };
  else if (visibilityKm >= 5)  visibility = { rating: 'fair',      description: `Some haze — ${Math.round(visibilityKm)}km` };
  else                         visibility = { rating: 'poor',      description: `Low — ${Math.round(visibilityKm)}km` };

  // Rain risk
  let rain;
  if (precipMM === 0 && precipProb < 20)             rain = { rating: 'excellent', description: 'Dry, no rain forecast' };
  else if (precipMM <= 0.5 && precipProb < 40)       rain = { rating: 'good',      description: 'Light chance of drizzle' };
  else if (precipMM <= 2 || precipProb < 70)         rain = { rating: 'fair',      description: 'Rain possible — bring cover' };
  else                                               rain = { rating: 'poor',      description: 'Wet conditions expected' };

  // Wind & stability
  let wind;
  if (windMph < 5)        wind = { rating: 'excellent', description: 'Calm — ideal for long exposures' };
  else if (windMph < 12)  wind = { rating: 'good',      description: `${Math.round(windMph)}mph — light breeze` };
  else if (windMph < 20)  wind = { rating: 'fair',      description: `${Math.round(windMph)}mph — consider a stabilizer` };
  else                    wind = { rating: 'poor',      description: `${Math.round(windMph)}mph — difficult to stabilize` };

  return [
    { label: 'Light quality', ...light },
    { label: 'Visibility',    ...visibility },
    { label: 'Rain risk',     ...rain },
    { label: 'Wind',          ...wind },
  ];
}

export function scoreColor(score) {
  if (score >= 80) return 'emerald';
  if (score >= 60) return 'lime';
  if (score >= 40) return 'amber';
  return 'red';
}

export function scoreLabel(score) {
  if (score >= 70) return 'Great';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

export function getDayVerdict(cityScore, natureScore) {
  return {
    city: scoreLabel(cityScore),
    nature: scoreLabel(natureScore),
    recommended: cityScore >= natureScore ? 'city' : 'nature',
  };
}

export function scoreAstroLocation(h) {
  const { cloudCover = 50, precipMM = 0, precipProb = 0, visibilityKm = 15, windMph = 10 } = h;
  let score = 20;

  // Cloud cover dominates astro — even 30% clouds can obscure the Milky Way
  if (cloudCover <= 5)  score += 50;
  else if (cloudCover <= 15) score += 35;
  else if (cloudCover <= 30) score += 15;
  else if (cloudCover <= 50) score -= 10;
  else if (cloudCover <= 75) score -= 30;
  else score -= 50;

  // Visibility is critical at night — haze/smoke kills contrast
  if (visibilityKm >= 20) score += 20;
  else if (visibilityKm >= 15) score += 12;
  else if (visibilityKm >= 10) score += 0;
  else if (visibilityKm >= 5)  score -= 15;
  else score -= 35;

  // Any precipitation ruins a long-exposure session
  if (precipMM === 0 && precipProb < 10)  score += 15;
  else if (precipMM > 0)   score -= 40;
  else if (precipProb > 30) score -= 20;
  else if (precipProb > 10) score -= 8;

  // Wind matters less for astro but affects long exposures
  if (windMph < 5)   score += 5;
  else if (windMph > 20) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function average(nums) {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
