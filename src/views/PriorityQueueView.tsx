import React from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Flame,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CheckCircle,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';

export const PriorityQueueView: React.FC = () => {
  const { hazards, setSelectedHazard, isAuthorityMode, updateHazardStatus } = useCivic();

  // Active hazards ranked by priorityScore
  const activeHazards = hazards
    .filter((h) => h.status !== 'resolved')
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const criticalHazards = activeHazards.filter((h) => h.severity === 'critical');

  const handleQuickDispatch = (hazardId: string) => {
    updateHazardStatus(
      hazardId,
      'assigned',
      'Directly dispatched from AI Priority Queue.',
      'DPW Rapid Response Unit #1'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Algorithmic Civic Dispatch Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          AI Civic Priority Queue
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Incidents dynamically ranked using multi-factor threat calculation: structural severity, pedestrian foot-traffic volume, proximity to schools and hospitals, and community verifications.
        </p>
      </div>

      {/* Priority Scoring Formula Breakdown Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Civic Priority Algorithm (Weights)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Score Range: 0 (Minor) — 100 (Emergency)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-amber-400 font-bold block">40% Weight</span>
            <span className="font-semibold block mt-0.5">Vision Severity</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Critical (40pts), High (30pts), Medium (20pts)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-amber-400 font-bold block">20% Weight</span>
            <span className="font-semibold block mt-0.5">Vulnerable Zones</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              School zones, senior centers & transit hubs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-amber-400 font-bold block">20% Weight</span>
            <span className="font-semibold block mt-0.5">Traffic Impact</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Active vehicular lanes & arterial swerving risk
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-amber-400 font-bold block">10% Weight</span>
            <span className="font-semibold block mt-0.5">Crowd Verification</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Citizen upvotes & photographic corroboration
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] text-amber-400 font-bold block">10% Weight</span>
            <span className="font-semibold block mt-0.5">Time Escalation</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Unresolved time accumulation factor
            </span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Ribbon */}
      {criticalHazards.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-3">
            <Flame className="w-4 h-4" />
            Critical Tier Incidents Requiring Immediate Action ({criticalHazards.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalHazards.map((hazard) => (
              <div
                key={hazard.id}
                onClick={() => setSelectedHazard(hazard)}
                className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-800 cursor-pointer transition-all flex items-start gap-4"
              >
                <img
                  src={hazard.imageUrl}
                  alt={hazard.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-rose-200 dark:border-rose-900"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                      {hazard.id}
                    </span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                      Priority: {hazard.priorityScore}/100
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                    {hazard.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{hazard.location.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Priority Queue Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Ranked Municipal Dispatch Queue ({activeHazards.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live automated queue sorted by AI Civic Priority Score
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                <th className="py-3 px-4 font-semibold">Rank</th>
                <th className="py-3 px-4 font-semibold">Priority Score</th>
                <th className="py-3 px-4 font-semibold">Incident & Location</th>
                <th className="py-3 px-4 font-semibold">Target Department</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {activeHazards.map((hazard, idx) => {
                const catConfig = CATEGORIES_CONFIG[hazard.category] || CATEGORIES_CONFIG.roads;
                return (
                  <tr
                    key={hazard.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            hazard.priorityScore >= 90
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : hazard.priorityScore >= 75
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                          }`}
                        >
                          {hazard.priorityScore}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {hazard.upvotes} votes
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div
                        onClick={() => setSelectedHazard(hazard)}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600 cursor-pointer truncate"
                      >
                        {hazard.title}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{hazard.location.address}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {hazard.aiAnalysis.department}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                        {hazard.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isAuthorityMode && hazard.status !== 'assigned' && hazard.status !== 'in_progress' ? (
                        <button
                          onClick={() => handleQuickDispatch(hazard.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedHazard(hazard)}
                          className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-300 inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
