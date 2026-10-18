import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Search,
  Filter,
  Flame,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Grid,
  List,
  MapPin,
  ThumbsUp,
  ArrowRight,
  RefreshCw,
  Volume2
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';
import { HazardCategory, HazardReport } from '../types';
import { useAccessibility } from '../context/AccessibilityContext';

export const ExploreView: React.FC = () => {
  const {
    hazards,
    setSelectedHazard,
    categoryFilter,
    setCategoryFilter,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter
  } = useCivic();

  const { speak, announcePolite } = useAccessibility();

  const [activeTab, setActiveTab] = useState<
    'trending' | 'nearby' | 'recent' | 'critical' | 'resolved'
  >('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Filter & sort logic
  let filtered = hazards.filter((h) => {
    if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && h.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        h.title.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.location.address.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeTab === 'critical') return h.severity === 'critical';
    if (activeTab === 'resolved') return h.status === 'resolved';

    return true;
  });

  // Tab sorting
  if (activeTab === 'trending') {
    filtered.sort((a, b) => b.upvotes - a.upvotes);
  } else if (activeTab === 'recent') {
    filtered.sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
  } else if (activeTab === 'nearby') {
    // Sort relative to downtown SF (37.7749, -122.4194)
    filtered.sort((a, b) => {
      const distA = Math.hypot(a.location.lat - 37.7749, a.location.lng - -122.4194);
      const distB = Math.hypot(b.location.lat - 37.7749, b.location.lng - -122.4194);
      return distA - distB;
    });
  } else if (activeTab === 'critical') {
    filtered.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  const resetFilters = () => {
    setCategoryFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Civic Catalog
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Explore Urban Hazards
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Browse verified municipal reports, upvote active safety threats, or review resolved restorations.
          </p>
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewLayout === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewLayout === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-2 pb-px mb-6 scrollbar-none">
        {[
          { id: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4" /> },
          { id: 'nearby', label: 'Nearby (Within 5km)', icon: <Navigation className="w-4 h-4" /> },
          { id: 'recent', label: 'Recently Reported', icon: <Clock className="w-4 h-4" /> },
          { id: 'critical', label: 'Critical Hazards', icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
          { id: 'resolved', label: 'Recently Resolved', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-8">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, streets, or ticket numbers..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="sm:col-span-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORIES_CONFIG).map(([k, c]) => (
              <option key={k} value={k}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {(categoryFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results View */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8">
          <AlertTriangle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No hazards match the current criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your filters or clearing search terms to explore all active municipal reports.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hazard) => {
            const catConfig = CATEGORIES_CONFIG[hazard.category] || CATEGORIES_CONFIG.roads;
            return (
              <div
                key={hazard.id}
                onClick={() => setSelectedHazard(hazard)}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col"
              >
                <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={hazard.status === 'resolved' && hazard.resolvedImageUrl ? hazard.resolvedImageUrl : hazard.imageUrl}
                    alt={`Photograph of reported ${hazard.title} at ${hazard.location.address}. Severity: ${hazard.severity}, status: ${hazard.status}.`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md uppercase tracking-wider ${
                        hazard.severity === 'critical'
                          ? 'bg-rose-600/90 text-white'
                          : hazard.severity === 'high'
                          ? 'bg-amber-600/90 text-white'
                          : 'bg-slate-900/80 text-white'
                      }`}
                    >
                      {hazard.severity}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md">
                      Score {hazard.priorityScore}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1 font-mono">
                      <span>{hazard.id}</span>
                      <span>·</span>
                      <span>{catConfig.label}</span>
                      <span>·</span>
                      <span className="capitalize">{hazard.status.replace('_', ' ')}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-sky-600 transition-colors">
                      {hazard.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {hazard.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{hazard.location.address}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {hazard.upvotes}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(`${hazard.title}. Located at ${hazard.location.address}. Severity is ${hazard.severity}. Status is ${hazard.status.replace('_', ' ')}. ${hazard.description}`);
                          announcePolite(`Reading ${hazard.title}`);
                        }}
                        className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                        aria-label={`Listen to summary for ${hazard.title}`}
                        title="Listen to summary"
                      >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filtered.map((hazard) => {
            const catConfig = CATEGORIES_CONFIG[hazard.category] || CATEGORIES_CONFIG.roads;
            return (
              <div
                key={hazard.id}
                onClick={() => setSelectedHazard(hazard)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <img
                    src={hazard.imageUrl}
                    alt={hazard.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{hazard.id}</span>
                      <span>·</span>
                      <span className="text-slate-600 dark:text-slate-300 font-sans">{catConfig.label}</span>
                      <span>·</span>
                      <span className="capitalize">{hazard.status.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {hazard.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{hazard.location.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                      hazard.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : hazard.severity === 'high'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {hazard.severity}
                  </span>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      Score: {hazard.priorityScore}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {hazard.upvotes} confirmations
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
