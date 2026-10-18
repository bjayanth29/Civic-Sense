import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Visually hidden ARIA live regions for screen-reader announcements (TalkBack, NVDA, JAWS, VoiceOver).
 * Provides both polite and assertive priorities.
 */
export const AriaLiveAnnouncer: React.FC = () => {
  const { politeAnnouncement, assertiveAnnouncement } = useAccessibility();

  return (
    <div className="sr-only" aria-hidden="false">
      {/* Polite live region for standard status updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-polite-announcer"
      >
        {politeAnnouncement}
      </div>

      {/* Assertive live region for critical alerts & proximity warnings */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="a11y-assertive-announcer"
      >
        {assertiveAnnouncement}
      </div>
    </div>
  );
};
