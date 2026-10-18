import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Shield,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  MapPin,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { HazardReport, HazardStatus } from '../types';
import { CATEGORIES_CONFIG } from '../data/mockHazards';

const CREW_TEAMS = [
  'DPW Rapid Asphalt Crew #3',
  'DPW Paving Unit #1',
  'Arborist Unit Bravo-2',
  'SFPUC Emergency Electric #4',
  'SFPUC Wastewater Catch Basin Crew',
  'SFMTA Signal Maintenance Team #2',
  'Code Enforcement Rapid Response'
];

export const AdminAuthorityView: React.FC = () => {
  const { hazards, setSelectedHazard, updateHazardStatus, currentUser, showToast } = useCivic();

  const [statusTab, setStatusTab] = useState<'all' | 'triage' | 'assigned' | 'in_progress' | 'resolved'>('triage');
  const [selectedCrew, setSelectedCrew] = useState<Record<string, string>>({});
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  // Filtered reports for dispatcher
  const filtered = hazards.filter((h) => {
    if (statusTab === 'triage') return h.status === 'reported' || h.status === 'verified';
    if (statusTab === 'assigned') return h.status === 'assigned';
    if (statusTab === 'in_progress') return h.status === 'in_progress';
    if (statusTab === 'resolved') return h.status === 'resolved';
    return true;
  });

  const handleAssignCrew = (hazardId: string) => {
    const crew = selectedCrew[hazardId] || CREW_TEAMS[0];
    updateHazardStatus(
      hazardId,
      'assigned',
      `Assigned to ${crew} by ${currentUser.name}.`,
      crew
    );
    showToast('Crew Dispatched', `${crew} assigned to incident ${hazardId}.`, 'success');
  };

  const handleAdvanceStatus = (hazardId: string, nextStatus: HazardStatus) => {
    const note = resolutionNotes[hazardId];
    updateHazardStatus(
      hazardId,
      nextStatus,
      note || `Work order updated to ${nextStatus.replace('_', ' ')}.`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Authority Banner */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Municipal Operations & Dispatch Console
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-600 text-white font-semibold">
                Official Access
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Logged in as {currentUser.name} ({currentUser.crewDepartment || 'Department of Public Works'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 text-center">
            <span className="text-slate-500 text-[11px] block">Needs Triage</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {hazards.filter((h) => h.status === 'reported' || h.status === 'verified').length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 text-center">
            <span className="text-slate-500 text-[11px] block">Active Field Crews</span>
            <span className="text-lg font-bold font-mono text-amber-600 tabular-nums">
              {hazards.filter((h) => h.status === 'assigned' || h.status === 'in_progress').length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: 'triage', label: 'Triage Queue (Needs Crew)', count: hazards.filter((h) => h.status === 'reported' || h.status === 'verified').length },
          { id: 'assigned', label: 'Dispatched', count: hazards.filter((h) => h.status === 'assigned').length },
          { id: 'in_progress', label: 'Crews Active on Site', count: hazards.filter((h) => h.status === 'in_progress').length },
          { id: 'resolved', label: 'Resolved Archive', count: hazards.filter((h) => h.status === 'resolved').length },
          { id: 'all', label: 'All Incidents', count: hazards.length }
        ].map((tab) => {
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-amber-600 text-amber-600 bg-amber-500/5'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dispatch Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No incidents in this status queue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              All work orders for this stage are currently up to date.
            </p>
          </div>
        ) : (
          filtered.map((hazard) => {
            const catConfig = CATEGORIES_CONFIG[hazard.category] || CATEGORIES_CONFIG.roads;
            return (
              <div
                key={hazard.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <img
                    src={hazard.imageUrl}
                    alt={hazard.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{hazard.id}</span>
                      <span>·</span>
                      <span className="text-slate-700 dark:text-slate-300 font-sans font-medium">
                        {catConfig.label}
                      </span>
                      <span>·</span>
                      <span className="text-rose-600 font-bold uppercase">
                        {hazard.severity} Severity
                      </span>
                      <span>·</span>
                      <span className="text-sky-600 font-bold">
                        AI Score: {hazard.priorityScore}
                      </span>
                    </div>

                    <h3
                      onClick={() => setSelectedHazard(hazard)}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600 cursor-pointer truncate mt-1"
                    >
                      {hazard.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {hazard.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {hazard.location.address}
                      </span>
                      <span>·</span>
                      <span>Target: {hazard.aiAnalysis.department}</span>
                    </div>
                  </div>
                </div>

                {/* Dispatch / Status Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
                  {hazard.status === 'reported' || hazard.status === 'verified' ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCrew[hazard.id] || CREW_TEAMS[0]}
                        onChange={(e) =>
                          setSelectedCrew({ ...selectedCrew, [hazard.id]: e.target.value })
                        }
                        className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden"
                      >
                        {CREW_TEAMS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignCrew(hazard.id)}
                        className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Crew</span>
                      </button>
                    </div>
                  ) : hazard.status === 'assigned' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdvanceStatus(hazard.id, 'in_progress')}
                        className="px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        Mark Crew On Site
                      </button>
                    </div>
                  ) : hazard.status === 'in_progress' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdvanceStatus(hazard.id, 'resolved')}
                        className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sign-Off Resolved</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Resolution Certified
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedHazard(hazard)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                    title="View Incident Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
