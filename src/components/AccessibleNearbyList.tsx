import React, { useState, useMemo } from 'react';
import { useCivic } from '../context/CivicContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { HazardReport, HazardSeverity } from '../types';
import { calculateDistanceMeters, formatDistance } from '../utils/audioAlerts';
import {
  Volume2,
  VolumeX,
  MapPin,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AccessibleNearbyListProps {
  onSelectHazard?: (hazard: HazardReport) => void;
}

export const AccessibleNearbyList: React.FC<AccessibleNearbyListProps> = ({ onSelectHazard }) => {
  const { hazards, setSelectedHazard } = useCivic();
  const {
    userLocation,
    requestUserLocation,
    locationPermissionDenied,
    speak,
    stopSpeech,
    isSpeaking,
    announcePolite,
  } = useAccessibility();

  const [sortBy, setSortBy] = useState<'distance' | 'severity' | 'recent'>('distance');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [readingHazardId, setReadingHazardId] = useState<string | null>(null);

  // Compute distances and sort
  const processedHazards = useMemo(() => {
    return hazards
      .filter((h) => {
        if (filterVerifiedOnly && h.status === 'reported') {
          return false;
        }
        return true;
      })
      .map((hazard) => {
        let distanceMeters: number | null = null;
        if (userLocation) {
          distanceMeters = calculateDistanceMeters(
            userLocation.lat,
            userLocation.lng,
            hazard.location.lat,
            hazard.location.lng
          );
        }
        return {
          ...hazard,
          distanceMeters,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          if (a.distanceMeters !== null && b.distanceMeters !== null) {
            return a.distanceMeters - b.distanceMeters;
          }
          if (a.distanceMeters !== null) return -1;
          if (b.distanceMeters !== null) return 1;
        }
        if (sortBy === 'severity') {
          const rank: Record<HazardSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          return rank[b.severity] - rank[a.severity];
        }
        // Recent
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      });
  }, [hazards, userLocation, sortBy, filterVerifiedOnly]);

  const handleReadAloud = (hazard: HazardReport, distanceMeters: number | null) => {
    if (readingHazardId === hazard.id && isSpeaking) {
      stopSpeech();
      setReadingHazardId(null);
      announcePolite('Stopped reading.');
      return;
    }

    setReadingHazardId(hazard.id);
    const distText = distanceMeters !== null ? `approximately ${formatDistance(distanceMeters)} away` : 'location on record';
    const verifiedText = hazard.status !== 'reported' ? 'This hazard has been verified by the community.' : 'This report is currently pending initial verification.';

    const narrative = `${hazard.title}. Located at ${hazard.location.address}, ${distText}. Category is ${hazard.category}, with ${hazard.severity} severity level. Status is ${hazard.status.replace('_', ' ')}. ${hazard.description}. ${verifiedText} Community confirmation count: ${hazard.upvotes}.`;

    announcePolite(`Reading summary for ${hazard.title}`);
    speak(narrative, {
      onEnd: () => {
        setReadingHazardId(null);
      },
    });
  };

  const handleSelect = (hazard: HazardReport) => {
    if (onSelectHazard) {
      onSelectHazard(hazard);
    } else {
      setSelectedHazard(hazard);
    }
    announcePolite(`Opened detailed view for ${hazard.title}`);
  };

  return (
    <section
      className="space-y-6"
      aria-labelledby="accessible-hazards-heading"
    >
      {/* Header controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="accessible-hazards-heading"
              className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Accessible Hazard Directory & Proximity List
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Screen-reader optimized, high-contrast listing with speech summaries and distance calculations.
            </p>
          </div>

          {/* Location Request / Status */}
          <div>
            {!userLocation ? (
              <button
                onClick={async () => {
                  announcePolite('Requesting location permission to calculate distances.');
                  await requestUserLocation();
                }}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors"
                aria-label="Enable location to calculate approximate hazard distances"
              >
                <Navigation className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span>Calculate Distances from My GPS</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>GPS Connected · Straight-line Distances Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="sort-hazards" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sort By:</span>
            </label>
            <select
              id="sort-hazards"
              value={sortBy}
              onChange={(e) => {
                const val = e.target.value as 'distance' | 'severity' | 'recent';
                setSortBy(val);
                announcePolite(`Hazards sorted by ${val}`);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <option value="distance" disabled={!userLocation}>
                Proximity (Nearest First) {!userLocation ? '(Requires GPS)' : ''}
              </option>
              <option value="severity">Severity (Critical First)</option>
              <option value="recent">Most Recently Reported</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-verified" className="cursor-pointer flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <input
                id="filter-verified"
                type="checkbox"
                checked={filterVerifiedOnly}
                onChange={(e) => {
                  setFilterVerifiedOnly(e.target.checked);
                  announcePolite(`Filter verified hazards ${e.target.checked ? 'applied' : 'cleared'}`);
                }}
                className="w-4 h-4 accent-sky-600 rounded focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
              />
              <span>Show Verified Reports Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Hazards List */}
      <div
        role="region"
        aria-label="Reported hazards list"
        className="space-y-4"
      >
        <p className="sr-only">Showing {processedHazards.length} hazards</p>

        {processedHazards.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" aria-hidden="true" />
            <p className="font-semibold text-slate-900 dark:text-white">No matching hazards found.</p>
            <p className="text-xs text-slate-500 mt-1">Try disabling the verified filter to see all active reports.</p>
          </div>
        ) : (
          processedHazards.map((hazard, index) => {
            const isVerified = hazard.status !== 'reported';
            const isCurrentlyReading = readingHazardId === hazard.id && isSpeaking;

            return (
              <article
                key={hazard.id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 rounded-2xl p-5 shadow-sm transition-colors space-y-3"
                aria-labelledby={`hazard-title-${hazard.id}`}
              >
                {/* Row 1: Identification & Badges */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>#{index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{hazard.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{hazard.category}</span>
                    </div>
                    <h3
                      id={`hazard-title-${hazard.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white leading-snug"
                    >
                      {hazard.title}
                    </h3>
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Severity */}
                    <span
                      className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                        hazard.severity === 'critical'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : hazard.severity === 'high'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                      }`}
                      aria-label={`Severity: ${hazard.severity}`}
                    >
                      {hazard.severity} Severity
                    </span>

                    {/* Verification Status */}
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                      aria-label={`Verification status: ${isVerified ? 'Community Verified' : 'Unverified Report'}`}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                          <span>Verified ({hazard.status.replace('_', ' ')})</span>
                        </>
                      ) : (
                        <span>Unverified Report</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Location & Distance */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" aria-hidden="true" />
                    <span>{hazard.location.address}</span>
                  </div>

                  {hazard.distanceMeters !== null && (
                    <div className="flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400">
                      <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Approx. {formatDistance(hazard.distanceMeters)} away</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reported {new Date(hazard.reportedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {hazard.description}
                </p>

                {/* AI Detection Findings (Feature 7) */}
                {hazard.aiAnalysis && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      AI Vision Prediction:
                    </span>
                    <span>{hazard.aiAnalysis.categoryDetected}</span>
                    <span aria-hidden="true">·</span>
                    <span>{(hazard.aiAnalysis.confidence * 100).toFixed(0)}% confidence</span>
                    <span aria-hidden="true">·</span>
                    <span className="italic text-slate-400">(Automated assessment, pending field crew sign-off)</span>
                  </div>
                )}

                {/* Accessible Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {/* Read Aloud Button (Feature 3) */}
                    <button
                      onClick={() => handleReadAloud(hazard, hazard.distanceMeters)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        isCurrentlyReading
                          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                      aria-label={
                        isCurrentlyReading
                          ? `Stop reading description for ${hazard.title}`
                          : `Listen to audio description for ${hazard.title}`
                      }
                    >
                      {isCurrentlyReading ? (
                        <>
                          <VolumeX className="w-4 h-4 text-rose-600" aria-hidden="true" />
                          <span>Stop Reading</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-sky-600" aria-hidden="true" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>

                    <span className="text-xs text-slate-400">
                      {hazard.upvotes} community confirmations
                    </span>
                  </div>

                  {/* Open details modal */}
                  <button
                    onClick={() => handleSelect(hazard)}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors"
                    aria-label={`View full details and audit timeline for ${hazard.title}`}
                  >
                    <span>Inspect Ticket</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
