import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Eye,
  Compass,
  Gauge,
  Sunrise,
  Sunset,
  CloudRain,
  MapPin,
  Clock,
} from 'lucide-react';
import { WeatherData } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  weather: WeatherData;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ weather }) => {
  const { current, location, daily, unitSystem } = weather;
  const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
  const todayForecast = daily[0];

  const tempUnit = unitSystem === 'metric' ? '°C' : '°F';
  const speedUnit = unitSystem === 'metric' ? 'km/h' : 'mph';
  const precipUnit = unitSystem === 'metric' ? 'mm' : 'in';

  // Format local observation time
  const observationTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate UV description
  const getUvDescription = (uv: number) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <section
      id="current-weather"
      className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden"
    >
      {/* Subtle dynamic atmospheric background accent */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br ${weatherInfo.theme.bgGradient} blur-3xl pointer-events-none opacity-60`}
      />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Location & Timestamp header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {location.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mt-1 pl-7">
              {location.admin1 && <span>{location.admin1}</span>}
              {location.admin1 && location.country && <span aria-hidden="true">·</span>}
              {location.country && <span>{location.country}</span>}
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400 tabular-nums">
                {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono sm:self-start">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated {observationTime}</span>
          </div>
        </div>

        {/* Primary Hero Display: Temp & Current Condition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Temperature & Condition Block */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-7xl sm:text-8xl font-light tracking-tighter text-white font-mono tabular-nums">
                {Math.round(current.temperature)}
              </span>
              <span className="text-3xl sm:text-4xl text-slate-400 font-mono font-light">
                {tempUnit}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                <WeatherIcon code={current.weather_code} isDay={current.is_day} className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-semibold text-slate-100 flex items-center gap-2">
                  <span>{weatherInfo.label}</span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{weatherInfo.description}</p>
              </div>
            </div>

            {/* High / Low & Feels Like */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-xs uppercase font-mono">Feels like</span>
                <span className="font-mono font-medium text-slate-100 tabular-nums">
                  {Math.round(current.apparent_temperature)}{tempUnit}
                </span>
              </div>
              <span className="text-slate-700" aria-hidden="true">|</span>
              {todayForecast && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs uppercase font-mono">High</span>
                    <span className="font-mono font-medium text-slate-100 tabular-nums">
                      {Math.round(todayForecast.temperature_max)}{tempUnit}
                    </span>
                  </div>
                  <span className="text-slate-700" aria-hidden="true">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs uppercase font-mono">Low</span>
                    <span className="font-mono font-medium text-slate-100 tabular-nums">
                      {Math.round(todayForecast.temperature_min)}{tempUnit}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meteorological Telemetry Grid (6 Metrics) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* 1. Humidity */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono tracking-wider">Humidity</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white tabular-nums">
                  {current.relative_humidity}
                  <span className="text-xs font-mono text-slate-400 ml-1">%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {current.relative_humidity > 70 ? 'High moisture' : current.relative_humidity < 30 ? 'Dry air' : 'Comfortable'}
                </div>
              </div>
            </div>

            {/* 2. Wind */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono tracking-wider">Wind</span>
                <Wind className="w-4 h-4 text-teal-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white tabular-nums">
                  {Math.round(current.wind_speed)}
                  <span className="text-xs font-mono text-slate-400 ml-1">{speedUnit}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Compass
                    className="w-3 h-3 text-teal-400 inline"
                    style={{ transform: `rotate(${current.wind_direction}deg)` }}
                  />
                  <span>Gusts {Math.round(current.wind_gusts)} {speedUnit}</span>
                </div>
              </div>
            </div>

            {/* 3. UV Index */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono tracking-wider">UV Index</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white tabular-nums">
                  {current.uv_index ? current.uv_index.toFixed(1) : (todayForecast?.uv_index_max?.toFixed(1) ?? '0.0')}
                  <span className="text-xs font-mono text-slate-400 ml-1">/ 12</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {getUvDescription(current.uv_index || todayForecast?.uv_index_max || 0)}
                </div>
              </div>
            </div>

            {/* 4. Atmospheric Pressure */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono tracking-wider">Pressure</span>
                <Gauge className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white tabular-nums">
                  {Math.round(current.pressure_msl)}
                  <span className="text-xs font-mono text-slate-400 ml-1">hPa</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {current.pressure_msl > 1020 ? 'High Barometer' : current.pressure_msl < 1005 ? 'Low Barometer' : 'Standard MSL'}
                </div>
              </div>
            </div>

            {/* 5. Precipitation */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono tracking-wider">Rain / Precip</span>
                <CloudRain className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white tabular-nums">
                  {current.precipitation.toFixed(1)}
                  <span className="text-xs font-mono text-slate-400 ml-1">{precipUnit}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {todayForecast ? `${todayForecast.precipitation_probability_max}% chance` : 'Low probability'}
                </div>
              </div>
            </div>

            {/* 6. Sunrise / Sunset */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono tracking-wider">Sun Cycle</span>
                <Sunrise className="w-4 h-4 text-amber-300" />
              </div>
              <div className="mt-2 space-y-0.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sunrise className="w-3 h-3 text-amber-400" /> Rise
                  </span>
                  <span className="tabular-nums">{todayForecast?.sunrise || '--:--'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sunset className="w-3 h-3 text-rose-400" /> Set
                  </span>
                  <span className="tabular-nums">{todayForecast?.sunset || '--:--'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
