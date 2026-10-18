import React, { useState, useEffect, useRef } from 'react';
import { useCivic } from '../context/CivicContext';
import { Search, X, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { hazards, setSelectedHazard } = useCivic();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled in parent or trigger
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredHazards = hazards.filter((h) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      h.id.toLowerCase().includes(q) ||
      h.title.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.location.address.toLowerCase().includes(q) ||
      h.location.district.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q) ||
      h.status.toLowerCase().includes(q)
    );
  });

  const handleSelect = (hazard: typeof hazards[0]) => {
    setSelectedHazard(hazard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hazards by street, ticket # (e.g. HAZ-2026), category, or keyword..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium">Type a location, ticket ID, or hazard type</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <span className="text-slate-400">Try searching:</span>
                {['Market Street', 'Pothole', 'Haight', 'HAZ-2026-8941', 'Critical'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredHazards.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium">No municipal hazards found matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try another street name or category</p>
            </div>
          ) : (
            filteredHazards.map((hazard) => {
              const catConfig = CATEGORIES_CONFIG[hazard.category] || CATEGORIES_CONFIG.roads;
              return (
                <div
                  key={hazard.id}
                  onClick={() => handleSelect(hazard)}
                  className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={hazard.imageUrl}
                      alt={hazard.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                          {hazard.id}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {catConfig.label}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs capitalize font-medium text-slate-500">
                          {hazard.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {hazard.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{hazard.location.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-center shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        hazard.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : hazard.severity === 'high'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {hazard.severity}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
