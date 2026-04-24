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
