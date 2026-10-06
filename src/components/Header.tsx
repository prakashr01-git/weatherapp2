import React from 'react';
import { Locate, RefreshCw } from 'lucide-react';
import { UnitSystem } from '../types/weather';

interface HeaderProps {
  unitSystem: UnitSystem;
  onToggleUnit: (unit: UnitSystem) => void;
  onUseCurrentLocation: () => void;
  onRefresh: () => void;
  isLocating: boolean;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  unitSystem,
  onToggleUnit,
  onUseCurrentLocation,
  onRefresh,
  isLocating,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-base sm:text-lg font-semibold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          Weather Intelligence
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <a href="#current-weather" className="hover:text-slate-200 transition-colors">
            Current
          </a>
          <a href="#world-map-view" className="hover:text-slate-200 transition-colors">
            World Map
          </a>
          <a href="#recommendations" className="hover:text-slate-200 transition-colors">
            Recommendations
          </a>
          <a href="#7-day-forecast" className="hover:text-slate-200 transition-colors">
            7-Day Forecast
          </a>
          <a href="#hourly-trend" className="hover:text-slate-200 transition-colors">
            Hourly
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onToggleUnit('metric')}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                unitSystem === 'metric'
                  ? 'bg-slate-800 text-cyan-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Celsius (°C, km/h)"
              aria-label="Switch to Celsius"
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => onToggleUnit('imperial')}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                unitSystem === 'imperial'
                  ? 'bg-slate-800 text-cyan-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fahrenheit (°F, mph)"
              aria-label="Switch to Fahrenheit"
            >
              °F
            </button>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors disabled:opacity-50"
            title="Refresh weather data"
            aria-label="Refresh current weather data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Location button */}
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-800 transition-colors disabled:opacity-50 whitespace-nowrap"
            title="Detect your current location"
            aria-label="Detect current location"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>
      </div>
    </header>
  );
};
