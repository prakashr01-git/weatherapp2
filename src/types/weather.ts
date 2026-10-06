export interface GeoLocation {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  elevation?: number;
  population?: number;
}

export interface CurrentWeather {
  temperature: number;
  apparent_temperature: number;
  relative_humidity: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
  uv_index: number;
  time: string;
}

export interface DailyForecast {
  date: string;
  formattedDate: string;
  dayName: string;
  weather_code: number;
  temperature_max: number;
  temperature_min: number;
  apparent_temperature_max: number;
  apparent_temperature_min: number;
  precipitation_sum: number;
  precipitation_probability_max: number;
  wind_speed_max: number;
  uv_index_max: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;
  formattedHour: string;
  temperature: number;
  precipitation_probability: number;
  weather_code: number;
  is_day: boolean;
}

export type RecommendationCategory =
  | 'attire'
  | 'umbrella'
  | 'outdoor'
  | 'uv'
  | 'commute'
  | 'ventilation';

export type RecommendationSeverity = 'optimal' | 'moderate' | 'caution' | 'alert';

export interface WeatherRecommendation {
  id: string;
  category: RecommendationCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  action: string;
  severity: RecommendationSeverity;
  metricLabel: string;
  metricValue: string;
}

export type UnitSystem = 'metric' | 'imperial';

export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  recommendations: WeatherRecommendation[];
  unitSystem: UnitSystem;
  fetchedAt: number;
}
