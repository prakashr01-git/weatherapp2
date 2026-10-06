import React, { useState } from 'react';
import {
  Shirt,
  Umbrella,
  Activity,
  SunMedium,
  Car,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertOctagon,
} from 'lucide-react';
import { WeatherRecommendation, RecommendationCategory, RecommendationSeverity } from '../types/weather';

interface RecommendationsSectionProps {
  recommendations: WeatherRecommendation[];
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ recommendations }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | RecommendationCategory>('all');

  const filteredRecommendations =
    selectedFilter === 'all'
      ? recommendations
      : recommendations.filter((r) => r.category === selectedFilter);

  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'attire':
        return <Shirt className="w-4 h-4 text-cyan-400" />;
      case 'umbrella':
        return <Umbrella className="w-4 h-4 text-blue-400" />;
      case 'outdoor':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'uv':
        return <SunMedium className="w-4 h-4 text-amber-400" />;
      case 'commute':
        return <Car className="w-4 h-4 text-purple-400" />;
      case 'ventilation':
        return <Wind className="w-4 h-4 text-teal-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: RecommendationSeverity) => {
    switch (severity) {
      case 'optimal':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal</span>
          </div>
        );
      case 'moderate':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-sky-400">
            <Info className="w-3.5 h-3.5" />
            <span>Normal</span>
          </div>
        );
      case 'caution':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Caution</span>
          </div>
        );
      case 'alert':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Advisory</span>
          </div>
        );
    }
  };

  const filterTabs: Array<{ id: 'all' | RecommendationCategory; label: string }> = [
    { id: 'all', label: 'All Insights' },
    { id: 'attire', label: 'Attire' },
    { id: 'umbrella', label: 'Precipitation' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'uv', label: 'UV & Sun' },
    { id: 'commute', label: 'Commute' },
    { id: 'ventilation', label: 'Ventilation' },
  ];

  return (
    <section id="recommendations" className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Weather Intelligence Recommendations
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Practical attire, health, and activity suggestions derived from atmospheric telemetry
          </p>
        </div>

        {/* Interactive Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-slate-800 text-cyan-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecommendations.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all duration-200"
            >
              <div>
                {/* Header row: Category & Severity */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                    {getCategoryIcon(item.category)}
                    <span>{item.categoryLabel}</span>
                  </div>
                  {getSeverityBadge(item.severity)}
                </div>

                {/* Title & Action */}
                <div className="mt-3.5 space-y-2">
                  <h3 className="text-base font-semibold text-slate-100 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {item.action}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Rationale metric footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 uppercase font-mono text-[11px] tracking-wider">
                  {item.metricLabel}
                </span>
                <span className="font-mono font-medium text-slate-200 tabular-nums">
                  {item.metricValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
