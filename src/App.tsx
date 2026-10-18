/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { CivicProvider, useCivic } from './context/CivicContext';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/Toast';
import { HazardDetailsModal } from './views/HazardDetailsModal';
import { LandingView } from './views/LandingView';
import { ReportHazardView } from './views/ReportHazardView';
import { MapView } from './views/MapView';
import { ExploreView } from './views/ExploreView';
import { PriorityQueueView } from './views/PriorityQueueView';
import { AnalyticsView } from './views/AnalyticsView';
import { ProfileView } from './views/ProfileView';
import { AdminAuthorityView } from './views/AdminAuthorityView';
import { VoiceAssistDock } from './components/VoiceAssistDock';
import { AccessibilityModal } from './components/AccessibilityModal';
import { AriaLiveAnnouncer } from './components/AriaLiveAnnouncer';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAUrmI2G8dfDNfG-L83myF-XTbACrmtmyM';

const MainContent: React.FC = () => {
  const { currentView, setCurrentView, hazards } = useCivic();
  const { checkNearbyHazards, userLocation } = useAccessibility();
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Check proximity warnings when hazards or user location changes (Feature 6)
  useEffect(() => {
    if (userLocation && hazards.length > 0) {
      checkNearbyHazards(hazards);
    }
  }, [userLocation, hazards, checkNearbyHazards]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-20 md:pb-0">
      {/* Google Maps Demo Key In-App Quota Alert Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar />

      {/* Main Landmark with skip target */}
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
        {currentView === 'landing' && <LandingView />}
        {currentView === 'report' && <ReportHazardView />}
        {currentView === 'map' && <MapView />}
        {currentView === 'explore' && <ExploreView />}
        {currentView === 'priority' && <PriorityQueueView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'admin' && <AdminAuthorityView />}
      </main>

      {/* Accessibility Components (VoiceAssist, Settings, Screen Reader Announcer) */}
      <VoiceAssistDock />
      <AccessibilityModal />
      <AriaLiveAnnouncer />

      {/* Global Modals & Notifications */}
      <HazardDetailsModal />
      <ToastContainer />
      <MobileBottomNav />

      {/* Clean Footer (hidden in Map view for full viewport presence) */}
      {currentView !== 'map' && (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                CS
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-sans">
                CivicSense
              </span>
              <span className="text-slate-400">· Municipal Computer Vision Hazard Network</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => setCurrentView('explore')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Catalog
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Live Heatmap
              </button>
              <button
                onClick={() => setCurrentView('priority')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                AI Priority Algorithm
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                City Analytics
              </button>
            </div>

            <div className="text-slate-400 text-center sm:text-right">
              Emergency? Call 911 immediately. CivicSense is for non-emergency public works hazards.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <CivicProvider>
        <AccessibilityProvider>
          <MainContent />
        </AccessibilityProvider>
      </CivicProvider>
    </APIProvider>
  );
}
