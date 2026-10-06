import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, History } from 'lucide-react';
import { GeoLocation } from '../types/weather';
import { searchCities } from '../services/openMeteo';

interface SearchBarProps {
  onSelectCity: (location: GeoLocation) => void;
  onSearchSubmit: (cityName: string) => void;
  isLoading: boolean;
  recentSearches: GeoLocation[];
  onClearRecent: () => void;
}

const POPULAR_CITIES: GeoLocation[] = [
  { name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', country_code: 'IN', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Delhi', country: 'India', admin1: 'Delhi', country_code: 'IN', latitude: 28.6139, longitude: 77.209 },
  { name: 'Tokyo', country: 'Japan', country_code: 'JP', latitude: 35.6895, longitude: 139.6917 },
  { name: 'London', country: 'United Kingdom', country_code: 'GB', latitude: 51.5085, longitude: -0.1257 },
  { name: 'New York', country: 'United States', admin1: 'New York', country_code: 'US', latitude: 40.7143, longitude: -74.006 },
  { name: 'Paris', country: 'France', country_code: 'FR', latitude: 48.8534, longitude: 2.3488 },
  { name: 'Singapore', country: 'Singapore', country_code: 'SG', latitude: 1.2897, longitude: 103.8501 },
  { name: 'Sydney', country: 'Australia', country_code: 'AU', latitude: -33.8678, longitude: 151.2073 },
  { name: 'San Francisco', country: 'United States', admin1: 'California', country_code: 'US', latitude: 37.7749, longitude: -122.4194 },
  { name: 'Dubai', country: 'United Arab Emirates', country_code: 'AE', latitude: 25.2048, longitude: 55.2708 },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectCity,
  onSearchSubmit,
  isLoading,
  recentSearches,
  onClearRecent,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced autocomplete search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const results = await searchCities(query);
        setSuggestions(results);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      } else if (query.trim()) {
        setIsOpen(false);
        onSearchSubmit(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (city: GeoLocation) => {
    setQuery(`${city.name}${city.country ? `, ${city.country}` : ''}`);
    setIsOpen(false);
    setSuggestions([]);
    onSelectCity(city);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3" ref={containerRef}>
      {/* Search Input Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            {isSearchingSuggestions || isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0 || recentSearches.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search weather by city name (e.g., Tokyo, Zurich, Vancouver, Melbourne)..."
            className="w-full pl-12 pr-12 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm md:text-base focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-lg"
            aria-label="Search city weather"
            autoComplete="off"
            spellCheck="false"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Autocomplete / Recent Suggestions Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
            {suggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-slate-400">
                  Matching Locations
                </div>
                {suggestions.map((city, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={`${city.latitude}-${city.longitude}-${index}`}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                        isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-800/70 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-medium text-slate-100">{city.name}</span>
                        {(city.admin1 || city.country) && (
                          <span className="text-xs text-slate-400 truncate">
                            {[city.admin1, city.country].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
                        {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : query.trim().length >= 2 && !isSearchingSuggestions ? (
              <div className="px-4 py-4 text-center text-sm text-slate-400">
                No matching cities found for &quot;{query}&quot;. Press Enter to submit search.
              </div>
            ) : null}

            {/* Recent Searches (when dropdown open and no active typed query) */}
            {query.trim().length === 0 && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearRecent();
                    }}
                    className="hover:text-slate-200 transition-colors"
                  >
                    Clear History
                  </button>
                </div>
                {recentSearches.map((city, idx) => (
                  <button
                    key={`recent-${city.latitude}-${city.longitude}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="w-full text-left px-4 py-2 flex items-center justify-between text-sm text-slate-300 hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="truncate">
                      {city.name}
                      {city.country ? `, ${city.country}` : ''}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Recent</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Access City Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 text-xs text-slate-400 no-scrollbar">
        <span className="shrink-0 text-slate-400 font-mono">Quick Cities:</span>
        <div className="flex items-center gap-1.5">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity(city)}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
