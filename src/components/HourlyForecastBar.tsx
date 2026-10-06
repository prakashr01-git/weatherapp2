import React from 'react';
import { CloudRain } from 'lucide-react';
import { HourlyForecast, UnitSystem } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastBarProps {
  hourly: HourlyForecast[];
  unitSystem: UnitSystem;
}

export const HourlyForecastBar: React.FC<HourlyForecastBarProps> = ({ hourly, unitSystem }) => {
  const tempUnit = unitSystem === 'metric' ? '°C' : '°F';

  return (
    <section id="hourly-trend" className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <h2 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>24-Hour Atmospheric Timeline</span>
        </h2>
        <span className="text-xs font-mono text-slate-400">
          Hourly Granularity
        </span>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth">
        {hourly.map((item, idx) => {
          const isHighRain = item.precipitation_probability >= 40;
          return (
            <div
              key={`${item.time}-${idx}`}
              className="flex flex-col items-center justify-between min-w-[76px] sm:min-w-[84px] p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/60 border border-slate-800 transition-colors shrink-0"
            >
              {/* Hour */}
              <span className={`text-xs font-mono font-medium ${idx === 0 ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}>
                {item.formattedHour}
              </span>

              {/* Weather Icon */}
              <div className="my-2.5">
                <WeatherIcon
                  code={item.weather_code}
                  isDay={item.is_day ? 1 : 0}
                  className="w-6 h-6"
                />
              </div>

              {/* Temperature */}
              <span className="text-sm font-semibold font-mono text-slate-100 tabular-nums">
                {Math.round(item.temperature)}°
              </span>

              {/* Rain Probability */}
              <div className="mt-2 w-full flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <CloudRain className={`w-3 h-3 ${isHighRain ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className={`tabular-nums ${isHighRain ? 'text-blue-300 font-medium' : ''}`}>
                    {item.precipitation_probability}%
                  </span>
                </div>

                {/* Micro probability progress bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isHighRain ? 'bg-blue-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.min(item.precipitation_probability, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
