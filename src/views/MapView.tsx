// Source: Google Maps Platform Code Assist
import React, { useState, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  Circle,
  ColorScheme
} from '@vis.gl/react-google-maps';
import { useCivic } from '../context/CivicContext';
import {
  Layers,
  Flame,
  Search,
  MapPin,
  X,
  RefreshCw,
  ArrowRight,
  ThumbsUp
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';
import { HazardReport } from '../types';
import { AccessibleNearbyList } from '../components/AccessibleNearbyList';
import { List, Map as MapIcon } from 'lucide-react';

export const MapView: React.FC = () => {
  const {
    hazards,
    setSelectedHazard,
    isDarkMode,
    categoryFilter,
    setCategoryFilter,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter
  } = useCivic();

  const map = useMap();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mapSearch, setMapSearch] = useState('');
  const [isHeatmap, setIsHeatmap] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePopupHazard, setActivePopupHazard] = useState<HazardReport | null>(null);

  // Filtered hazards
  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && h.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && h.status !== statusFilter) return false;
      if (mapSearch.trim()) {
        const q = mapSearch.toLowerCase();
        return (
          h.title.toLowerCase().includes(q) ||
          h.location.address.toLowerCase().includes(q) ||
          h.location.district.toLowerCase().includes(q) ||
          h.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [hazards, categoryFilter, severityFilter, statusFilter, mapSearch]);

  const handleFlyTo = (hazard: HazardReport) => {
    if (map) {
      map.panTo({ lat: hazard.location.lat, lng: hazard.location.lng });
      map.setZoom(16);
      setActivePopupHazard(hazard);
    }
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
    setMapSearch('');
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top View Mode Switcher Header */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="Switch to Interactive Map view"
              aria-pressed={viewMode === 'map'}
            >
              <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interactive Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="Switch to Accessible List view for screen-reader and keyboard users"
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Accessible List View</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono">{filteredHazards.length}</span> hazards recorded
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
          <AccessibleNearbyList onSelectHazard={setSelectedHazard} />
        </div>
      ) : (
        <div className="flex-1 relative h-full flex overflow-hidden">
          {/* Map Canvas */}
          <div className="flex-1 relative h-full">
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
              defaultZoom={13}
              gestureHandling="greedy"
              disableDefaultUI={false}
              colorScheme={isDarkMode ? ColorScheme.DARK : ColorScheme.LIGHT}
              style={{ width: '100%', height: '100%' }}
            >
          {/* Heatmap overlay circles if heatmap mode active */}
          {isHeatmap &&
            filteredHazards.map((hazard) => {
              const radius =
                hazard.severity === 'critical' ? 550 : hazard.severity === 'high' ? 420 : 280;
              const color =
                hazard.severity === 'critical'
                  ? '#ef4444'
                  : hazard.severity === 'high'
                  ? '#f59e0b'
                  : '#0284c7';

              return (
                <React.Fragment key={`heat-${hazard.id}`}>
                  <Circle
                    center={{ lat: hazard.location.lat, lng: hazard.location.lng }}
                    radius={radius}
                    strokeColor={color}
                    strokeOpacity={0.4}
                    strokeWeight={1}
                    fillColor={color}
                    fillOpacity={0.3}
                  />
                  <Circle
                    center={{ lat: hazard.location.lat, lng: hazard.location.lng }}
                    radius={radius * 0.4}
                    strokeColor="#ffffff"
                    strokeOpacity={0.8}
                    strokeWeight={1}
                    fillColor={color}
                    fillOpacity={0.65}
                  />
                </React.Fragment>
              );
            })}

          {/* Advanced Markers */}
          {filteredHazards.map((hazard) => {
            const severityColor =
              hazard.severity === 'critical'
                ? '#EF4444'
                : hazard.severity === 'high'
                ? '#F59E0B'
                : hazard.severity === 'medium'
                ? '#0284C7'
                : '#64748B';

            return (
              <AdvancedMarker
                key={hazard.id}
                position={{ lat: hazard.location.lat, lng: hazard.location.lng }}
                title={hazard.title}
                onClick={() => setActivePopupHazard(hazard)}
              >
                <div className="relative cursor-pointer transition-transform hover:scale-110">
                  {/* Outer pulse */}
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-40"
                    style={{ backgroundColor: severityColor }}
                  />
                  {/* Pin body */}
                  <div
                    className="relative w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: severityColor }}
                  >
                    {hazard.severity === 'critical' ? '!' : '●'}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow popup */}
          {activePopupHazard && (
            <InfoWindow
              position={{
                lat: activePopupHazard.location.lat,
                lng: activePopupHazard.location.lng
              }}
              onCloseClick={() => setActivePopupHazard(null)}
              headerContent={
                <div className="text-xs font-mono font-bold text-slate-500">
                  {activePopupHazard.id} ·{' '}
                  <span className="capitalize">{activePopupHazard.status.replace('_', ' ')}</span>
                </div>
              }
            >
              <div className="p-1 min-w-[240px] max-w-[280px]">
                <img
                  src={activePopupHazard.imageUrl}
                  alt={activePopupHazard.title}
                  className="w-full h-24 rounded-lg object-cover mb-2 border border-slate-200"
                />
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activePopupHazard.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activePopupHazard.location.address}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 font-semibold">
                  <span
                    className={`uppercase ${
                      activePopupHazard.severity === 'critical'
                        ? 'text-rose-600'
                        : activePopupHazard.severity === 'high'
                        ? 'text-amber-600'
                        : 'text-sky-600'
                    }`}
                  >
                    {activePopupHazard.severity}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {activePopupHazard.upvotes} confirmations
                  </span>
                </div>
                <button
                  onClick={() => setSelectedHazard(activePopupHazard)}
                  className="mt-2.5 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>View Incident Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating Map Controls & Filters Bar */}
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[460px] z-10 space-y-2 pointer-events-none">
          {/* Search bar */}
          <div className="pointer-events-auto flex items-center gap-2 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Search by street or district..."
              className="flex-1 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
            />
            {mapSearch && (
              <button
                onClick={() => setMapSearch('')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
              {filteredHazards.length} pins
            </span>
          </div>

          {/* Filter Pills Bar */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs">
            {/* Heatmap toggle */}
            <button
              onClick={() => setIsHeatmap(!isHeatmap)}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                isHeatmap
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Heatmap
            </button>

            {/* Severity Filter Dropdown */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none font-medium focus:outline-hidden"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none font-medium focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none font-medium focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORIES_CONFIG).map(([k, c]) => (
                <option key={k} value={k}>
                  {c.label}
                </option>
              ))}
            </select>

            {(categoryFilter !== 'all' ||
              severityFilter !== 'all' ||
              statusFilter !== 'all' ||
              mapSearch) && (
              <button
                onClick={resetFilters}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                title="Reset all filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Toggle button on map */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-4 z-10 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Hazard Feed Sidebar"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Synchronized Hazard Sidebar */}
      {sidebarOpen && (
        <div className="w-80 sm:w-96 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 shadow-xl transition-all">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Mapped Incidents ({filteredHazards.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click an incident to focus map pin
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
            {filteredHazards.map((hazard) => (
              <div
                key={hazard.id}
                onClick={() => handleFlyTo(hazard)}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={hazard.imageUrl}
                    alt={hazard.title}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <span>{hazard.id}</span>
                      <span>·</span>
                      <span className="capitalize">{hazard.status.replace('_', ' ')}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5 group-hover:text-sky-600 transition-colors">
                      {hazard.title}
                    </h4>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{hazard.location.address}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <span
                        className={`font-semibold capitalize ${
                          hazard.severity === 'critical'
                            ? 'text-rose-600 dark:text-rose-400'
                            : hazard.severity === 'high'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {hazard.severity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHazard(hazard);
                        }}
                        className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                      >
                        Full Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
