import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { X, ShieldCheck, User, Building, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, isAuthorityMode, setIsAuthorityMode, showToast } = useCivic();
  const [activeTab, setActiveTab] = useState<'citizen' | 'authority'>('citizen');
  const [anonymize, setAnonymize] = useState(currentUser.anonymizeByDefault);
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [emailInput, setEmailInput] = useState(currentUser.email);

  if (!isOpen) return null;

  const handleSaveCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser((prev) => ({
      ...prev,
      name: nameInput || 'Civic Volunteer',
      email: emailInput || 'citizen@civicsense.org',
      role: 'citizen',
      anonymizeByDefault: anonymize
    }));
    setIsAuthorityMode(false);
    showToast('Citizen Profile Updated', `Logged in as ${nameInput || 'Citizen'}.`, 'success');
    onClose();
  };

  const handleSwitchToAuthority = () => {
    setCurrentUser((prev) => ({
      ...prev,
      name: 'Officer Marcus Miller',
      email: 'm.miller@sfpublicworks.gov',
      role: 'authority',
      badge: 'DPW Senior Dispatcher',
      crewDepartment: 'Bureau of Street Repair & Operations'
    }));
    setIsAuthorityMode(true);
    showToast('Authority Mode Activated', 'Municipal triage, crew dispatch, and status controls enabled.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              User Access & Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between Citizen Reporter and Municipal Authority
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setActiveTab('citizen')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'citizen'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            Citizen Reporter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('authority')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'authority'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Building className="w-4 h-4" />
            Municipal Authority
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'citizen' ? (
            <form onSubmit={handleSaveCitizen} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400"
                  placeholder="e.g. Jane Chen"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email for Status Updates
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400"
                  placeholder="jane.chen@community.org"
                />
              </div>

              {/* Privacy toggles */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Privacy & Location Controls
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymize}
                    onChange={(e) => setAnonymize(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 block">
                      Anonymize Public Reports
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">
                      Your identity will be masked as "Anonymous Citizen" on public maps and feeds.
                    </span>
                  </div>
                </label>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  Exact GPS coordinates are shared solely with assigned municipal road crews for rapid triage.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Save & Continue as Citizen
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">Municipal Authority Demo Session</p>
                <p>
                  Access the dispatch console used by Public Works, Traffic Engineering, and Urban Forestry to assign crews and close work orders.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Officer Marcus Miller
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Department of Public Works — Operations Dispatch
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> Verified Civic Official
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwitchToAuthority}
                className="w-full py-2.5 px-4 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
              >
                Enter as Municipal Authority
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
