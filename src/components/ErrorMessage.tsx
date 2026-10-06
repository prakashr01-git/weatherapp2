import React from 'react';
import { AlertCircle, RotateCcw, X, Search } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  failedQuery?: string;
  onRetry?: () => void;
  onDismiss: () => void;
  onSelectSuggestion?: (cityName: string) => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  failedQuery,
  onRetry,
  onDismiss,
  onSelectSuggestion,
}) => {
  const suggestions = ['Chennai', 'Delhi', 'Tokyo', 'London', 'New York', 'Paris', 'Sydney'];

  return (
    <div
      role="alert"
      className="w-full max-w-4xl mx-auto bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-900/40 border border-rose-700/50 text-rose-300 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-rose-200">
                Location Lookup Failed
              </h3>
              {failedQuery && (
                <span className="text-xs font-mono text-rose-300/80 bg-rose-900/50 px-2 py-0.5 rounded border border-rose-800/40">
                  &ldquo;{failedQuery}&rdquo;
                </span>
              )}
            </div>

            <p className="text-sm text-rose-300/90 leading-relaxed">
              {message}
            </p>

            <div className="pt-2 text-xs text-rose-300/70 space-y-1">
              <p>Tips for accurate weather lookup:</p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>Verify the spelling of the city or district</li>
                <li>Add the country or state name (e.g., &ldquo;Paris, Texas&rdquo; or &ldquo;Springfield, IL&rdquo;)</li>
                <li>Use standard international English transliteration</li>
              </ul>
            </div>

            {onSelectSuggestion && (
              <div className="pt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-rose-300/80 font-mono">Popular alternatives:</span>
                {suggestions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => onSelectSuggestion(city)}
                    className="text-xs px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-100 rounded-md border border-rose-700/50 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-900/50 rounded-lg transition-colors"
              title="Retry request"
              aria-label="Retry request"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-900/50 rounded-lg transition-colors"
            title="Dismiss error"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
