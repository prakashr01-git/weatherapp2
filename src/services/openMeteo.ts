import { GeoLocation, UnitSystem, WeatherData, DailyForecast, HourlyForecast } from '../types/weather';
import { generateWeatherRecommendations } from '../utils/recommendations';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export class CityNotFoundError extends Error {
  constructor(cityName: string) {
    super(`No weather data found for "${cityName}". Please check the spelling or try another city.`);
    this.name = 'CityNotFoundError';
  }
}

export async function searchCities(query: string): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding service error (${response.status})`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
    return [];
  }

  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    country_code: item.country_code,
    admin1: item.admin1,
    admin2: item.admin2,
    timezone: item.timezone,
    elevation: item.elevation,
    population: item.population,
  }));
}

export async function fetchWeatherForLocation(
  location: GeoLocation,
  unitSystem: UnitSystem = 'metric'
): Promise<WeatherData> {
  const tempUnit = unitSystem === 'imperial' ? 'fahrenheit' : 'celsius';
  const windUnit = unitSystem === 'imperial' ? 'mph' : 'kmh';
  const precipUnit = unitSystem === 'imperial' ? 'inch' : 'mm';

  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'weather_code',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'auto',
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    precipitation_unit: precipUnit,
  });

  const url = `${FORECAST_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather forecast service unavailable (${response.status})`);
  }

  const raw = await response.json();

  if (!raw.current || !raw.daily || !raw.hourly) {
    throw new Error('Incomplete meteorological data payload returned from service.');
  }

  // Parse Current
  const current = {
    temperature: raw.current.temperature_2m ?? 0,
    apparent_temperature: raw.current.apparent_temperature ?? raw.current.temperature_2m ?? 0,
    relative_humidity: raw.current.relative_humidity_2m ?? 50,
    is_day: raw.current.is_day ?? 1,
    precipitation: raw.current.precipitation ?? 0,
    rain: raw.current.rain ?? 0,
    showers: raw.current.showers ?? 0,
    snowfall: raw.current.snowfall ?? 0,
    weather_code: raw.current.weather_code ?? 0,
    cloud_cover: raw.current.cloud_cover ?? 0,
    pressure_msl: raw.current.pressure_msl ?? 1013,
    surface_pressure: raw.current.surface_pressure ?? 1013,
    wind_speed: raw.current.wind_speed_10m ?? 0,
    wind_direction: raw.current.wind_direction_10m ?? 0,
    wind_gusts: raw.current.wind_gusts_10m ?? raw.current.wind_speed_10m ?? 0,
    uv_index: raw.current.uv_index ?? 0,
    time: raw.current.time,
  };

  // Parse 7-day daily forecast
  const daily: DailyForecast[] = [];
  const dailyLength = Math.min(raw.daily.time?.length || 0, 7);

  const dayFormatters = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthFormatters = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < dailyLength; i++) {
    const dateStr = raw.daily.time[i];
    // Create Date object ensuring clean local day calculation
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dayFormatters[dateObj.getDay()];
    const monthName = monthFormatters[dateObj.getMonth()];

    daily.push({
      date: dateStr,
      formattedDate: `${monthName} ${day}`,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayOfWeek,
      weather_code: raw.daily.weather_code?.[i] ?? 0,
      temperature_max: raw.daily.temperature_2m_max?.[i] ?? 0,
      temperature_min: raw.daily.temperature_2m_min?.[i] ?? 0,
      apparent_temperature_max: raw.daily.apparent_temperature_max?.[i] ?? 0,
      apparent_temperature_min: raw.daily.apparent_temperature_min?.[i] ?? 0,
      precipitation_sum: raw.daily.precipitation_sum?.[i] ?? 0,
      precipitation_probability_max: raw.daily.precipitation_probability_max?.[i] ?? 0,
      wind_speed_max: raw.daily.wind_speed_10m_max?.[i] ?? 0,
      uv_index_max: raw.daily.uv_index_max?.[i] ?? 0,
      sunrise: raw.daily.sunrise?.[i]?.split('T')?.[1]?.slice(0, 5) || '--:--',
      sunset: raw.daily.sunset?.[i]?.split('T')?.[1]?.slice(0, 5) || '--:--',
    });
  }

  // Parse Hourly forecast for next 24 hours starting from current hour
  const hourly: HourlyForecast[] = [];
  const currentIsoPrefix = raw.current.time ? raw.current.time.slice(0, 13) : '';
  const hourlyTimes: string[] = raw.hourly.time || [];
  
  let startIndex = hourlyTimes.findIndex((t) => t.startsWith(currentIsoPrefix));
  if (startIndex === -1) {
    startIndex = 0;
  }

  const next24 = hourlyTimes.slice(startIndex, startIndex + 24);
  for (let j = 0; j < next24.length; j++) {
    const rawIdx = startIndex + j;
    const timeIso = raw.hourly.time[rawIdx];
    const hourStr = timeIso.split('T')?.[1]?.slice(0, 5) || '';

    hourly.push({
      time: timeIso,
      formattedHour: j === 0 ? 'Now' : hourStr,
      temperature: raw.hourly.temperature_2m?.[rawIdx] ?? 0,
      precipitation_probability: raw.hourly.precipitation_probability?.[rawIdx] ?? 0,
      weather_code: raw.hourly.weather_code?.[rawIdx] ?? 0,
      is_day: (raw.hourly.is_day?.[rawIdx] ?? 1) === 1,
    });
  }

  // Compute smart recommendations
  const recommendations = generateWeatherRecommendations(current, daily[0], unitSystem);

  return {
    location,
    current,
    daily,
    hourly,
    recommendations,
    unitSystem,
    fetchedAt: Date.now(),
  };
}

export async function reverseGeocodeCoordinates(lat: number, lon: number): Promise<GeoLocation> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
      return {
        name,
        latitude: lat,
        longitude: lon,
        country: data.countryName || undefined,
        country_code: data.countryCode || undefined,
        admin1: data.principalSubdivision || undefined,
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    name: 'Current Coordinates',
    latitude: lat,
    longitude: lon,
    admin1: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
  };
}
