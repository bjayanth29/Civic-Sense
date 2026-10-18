import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { speakText, stopSpeaking, playGentleChime, calculateDistanceMeters, formatDistance } from '../utils/audioAlerts';
import { HazardReport } from '../types';

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  largeText: boolean;
  setLargeText: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  proximityWarningsEnabled: boolean;
  setProximityWarningsEnabled: (value: boolean) => void;
  proximityThreshold: number;
  setProximityThreshold: (meters: number) => void;
  userLocation: { lat: number; lng: number } | null;
  requestUserLocation: () => Promise<{ lat: number; lng: number } | null>;
  locationPermissionDenied: boolean;
  isSpeaking: boolean;
  lastSpokenMessage: string;
  speak: (text: string, options?: { rate?: number; onEnd?: () => void }) => void;
  stopSpeech: () => void;
  repeatLastSpeech: () => void;
  politeAnnouncement: string;
  assertiveAnnouncement: string;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
  isAccessibilityModalOpen: boolean;
  setIsAccessibilityModalOpen: (open: boolean) => void;
  isVoiceAssistOpen: boolean;
  setIsVoiceAssistOpen: (open: boolean) => void;
  checkNearbyHazards: (hazards: HazardReport[]) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // High contrast mode
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('civicsense_a11y_contrast') === 'true';
  });

  // Large text mode
  const [largeText, setLargeTextState] = useState<boolean>(() => {
    return localStorage.getItem('civicsense_a11y_large_text') === 'true';
  });

  // Reduced motion
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return localStorage.getItem('civicsense_a11y_reduced_motion') === 'true';
  });

  // Proximity alerts
  const [proximityWarningsEnabled, setProximityWarningsState] = useState<boolean>(() => {
    return localStorage.getItem('civicsense_a11y_proximity_alerts') === 'true';
  });

  const [proximityThreshold, setProximityThresholdState] = useState<number>(() => {
    const saved = localStorage.getItem('civicsense_a11y_proximity_thresh');
    return saved ? Number(saved) : 150;
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState<boolean>(false);

  // Speech status
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastSpokenMessage, setLastSpokenMessage] = useState<string>('');

  // ARIA live announcements
  const [politeAnnouncement, setPoliteAnnouncement] = useState<string>('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState<string>('');

  // Modals & Panels
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState<boolean>(false);
  const [isVoiceAssistOpen, setIsVoiceAssistOpen] = useState<boolean>(false);

  // Proximity cooldown map: hazardId -> timestamp of last alert
  const alertCooldownRef = useRef<Map<string, number>>(new Map());

  // Apply HTML body classes for contrast and text scaling
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('civicsense_a11y_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    localStorage.setItem('civicsense_a11y_large_text', String(largeText));
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('civicsense_a11y_reduced_motion', String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('civicsense_a11y_proximity_alerts', String(proximityWarningsEnabled));
  }, [proximityWarningsEnabled]);

  useEffect(() => {
    localStorage.setItem('civicsense_a11y_proximity_thresh', String(proximityThreshold));
  }, [proximityThreshold]);

  const setHighContrast = (val: boolean) => setHighContrastState(val);
  const setLargeText = (val: boolean) => setLargeTextState(val);
  const setReducedMotion = (val: boolean) => setReducedMotionState(val);
  const setProximityWarningsEnabled = (val: boolean) => setProximityWarningsState(val);
  const setProximityThreshold = (val: number) => setProximityThresholdState(val);

  // ARIA announcements
  const announcePolite = useCallback((msg: string) => {
    setPoliteAnnouncement(msg);
  }, []);

  const announceAssertive = useCallback((msg: string) => {
    setAssertiveAnnouncement(msg);
  }, []);

  // Speech functions
  const speak = useCallback((text: string, options?: { rate?: number; onEnd?: () => void }) => {
    if (!text.trim()) return;
    setIsSpeaking(true);
    setLastSpokenMessage(text);
    speakText(text, {
      rate: options?.rate ?? 1.0,
      onEnd: () => {
        setIsSpeaking(false);
        options?.onEnd?.();
      },
      onError: () => {
        setIsSpeaking(false);
      },
    });
  }, []);

  const stopSpeech = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const repeatLastSpeech = useCallback(() => {
    if (lastSpokenMessage) {
      speak(lastSpokenMessage);
    }
  }, [lastSpokenMessage, speak]);

  // Request user location with GPS permission
  const requestUserLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationPermissionDenied(true);
      announceAssertive('Geolocation is not supported by your browser.');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setLocationPermissionDenied(false);
          announcePolite('Location retrieved successfully.');
          resolve(loc);
        },
        (err) => {
          console.warn('Geolocation permission denied or error:', err);
          setLocationPermissionDenied(true);
          announceAssertive('Location permission was denied or unavailable. You can enter an address manually.');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [announceAssertive, announcePolite]);

  // Watch position if proximity alerts are enabled
  useEffect(() => {
    if (!proximityWarningsEnabled || typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn('Proximity location watch error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [proximityWarningsEnabled]);

  // Check nearby hazards and trigger gentle chime + speech notification (Feature 6)
  const checkNearbyHazards = useCallback(
    async (hazards: HazardReport[]) => {
      if (!proximityWarningsEnabled || !userLocation) return;

      const now = Date.now();
      const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes per hazard

      for (const hazard of hazards) {
        if (hazard.status === 'resolved') continue;

        const distance = calculateDistanceMeters(
          userLocation.lat,
          userLocation.lng,
          hazard.location.lat,
          hazard.location.lng
        );

        if (distance <= proximityThreshold) {
          const lastAlerted = alertCooldownRef.current.get(hazard.id) || 0;
          if (now - lastAlerted > COOLDOWN_MS) {
            alertCooldownRef.current.set(hazard.id, now);

            // 1. Play gentle two-tone harmonic chime
            await playGentleChime();

            // 2. Announce spoken warning
            const formattedDist = formatDistance(distance);
            const warningMsg = `Attention: Reported ${hazard.category} hazard, ${hazard.title}, approximately ${formattedDist} away. Severity is ${hazard.severity}. Notice: GPS distance is approximate straight-line estimation.`;
            speak(warningMsg);
            announceAssertive(warningMsg);
            break; // Alert for the first nearest hazard to avoid overlapping speech
          }
        }
      }
    },
    [proximityWarningsEnabled, userLocation, proximityThreshold, speak, announceAssertive]
  );

  return (
    <AccessibilityContext.Provider
      value={{
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
        userLocation,
        requestUserLocation,
        locationPermissionDenied,
        isSpeaking,
        lastSpokenMessage,
        speak,
        stopSpeech,
        repeatLastSpeech,
        politeAnnouncement,
        assertiveAnnouncement,
        announcePolite,
        announceAssertive,
        isAccessibilityModalOpen,
        setIsAccessibilityModalOpen,
        isVoiceAssistOpen,
        setIsVoiceAssistOpen,
        checkNearbyHazards,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
