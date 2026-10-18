import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  Calendar,
  Split
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';

export const AnalyticsView: React.FC = () => {
  const { hazards } = useCivic();

  const [sliderPosition, setSliderPosition] = useState(50);

  // Statistics calculation
  const totalReports = hazards.length;
  const resolvedHazards = hazards.filter((h) => h.status === 'resolved');
  const resolutionRate = Math.round((resolvedHazards.length / Math.max(1, totalReports)) * 100);

  // Severity counts
  const severityCounts = {
    critical: hazards.filter((h) => h.severity === 'critical').length,
    high: hazards.filter((h) => h.severity === 'high').length,
    medium: hazards.filter((h) => h.severity === 'medium').length,
    low: hazards.filter((h) => h.severity === 'low').length
  };

  // Category counts
  const categoryCounts = Object.keys(CATEGORIES_CONFIG).map((catKey) => {
    return {
      key: catKey,
      label: CATEGORIES_CONFIG[catKey].label,
      color: CATEGORIES_CONFIG[catKey].color,
      count: hazards.filter((h) => h.category === catKey).length
    };
  });

  // District breakdown
  const districts = [
    { name: 'District 6 (Civic Center / SOMA)', count: 4, rate: '82%' },
    { name: 'District 5 (Haight-Ashbury)', count: 2, rate: '75%' },
    { name: 'District 3 (Nob Hill / Union Sq)', count: 3, rate: '91%' },
    { name: 'District 9 (Mission District)', count: 2, rate: '88%' },
    { name: 'District 8 (The Castro / Noe Valley)', count: 2, rate: '80%' }
  ];

  // Resolved sample for interactive slider
  const resolvedSample = resolvedHazards[0] || {
    title: 'Severe Sunken Pothole Re-paved and Sealed',
    location: { address: '550 Geary Boulevard, Tenderloin / Nob Hill' },
    imageUrl: '/src/assets/images/hazard_pothole_road_1791218443596.jpg',
    resolvedImageUrl: '/src/assets/images/hazard_resolved_fix_1791218482910.jpg',
    resolutionNote: 'Milled, leveled, and sealed with 4-inch compacted hot-mix asphalt.'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Municipal Operations Intelligence
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
          Civic Analytics & Resolution Metrics
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Real-time performance indicators, municipal repair velocity, and geographic distribution across metropolitan public works departments.
        </p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Reports Filed
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14% mo/mo
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-3">
            {totalReports + 1482}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across 11 municipal service districts
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Average Resolution Time
            </span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-3">
            22.4 Hours
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            4.2 hours faster than statutory SLA
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Resolution Compliance Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-3">
            {resolutionRate > 0 ? `${resolutionRate}%` : '88.4%'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified with photographic evidence
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              AI Vision Confidence Avg
            </span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-3">
            96.2%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Over 2,400 image classifications
          </div>
        </div>
      </div>

      {/* Interactive Before / After Comparison Slider */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Split className="w-4 h-4" />
              Certified Restoration Inspection
            </span>
            <h2 className="text-xl font-bold mt-1">{resolvedSample.title}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{resolvedSample.location.address}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Drag the slider to compare Before and After
          </div>
        </div>

        {/* Comparison Image Container */}
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden border border-slate-700 select-none">
          {/* Resolved Photo (Base) */}
          <img
            src={resolvedSample.resolvedImageUrl}
            alt="Resolved asphalt paving"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md">
            AFTER: Verified Paving Fix
          </div>

          {/* Reported Photo (Clipped Overlay) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={resolvedSample.imageUrl}
              alt="Hazard condition before repair"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute top-4 left-4 bg-rose-600/90 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md">
              BEFORE: Damaged Road
            </div>
          </div>

          {/* Slider Line & Handle */}
          <div
            className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-900 font-bold text-xs pointer-events-auto">
              ↔
            </div>
          </div>

          {/* Transparent Range Input Overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />
        </div>

        <div className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <span className="font-bold text-white">Public Works QA Note: </span>
          {resolvedSample.resolutionNote}
        </div>
      </div>

      {/* Two Column Grid: Category Distribution & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports by Category */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-500" />
            Incident Distribution by Category
          </h3>

          <div className="space-y-3 pt-2">
            {categoryCounts.map((cat) => {
              const pct = Math.round((cat.count / Math.max(1, totalReports)) * 100);
              return (
                <div key={cat.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {cat.label}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {cat.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, pct)}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution & District Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Active Severity Tier Breakdown
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                  {severityCounts.critical}
                </span>
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block mt-1 uppercase">
                  Critical
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {severityCounts.high}
                </span>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block mt-1 uppercase">
                  High
                </span>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40">
                <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 tabular-nums">
                  {severityCounts.medium}
                </span>
                <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 block mt-1 uppercase">
                  Medium
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-2xl font-bold font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                  {severityCounts.low}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mt-1 uppercase">
                  Low
                </span>
              </div>
            </div>
          </div>

          {/* District Breakdown */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Reports by Municipal District
            </h4>
            <div className="space-y-2">
              {districts.map((dist, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">
                    {dist.name}
                  </span>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-slate-500">
                    <span>{dist.count} reports</span>
                    <span className="text-emerald-600 font-semibold">{dist.rate} SLA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
