import React, { useEffect } from 'react';
import { X, Sunrise, Sunset, Wind, Sun, CloudRain, Thermometer } from 'lucide-react';
import { DailyForecast, UnitSystem } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface DayDetailModalProps {
  day: DailyForecast;
  unitSystem: UnitSystem;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ day, unitSystem, onClose }) => {
  const info = getWeatherInfo(day.weather_code, 1);
  const tempUnit = unitSystem === 'metric' ? '°C' : '°F';
  const speedUnit = unitSystem === 'metric' ? 'km/h' : 'mph';
  const precipUnit = unitSystem === 'metric' ? 'mm' : 'in';

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background atmospheric gradient */}
        <div
          className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${info.theme.bgGradient} blur-2xl pointer-events-none opacity-60`}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-100">{day.dayName}</span>
              <span className="text-sm text-slate-400">({day.formattedDate})</span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{day.date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Condition overview */}
        <div className="my-5 flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 shrink-0">
            <WeatherIcon code={day.weather_code} isDay={1} className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{info.label}</h4>
            <p className="text-sm text-slate-400">{info.description}</p>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Temperature Range */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>Temperature</span>
            </div>
            <div className="font-mono text-base font-semibold text-slate-100 tabular-nums">
              {Math.round(day.temperature_min)}{tempUnit} ~ {Math.round(day.temperature_max)}{tempUnit}
            </div>
            <div className="text-[11px] text-slate-400">
              Apparent: {Math.round(day.apparent_temperature_min)}{tempUnit} ~ {Math.round(day.apparent_temperature_max)}{tempUnit}
            </div>
          </div>

          {/* Precipitation */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>Precipitation</span>
            </div>
            <div className="font-mono text-base font-semibold text-slate-100 tabular-nums">
              {day.precipitation_probability_max}%
            </div>
            <div className="text-[11px] text-slate-400">
              Accumulation: {day.precipitation_sum.toFixed(1)} {precipUnit}
            </div>
          </div>

          {/* Wind Speed */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Max Wind</span>
            </div>
            <div className="font-mono text-base font-semibold text-slate-100 tabular-nums">
              {Math.round(day.wind_speed_max)} {speedUnit}
            </div>
            <div className="text-[11px] text-slate-400">
              Peak estimated gusts
            </div>
          </div>

          {/* UV Index */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Max UV Index</span>
            </div>
            <div className="font-mono text-base font-semibold text-slate-100 tabular-nums">
              {day.uv_index_max.toFixed(1)} / 12
            </div>
            <div className="text-[11px] text-slate-400">
              {day.uv_index_max >= 8 ? 'Very High' : day.uv_index_max >= 5 ? 'Moderate to High' : 'Low'}
            </div>
          </div>
        </div>

        {/* Sunrise / Sunset */}
        <div className="mt-4 p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-around text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-200">
            <Sunrise className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Sunrise:</span>
            <span className="tabular-nums font-semibold">{day.sunrise}</span>
          </div>
          <span className="text-slate-700" aria-hidden="true">|</span>
          <div className="flex items-center gap-2 text-slate-200">
            <Sunset className="w-4 h-4 text-rose-400" />
            <span className="text-slate-400">Sunset:</span>
            <span className="tabular-nums font-semibold">{day.sunset}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Outlook
          </button>
        </div>
      </div>
    </div>
  );
};
