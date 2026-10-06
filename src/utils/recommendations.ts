import { CurrentWeather, DailyForecast, WeatherRecommendation } from '../types/weather';

export function generateWeatherRecommendations(
  current: CurrentWeather,
  todayDaily: DailyForecast | undefined,
  unitSystem: 'metric' | 'imperial'
): WeatherRecommendation[] {
  const recommendations: WeatherRecommendation[] = [];

  // Convert temp to Celsius internally for standardized calculation logic
  const tempC = unitSystem === 'metric' ? current.temperature : ((current.temperature - 32) * 5) / 9;
  const feelsLikeC = unitSystem === 'metric' ? current.apparent_temperature : ((current.apparent_temperature - 32) * 5) / 9;
  const rainProb = todayDaily ? todayDaily.precipitation_probability_max : (current.precipitation > 0 ? 90 : 10);
  const uv = current.uv_index || (todayDaily?.uv_index_max ?? 1);
  const windKmh = unitSystem === 'metric' ? current.wind_speed : current.wind_speed * 1.60934;
  const windGustsKmh = unitSystem === 'metric' ? current.wind_gusts : current.wind_gusts * 1.60934;

  // 1. ATTIRE & CLOTHING RECOMMENDATION
  if (feelsLikeC < 0) {
    recommendations.push({
      id: 'attire',
      category: 'attire',
      categoryLabel: 'Clothing & Layers',
      title: 'Heavy Thermal Winter Wear',
      summary: 'Freezing temperatures with sharp wind chill. Risk of rapid heat loss.',
      action: 'Wear insulated winter parka, thermal base layers, gloves, and a fleece beanie.',
      severity: 'alert',
      metricLabel: 'Feels Like',
      metricValue: `${Math.round(current.apparent_temperature)}°`,
    });
  } else if (feelsLikeC < 10) {
    recommendations.push({
      id: 'attire',
      category: 'attire',
      categoryLabel: 'Clothing & Layers',
      title: 'Warm Layers & Coat',
      summary: 'Crisp, chilly atmospheric conditions throughout the day.',
      action: 'Layer a wool sweater or fleece under a mid-weight jacket or overcoat.',
      severity: 'caution',
      metricLabel: 'Feels Like',
      metricValue: `${Math.round(current.apparent_temperature)}°`,
    });
  } else if (feelsLikeC < 18) {
    recommendations.push({
      id: 'attire',
      category: 'attire',
      categoryLabel: 'Clothing & Layers',
      title: 'Light Jacket or Windbreaker',
      summary: 'Mild, brisk conditions with potential for breezy spells.',
      action: 'A light bomber, cardigan, or denim jacket over long sleeves is ideal.',
      severity: 'moderate',
      metricLabel: 'Feels Like',
      metricValue: `${Math.round(current.apparent_temperature)}°`,
    });
  } else if (feelsLikeC <= 26) {
    recommendations.push({
      id: 'attire',
      category: 'attire',
      categoryLabel: 'Clothing & Layers',
      title: 'Light Casual Attire',
      summary: 'Pleasant, temperate climate ideal for standard breathable fabrics.',
      action: 'Short sleeves, breathable cottons, t-shirts, or light shirts are recommended.',
      severity: 'optimal',
      metricLabel: 'Feels Like',
      metricValue: `${Math.round(current.apparent_temperature)}°`,
    });
  } else if (feelsLikeC <= 33) {
    recommendations.push({
      id: 'attire',
      category: 'attire',
      categoryLabel: 'Clothing & Layers',
      title: 'Loose Summer Clothing',
      summary: 'Warm to hot conditions with elevated thermal load.',
      action: 'Wear loose-fitting linen or moisture-wicking wear, and stay hydrated.',
      severity: 'caution',
      metricLabel: 'Feels Like',
      metricValue: `${Math.round(current.apparent_temperature)}°`,
    });
  } else {
    recommendations.push({
      id: 'attire',
      category: 'attire',
      categoryLabel: 'Clothing & Layers',
      title: 'Extreme Heat Protection',
      summary: 'Intense atmospheric heat. High dehydration and thermal stress hazard.',
      action: 'Ultra-lightweight breathable fabrics, hat, sunglasses, and frequent electrolyte hydration.',
      severity: 'alert',
      metricLabel: 'Feels Like',
      metricValue: `${Math.round(current.apparent_temperature)}°`,
    });
  }

  // 2. UMBRELLA & RAIN ADVISORY
  const isRainingNow = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(current.weather_code);
  const isSnowingNow = [71, 73, 75, 77, 85, 86].includes(current.weather_code);

  if (isRainingNow || rainProb >= 65) {
    recommendations.push({
      id: 'umbrella',
      category: 'umbrella',
      categoryLabel: 'Precipitation Gear',
      title: 'Umbrella Essential',
      summary: isRainingNow ? 'Active rainfall occurring now.' : `High likelihood of rainfall today (${rainProb}% max probability).`,
      action: 'Carry a sturdy umbrella and wear water-resistant footwear before heading out.',
      severity: 'alert',
      metricLabel: 'Precipitation Chance',
      metricValue: `${rainProb}%`,
    });
  } else if (rainProb >= 30) {
    recommendations.push({
      id: 'umbrella',
      category: 'umbrella',
      categoryLabel: 'Precipitation Gear',
      title: 'Keep Compact Umbrella Ready',
      summary: `Moderate risk of scattered showers (${rainProb}% probability).`,
      action: 'Tuck a compact travel umbrella or hooded shell in your bag as a precaution.',
      severity: 'moderate',
      metricLabel: 'Precipitation Chance',
      metricValue: `${rainProb}%`,
    });
  } else if (isSnowingNow) {
    recommendations.push({
      id: 'umbrella',
      category: 'umbrella',
      categoryLabel: 'Precipitation Gear',
      title: 'Snow & Slush Preparedness',
      summary: 'Active snowfall or wintry precipitation detected.',
      action: 'Tread-soled waterproof boots and water-repellent outer layer recommended.',
      severity: 'caution',
      metricLabel: 'Precipitation',
      metricValue: `${current.snowfall > 0 ? current.snowfall : 'Snow'}`,
    });
  } else {
    recommendations.push({
      id: 'umbrella',
      category: 'umbrella',
      categoryLabel: 'Precipitation Gear',
      title: 'No Umbrella Needed',
      summary: `Low precipitation probability (${rainProb}%). Dry conditions forecast.`,
      action: 'Travel light without bulky rain protection gear.',
      severity: 'optimal',
      metricLabel: 'Precipitation Chance',
      metricValue: `${rainProb}%`,
    });
  }

  // 3. OUTDOOR ACTIVITIES & RUNNING
  const isSevereWeather = [95, 96, 99, 65, 67, 82].includes(current.weather_code) || windGustsKmh > 55;
  const isSuboptimalRunning = rainProb > 50 || tempC < 2 || tempC > 30 || windKmh > 30;

  if (isSevereWeather) {
    recommendations.push({
      id: 'outdoor',
      category: 'outdoor',
      categoryLabel: 'Outdoor Activities',
      title: 'Postpone Outdoor Workouts',
      summary: 'Harsh conditions with storm instability or hazardous gusts.',
      action: 'Favor indoor gyms, treadmill sessions, or home workout routines today.',
      severity: 'alert',
      metricLabel: 'Wind Gusts',
      metricValue: `${Math.round(current.wind_gusts)} ${unitSystem === 'metric' ? 'km/h' : 'mph'}`,
    });
  } else if (isSuboptimalRunning) {
    recommendations.push({
      id: 'outdoor',
      category: 'outdoor',
      categoryLabel: 'Outdoor Activities',
      title: 'Moderate Running Conditions',
      summary: 'Noticeable resistance from wind, precipitation, or temperatures.',
      action: 'Opt for sheltered paths; adjust pace and hydrate more frequently.',
      severity: 'caution',
      metricLabel: 'Relative Humidity',
      metricValue: `${current.relative_humidity}%`,
    });
  } else {
    recommendations.push({
      id: 'outdoor',
      category: 'outdoor',
      categoryLabel: 'Outdoor Activities',
      title: 'Prime Outdoor Conditions',
      summary: 'Clear skies, manageable wind, and comfortable thermal balance.',
      action: 'Excellent window for running, cycling, walks, or park recreation.',
      severity: 'optimal',
      metricLabel: 'Wind Speed',
      metricValue: `${Math.round(current.wind_speed)} ${unitSystem === 'metric' ? 'km/h' : 'mph'}`,
    });
  }

  // 4. UV INDEX & SUN PROTECTION
  if (uv >= 8) {
    recommendations.push({
      id: 'uv',
      category: 'uv',
      categoryLabel: 'Sun & UV Exposure',
      title: 'Very High UV Radiation',
      summary: `UV Index reaching ${Math.round(uv)}. Skin can burn in under 15 minutes of unprotected sun.`,
      action: 'Apply broad-spectrum SPF 50+, wear polarized sunglasses, and seek shade between 11 AM - 4 PM.',
      severity: 'alert',
      metricLabel: 'UV Index',
      metricValue: `${uv.toFixed(1)} / 12`,
    });
  } else if (uv >= 5) {
    recommendations.push({
      id: 'uv',
      category: 'uv',
      categoryLabel: 'Sun & UV Exposure',
      title: 'Moderate UV Index',
      summary: `UV Index is ${Math.round(uv)}. Noticeable solar exposure during midday hours.`,
      action: 'Apply SPF 30+ sunscreen if outdoors for extended periods and wear UV-blocking sunglasses.',
      severity: 'caution',
      metricLabel: 'UV Index',
      metricValue: `${uv.toFixed(1)} / 12`,
    });
  } else {
    recommendations.push({
      id: 'uv',
      category: 'uv',
      categoryLabel: 'Sun & UV Exposure',
      title: 'Low UV Radiation',
      summary: `Minimal solar UV intensity (Index ${uv.toFixed(1)}).`,
      action: 'Safe for general outdoor exposure without specialized sun shielding.',
      severity: 'optimal',
      metricLabel: 'UV Index',
      metricValue: `${uv.toFixed(1)} / 12`,
    });
  }

  // 5. COMMUTE & ROAD TRAVEL
  if ([45, 48].includes(current.weather_code)) {
    recommendations.push({
      id: 'commute',
      category: 'commute',
      categoryLabel: 'Transit & Commute',
      title: 'Dense Fog: Reduce Travel Speed',
      summary: 'Restricted sightlines and surface moisture reducing braking distance.',
      action: 'Use low-beam fog lights, double your following distance, and allow extra commute time.',
      severity: 'alert',
      metricLabel: 'Atmospheric State',
      metricValue: 'Foggy',
    });
  } else if ([56, 57, 66, 67, 71, 73, 75].includes(current.weather_code)) {
    recommendations.push({
      id: 'commute',
      category: 'commute',
      categoryLabel: 'Transit & Commute',
      title: 'Slippery Road Warning',
      summary: 'Ice or snow accumulations creating hazardous transit traction.',
      action: 'Avoid abrupt braking or rapid steering changes; watch for black ice on overpasses.',
      severity: 'alert',
      metricLabel: 'Hazard',
      metricValue: 'Slick Roads',
    });
  } else if (isRainingNow || rainProb > 50) {
    recommendations.push({
      id: 'commute',
      category: 'commute',
      categoryLabel: 'Transit & Commute',
      title: 'Wet Roadways & Spray',
      summary: 'Surface ponding and spray from commercial vehicles may lower visibility.',
      action: 'Turn on headlights, ensure wiper blades are functioning, and avoid cruise control.',
      severity: 'caution',
      metricLabel: 'Road State',
      metricValue: 'Wet',
    });
  } else {
    recommendations.push({
      id: 'commute',
      category: 'commute',
      categoryLabel: 'Transit & Commute',
      title: 'Clear Travel Conditions',
      summary: 'Unobstructed visibility and standard road surface friction.',
      action: 'Normal commute and transit timetables expected.',
      severity: 'optimal',
      metricLabel: 'Visibility',
      metricValue: 'Optimal',
    });
  }

  // 6. INDOOR VENTILATION & COMFORT
  if (tempC >= 18 && tempC <= 24 && current.relative_humidity < 65 && rainProb < 20 && windKmh < 25) {
    recommendations.push({
      id: 'ventilation',
      category: 'ventilation',
      categoryLabel: 'Home & Ventilation',
      title: 'Ideal Window Ventilation',
      summary: 'Pleasant ambient air quality and comfortable temperature outside.',
      action: 'Open windows for 20-30 minutes to circulate fresh outdoor air and lower indoor CO2.',
      severity: 'optimal',
      metricLabel: 'Humidity',
      metricValue: `${current.relative_humidity}%`,
    });
  } else if (current.relative_humidity > 80 || isRainingNow) {
    recommendations.push({
      id: 'ventilation',
      category: 'ventilation',
      categoryLabel: 'Home & Ventilation',
      title: 'Keep Windows Closed',
      summary: 'Elevated outdoor humidity or airborne moisture ingress.',
      action: 'Rely on dehumidifiers or HVAC air recirculators to maintain indoor dryness.',
      severity: 'moderate',
      metricLabel: 'Humidity',
      metricValue: `${current.relative_humidity}%`,
    });
  } else {
    recommendations.push({
      id: 'ventilation',
      category: 'ventilation',
      categoryLabel: 'Home & Ventilation',
      title: 'Maintain Regulated Climate',
      summary: 'Outdoor thermal gradient differs from standard indoor comfort baseline.',
      action: 'Keep exterior doors and windows sealed to optimize heating/cooling efficiency.',
      severity: 'moderate',
      metricLabel: 'Exterior Temp',
      metricValue: `${Math.round(current.temperature)}°`,
    });
  }

  return recommendations;
}
