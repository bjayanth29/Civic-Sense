import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { X, Eye, Volume2, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

export const AccessibilityModal: React.FC = () => {
  const {
    isAccessibilityModalOpen,
    setIsAccessibilityModalOpen,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    reducedMotion,
    setReducedMotion,
    proximityWarningsEnabled,
    setProximityWarningsEnabled,
    proximityThreshold,
    setProximityThreshold,
    requestUserLocation,
    userLocation,
    speak,
    announcePolite,
  } = useAccessibility();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handler
  useEffect(() => {
    if (isAccessibilityModalOpen) {
      closeButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsAccessibilityModalOpen(false);
          announcePolite('Accessibility settings closed.');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAccessibilityModalOpen, setIsAccessibilityModalOpen, announcePolite]);

  if (!isAccessibilityModalOpen) return null;

  const handleProximityToggle = async (enabled: boolean) => {
    setProximityWarningsEnabled(enabled);
    if (enabled) {
      announcePolite('Enabling proximity audio warnings. Requesting location permission.');
      const loc = await requestUserLocation();
      if (loc) {
        speak('Proximity audio warnings are active. You will hear a gentle chime when approaching reported hazards.');
      }
    } else {
      announcePolite('Proximity audio warnings disabled.');
      speak('Proximity audio warnings have been turned off.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
              <Eye className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="a11y-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Accessibility Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                WCAG 2.2 AA compliant display and audio adjustments
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => {
              setIsAccessibilityModalOpen(false);
              announcePolite('Accessibility preferences closed.');
            }}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors"
            aria-label="Close accessibility preferences"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-700 dark:text-slate-300">
          {/* Section: Visual Display */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Visual Adjustments
            </h3>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label htmlFor="toggle-high-contrast" className="font-semibold text-slate-900 dark:text-white block cursor-pointer">
                  High Contrast Mode
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Enhanced border definition and maximum contrast ratios (7:1+)
                </span>
              </div>
              <input
                id="toggle-high-contrast"
                type="checkbox"
                checked={highContrast}
                onChange={(e) => {
                  setHighContrast(e.target.checked);
                  announcePolite(`High contrast mode ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-5 h-5 accent-sky-600 rounded focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
              />
            </div>

            {/* Large Text */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label htmlFor="toggle-large-text" className="font-semibold text-slate-900 dark:text-white block cursor-pointer">
                  Large Text Scaling
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Increases base font size and line height for elevated readability
                </span>
              </div>
              <input
                id="toggle-large-text"
                type="checkbox"
                checked={largeText}
                onChange={(e) => {
                  setLargeText(e.target.checked);
                  announcePolite(`Large text scaling ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-5 h-5 accent-sky-600 rounded focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label htmlFor="toggle-reduced-motion" className="font-semibold text-slate-900 dark:text-white block cursor-pointer">
                  Reduce Motion & Animations
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Disables pulsating markers, smooth card sweeps, and transitions
                </span>
              </div>
              <input
                id="toggle-reduced-motion"
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => {
                  setReducedMotion(e.target.checked);
                  announcePolite(`Reduced motion ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-5 h-5 accent-sky-600 rounded focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Audio Proximity Warnings (Feature 6) */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-sky-500" aria-hidden="true" />
              Audio Hazard Warnings (Proximity Alert)
            </h3>

            <div className="p-4 bg-sky-50/50 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="toggle-proximity-warning" className="font-semibold text-slate-900 dark:text-white block cursor-pointer">
                    Nearby Hazard Voice Chime
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Plays a gentle two-tone chime and speaks warnings when approaching reported hazards
                  </span>
                </div>
                <input
                  id="toggle-proximity-warning"
                  type="checkbox"
                  checked={proximityWarningsEnabled}
                  onChange={(e) => handleProximityToggle(e.target.checked)}
                  className="w-5 h-5 accent-sky-600 rounded focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                />
              </div>

              {proximityWarningsEnabled && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <label htmlFor="proximity-range">Alert Distance Radius:</label>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{proximityThreshold} meters</span>
                  </div>
                  <input
                    id="proximity-range"
                    type="range"
                    min="50"
                    max="300"
                    step="25"
                    value={proximityThreshold}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProximityThreshold(val);
                      announcePolite(`Alert distance set to ${val} meters`);
                    }}
                    className="w-full accent-sky-600 cursor-pointer"
                    aria-valuemin={50}
                    aria-valuemax={300}
                    aria-valuenow={proximityThreshold}
                    aria-label="Alert distance in meters"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cooldown: To prevent audio spam, each unique hazard will only trigger an alert once every 10 minutes.
                  </p>
                </div>
              )}

              {/* Crucial mobility disclaimer per instructions */}
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 rounded-lg text-[11px] leading-relaxed border border-amber-200/60 dark:border-amber-800/40">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  <strong>Safety Notice:</strong> GPS straight-line distance is approximate. CivicSense audio warnings do not replace a white cane, guide dog, or established orientation and mobility techniques.
                </p>
              </div>
            </div>
          </div>

          {/* Section: VoiceAssist Instructions & Shortcuts */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-500" aria-hidden="true" />
              VoiceAssist & Screen Reader Tips
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>
                <strong>Voice button:</strong> Click the floating microphone button in the bottom right corner or use the keyboard text alternate.
              </li>
              <li>
                <strong>Global Search:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">⌘K</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">Ctrl+K</kbd> anywhere to search hazards.
              </li>
              <li>
                <strong>Audio Readers:</strong> Every hazard card has a <em>"Read Summary"</em> button to listen aloud.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              setIsAccessibilityModalOpen(false);
              announcePolite('Preferences saved.');
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
