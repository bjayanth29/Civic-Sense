import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  User,
  Award,
  ThumbsUp,
  FileText,
  Bookmark,
  ShieldCheck,
  CheckCircle,
  MapPin,
  ArrowRight,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    hazards,
    setSelectedHazard,
    resetAllData,
    showToast
  } = useCivic();

  const [activeTab, setActiveTab] = useState<'reports' | 'confirmations' | 'saved' | 'settings'>('reports');

  // Filter hazards for profile
  const myReports = hazards.filter(
    (h) => h.reporter.id === currentUser.id || h.reporter.name === currentUser.name
  );

  const savedHazards = hazards.filter((h) => currentUser.savedHazardIds.includes(h.id));

  const handleToggleAnonymize = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUser((prev) => ({
      ...prev,
      anonymizeByDefault: e.target.checked
    }));
    showToast('Privacy Preference Updated', 'Default anonymous state changed.', 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-2xl shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {currentUser.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
                {currentUser.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentUser.email} · Contributing citizen since 2025
            </p>
          </div>
        </div>

        {/* Impact Score Counter */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center sm:text-right">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Civic Impact Score
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums block mt-0.5">
            {currentUser.impactScore} pts
          </span>
        </div>
      </div>

      {/* Stats Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Reports Filed
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {myReports.length + currentUser.reportsSubmitted}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Confirmations Given
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {currentUser.confirmationsGiven}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Verified Fixes
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {currentUser.verifiedFixes}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Saved Hazards
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {savedHazards.length}
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-px">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors ${
            activeTab === 'reports'
              ? 'border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Reports ({myReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors ${
            activeTab === 'saved'
              ? 'border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Watchlist ({savedHazards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Privacy & Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                You haven't submitted any reports yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Spot damage on your route and submit photo evidence to begin tracking municipal turnaround.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {myReports.map((hazard) => (
                <div
                  key={hazard.id}
                  onClick={() => setSelectedHazard(hazard)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <img
                      src={hazard.imageUrl}
                      alt={hazard.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span>{hazard.id}</span>
                        <span>·</span>
                        <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                          {hazard.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {hazard.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{hazard.location.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-xs font-mono text-slate-500">
                      {hazard.upvotes} confirmations
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedHazards.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No saved hazards in your watchlist
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Bookmark hazards on the map or incident details to track repair milestones.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {savedHazards.map((hazard) => (
                <div
                  key={hazard.id}
                  onClick={() => setSelectedHazard(hazard)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={hazard.imageUrl}
                      alt={hazard.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-mono text-slate-400">
                        {hazard.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {hazard.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {hazard.location.address}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Privacy & Transmission Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure how your reports appear publicly and how telemetry is transmitted to municipal authorities.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={currentUser.anonymizeByDefault}
                onChange={handleToggleAnonymize}
                className="mt-0.5 rounded border-slate-300 text-slate-900"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Always submit reports anonymously
                </span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Masks your name as "Anonymous Citizen" across all public feeds.
                </span>
              </div>
            </label>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Notification Delivery
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                Status changes and dispatch notifications are sent to {currentUser.email}.
              </span>
            </div>
          </div>

          {/* Demonstration Data Reset */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                Reset Demo Incidents
              </span>
              <span className="text-[11px] text-slate-500 block">
                Restore the default San Francisco demonstration dataset.
              </span>
            </div>
            <button
              onClick={resetAllData}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
