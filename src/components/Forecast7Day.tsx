import React, { useState } from 'react';
import { CloudRain, ChevronRight } from 'lucide-react';
import { DailyForecast, UnitSystem } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { DayDetailModal } from './DayDetailModal';

interface Forecast7DayProps {
  daily: DailyForecast[];
  unitSystem: UnitSystem;
}

export const Forecast7Day: React.FC<Forecast7DayProps> = ({ daily, unitSystem }) => {
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  const tempUnit = unitSystem === 'metric' ? '°' : '°';

  // Find min and max across all 7 days for relative visual range bar
  const weekMin = Math.min(...daily.map((d) => d.temperature_min));
  const weekMax = Math.max(...daily.map((d) => d.temperature_max));
  const totalRange = weekMax - weekMin || 1;

  return (
    <section id="7-day-forecast" className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            7-Day Weather Forecast
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Extended outlook with precipitation probabilities and thermal ranges. Click any day for details.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          7-Day Outlook
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {daily.map((day, idx) => {
          const weatherInfo = getWeatherInfo(day.weather_code, 1);
          const isToday = idx === 0;

          // Bar calculations
          const leftPercent = Math.max(0, ((day.temperature_min - weekMin) / totalRange) * 100);
          const rightPercent = Math.min(100, ((day.temperature_max - weekMin) / totalRange) * 100);
          const barWidth = Math.max(12, rightPercent - leftPercent);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between group hover:scale-[1.01] ${
                isToday
                  ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-500/70 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/80'
              }`}
            >
              {/* Top: Day name & date */}
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isToday ? 'text-cyan-300' : 'text-slate-100'}`}>
                    {day.dayName}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {day.formattedDate}
                </div>
              </div>

              {/* Middle: Icon & condition */}
              <div className="my-4 flex flex-col items-start gap-2">
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                  <WeatherIcon code={day.weather_code} isDay={1} className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-1">
                    {weatherInfo.label}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-0.5">
                    <CloudRain className="w-3 h-3 text-blue-400" />
                    <span>{day.precipitation_probability_max}%</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Temperatures */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60 w-full">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-normal">
                    {Math.round(day.temperature_min)}{tempUnit}
                  </span>
                  <span className="text-slate-100 font-semibold">
                    {Math.round(day.temperature_max)}{tempUnit}
                  </span>
                </div>

                {/* Range bar */}
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 rounded-full"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal for inspect details */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          unitSystem={unitSystem}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </section>
  );
};
