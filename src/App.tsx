/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecastBar } from './components/HourlyForecastBar';
import { RecommendationsSection } from './components/RecommendationsSection';
import { Forecast7Day } from './components/Forecast7Day';
import { WorldWeatherMap } from './components/WorldWeatherMap';
import { ErrorMessage } from './components/ErrorMessage';
import { GeoLocation, UnitSystem, WeatherData } from './types/weather';
import {
  fetchWeatherForLocation,
  searchCities,
  reverseGeocodeCoordinates,
  CityNotFoundError,
} from './services/openMeteo';
import { Loader2 } from 'lucide-react';

const RECENT_SEARCHES_KEY = 'weather_intel_recent_searches_v1';
const PREFERRED_UNIT_KEY = 'weather_intel_unit_v1';

const DEFAULT_CITY: GeoLocation = {
  name: 'Tokyo',
  country: 'Japan',
  country_code: 'JP',
  latitude: 35.6895,
  longitude: 139.6917,
  timezone: 'Asia/Tokyo',
};

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    try {
      const saved = localStorage.getItem(PREFERRED_UNIT_KEY);
      return (saved === 'imperial' || saved === 'metric') ? saved : 'metric';
    } catch {
      return 'metric';
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedQuery, setFailedQuery] = useState<string | undefined>(undefined);

  const [recentSearches, setRecentSearches] = useState<GeoLocation[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save recent search
  const saveRecentSearch = (city: GeoLocation) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (c) => !(c.latitude === city.latitude && c.longitude === city.longitude)
      );
      const updated = [city, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Fetch weather for a given GeoLocation
  const loadWeather = useCallback(
    async (loc: GeoLocation, units: UnitSystem = unitSystem, silentRefresh = false) => {
      try {
        if (!silentRefresh) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setErrorMessage(null);
        setFailedQuery(undefined);

        const data = await fetchWeatherForLocation(loc, units);
        setWeatherData(data);
        setCurrentLocation(loc);
        saveRecentSearch(loc);
      } catch (err: any) {
        setErrorMessage(
          err.message || 'Unable to retrieve meteorological data. Please check connection and try again.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [unitSystem]
  );

  // Search by city name input
  const handleSearchSubmit = async (cityName: string) => {
    const query = cityName.trim();
    if (!query) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setFailedQuery(query);

      const results = await searchCities(query);

      if (results.length === 0) {
        throw new CityNotFoundError(query);
      }

      // Pick top matching city
      const selected = results[0];
      await loadWeather(selected, unitSystem);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err instanceof CityNotFoundError
          ? err.message
          : `Could not find city "${query}". Please check spelling or try another location name.`
      );
    }
  };

  // User selects an autocomplete suggestion or quick preset
  const handleSelectCity = (city: GeoLocation) => {
    loadWeather(city, unitSystem);
  };

  // User clicks coordinates on the world map
  const handleSelectCoordinates = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const loc = await reverseGeocodeCoordinates(lat, lon);
      await loadWeather(loc, unitSystem);
    } catch (err: any) {
      setErrorMessage('Failed to fetch weather for selected coordinates.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unit switch
  const handleToggleUnit = (newUnit: UnitSystem) => {
    if (newUnit === unitSystem) return;
    setUnitSystem(newUnit);
    try {
      localStorage.setItem(PREFERRED_UNIT_KEY, newUnit);
    } catch {
      // Ignore
    }
    if (currentLocation) {
      loadWeather(currentLocation, newUnit);
    }
  };

  // Geolocation detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const loc = await reverseGeocodeCoordinates(latitude, longitude);
          await loadWeather(loc, unitSystem);
        } catch (err: any) {
          setErrorMessage('Could not determine city name from your device coordinates.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location access was denied. You can search for your city name in the search bar above.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please try again or search by city name.';
        }
        setErrorMessage(errorMsg);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Refresh
  const handleRefresh = () => {
    if (currentLocation) {
      loadWeather(currentLocation, unitSystem, true);
    }
  };

  // Initial load
  useEffect(() => {
    loadWeather(DEFAULT_CITY, unitSystem);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Contract (Wordmark + Navigation + Unit/Location Actions) */}
      <Header
        unitSystem={unitSystem}
        onToggleUnit={handleToggleUnit}
        onUseCurrentLocation={handleUseCurrentLocation}
        onRefresh={handleRefresh}
        isLocating={isLocating}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Search & Suggestions Bar */}
        <section className="space-y-2">
          <SearchBar
            onSelectCity={handleSelectCity}
            onSearchSubmit={handleSearchSubmit}
            isLoading={isLoading}
            recentSearches={recentSearches}
            onClearRecent={handleClearRecent}
          />
        </section>

        {/* Error notification banner when city lookup fails */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            failedQuery={failedQuery}
            onDismiss={() => setErrorMessage(null)}
            onRetry={currentLocation ? () => loadWeather(currentLocation, unitSystem) : undefined}
            onSelectSuggestion={(city) => handleSearchSubmit(city)}
          />
        )}

        {/* Loading state skeleton */}
        {isLoading && !weatherData && (
          <div className="w-full py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm font-mono tracking-wide">
              Retrieving atmospheric telemetry from Open-Meteo...
            </p>
          </div>
        )}

        {/* Primary Weather Intelligence Presentation */}
        {weatherData && (
          <div className={`space-y-6 sm:space-y-8 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {/* 1. Hero Atmospheric Current Weather Panel */}
            <CurrentWeatherCard weather={weatherData} />

            {/* 2. Interactive World Weather Map */}
            <WorldWeatherMap
              currentLocation={currentLocation}
              onSelectCoordinates={handleSelectCoordinates}
              onSelectPresetCity={handleSelectCity}
            />

            {/* 3. 24-Hour Timeline Bar */}
            <HourlyForecastBar hourly={weatherData.hourly} unitSystem={unitSystem} />

            {/* 4. Weather Intelligence Recommendations */}
            <RecommendationsSection recommendations={weatherData.recommendations} />

            {/* 5. 7-Day Weather Forecast */}
            <Forecast7Day daily={weatherData.daily} unitSystem={unitSystem} />
          </div>
        )}
      </main>

      {/* Footer conforming to anti-slop rules (quiet, truthful metadata) */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Weather Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Data powered by Open-Meteo API</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>Geocoding & Forecast Endpoints</span>
            <span aria-hidden="true">·</span>
            <span>WMO Meteorological Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
