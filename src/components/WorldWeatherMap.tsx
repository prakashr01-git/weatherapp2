import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Globe, MapPin, Navigation, Maximize2 } from 'lucide-react';
import { GeoLocation } from '../types/weather';

interface WorldWeatherMapProps {
  currentLocation: GeoLocation;
  onSelectCoordinates: (lat: number, lon: number) => void;
  onSelectPresetCity: (city: GeoLocation) => void;
}

const GLOBAL_PRESET_CITIES: GeoLocation[] = [
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6895, longitude: 139.6917 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5085, longitude: -0.1257 },
  { name: 'New York', country: 'United States', latitude: 40.7143, longitude: -74.006 },
  { name: 'Paris', country: 'France', latitude: 48.8534, longitude: 2.3488 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8678, longitude: 151.2073 },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.2897, longitude: 103.8501 },
  { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { name: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426 },
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219 },
];

export const WorldWeatherMap: React.FC<WorldWeatherMapProps> = ({
  currentLocation,
  onSelectCoordinates,
  onSelectPresetCity,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map configured for world view
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
      attributionControl: false,
    });

    // Add CartoDB Dark Matter tiles (free, dark-themed, ultra clean)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Custom attribution control in bottom left
    L.control
      .attribution({
        position: 'bottomleft',
        prefix: '<span class="text-[10px] text-slate-500 font-mono">© OpenStreetMap · CartoDB</span>',
      })
      .addTo(map);

    // Custom icon for preset cities
    const presetIcon = L.divIcon({
      className: 'custom-preset-marker',
      html: `
        <div style="
          width: 10px;
          height: 10px;
          background: #38bdf8;
          border: 2px solid #0f172a;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
          cursor: pointer;
        "></div>
      `,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });

    // Render preset city markers
    GLOBAL_PRESET_CITIES.forEach((city) => {
      const marker = L.marker([city.latitude, city.longitude], { icon: presetIcon });
      marker.bindTooltip(
        `<div class="text-xs font-medium text-slate-200">${city.name}, <span class="text-slate-400">${city.country}</span></div>`,
        { direction: 'top', offset: [0, -6], opacity: 0.95 }
      );
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectPresetCity(city);
      });
      marker.addTo(map);
    });

    // Handle map click to query any coordinate on Earth
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      // Normalize longitude within -180 to 180
      const normalizedLng = ((((lng + 180) % 360) + 360) % 360) - 180;
      onSelectCoordinates(lat, normalizedLng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update current selected location pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentMarkerRef.current) {
      map.removeLayer(currentMarkerRef.current);
      currentMarkerRef.current = null;
    }

    const { latitude, longitude, name, country } = currentLocation;

    const activeIcon = L.divIcon({
      className: 'custom-active-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 24px;
            height: 24px;
            background: rgba(6, 182, 212, 0.35);
            border-radius: 50%;
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            width: 14px;
            height: 14px;
            background: #06b6d4;
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 12px #06b6d4;
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker([latitude, longitude], { icon: activeIcon, zIndexOffset: 1000 });
    marker.bindPopup(
      `
        <div style="font-family: inherit; padding: 2px 4px;">
          <div style="font-weight: 600; font-size: 13px; color: #f8fafc;">${name}</div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin-top: 2px;">
            ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°
          </div>
          ${country ? `<div style="font-size: 11px; color: #38bdf8; margin-top: 2px;">${country}</div>` : ''}
        </div>
      `,
      { offset: [0, -10] }
    );

    marker.addTo(map);
    currentMarkerRef.current = marker;
  }, [currentLocation]);

  const handleResetWorldView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([20, 0], 2, { duration: 1.2 });
    }
  };

  const handleFocusSelectedCity = () => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.flyTo([currentLocation.latitude, currentLocation.longitude], 6, {
        duration: 1.2,
      });
      currentMarkerRef.current?.openPopup();
    }
  };

  return (
    <section id="world-map-view" className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Interactive World Weather Map</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Explore global meteorological patterns. Click anywhere on the world map or select a global hub to inspect live conditions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFocusSelectedCity}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
            title="Focus map on selected location"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Focus Active City</span>
          </button>

          <button
            type="button"
            onClick={handleResetWorldView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
            title="Reset to global world view"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>World View</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Helper Legend */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl px-3.5 py-2.5 shadow-lg max-w-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click Any Spot on the Globe</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Clicking coordinates loads hyper-local forecasts and recommendations instantly from Open-Meteo.
          </p>
        </div>
      </div>
    </section>
  );
};
