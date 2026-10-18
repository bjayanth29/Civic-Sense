/**
 * Web Audio API gentle chime generator and speech synthesis utilities.
 * Uses native Web APIs with zero external dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a gentle, pleasant two-tone harmonic chime (e.g. 523.25Hz -> 659.25Hz: C5 to E5).
 */
export function playGentleChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.19);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.5);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.7);

      setTimeout(() => resolve(), 700);
    } catch (err) {
      console.warn('Audio chime playback failed:', err);
      resolve();
    }
  });
}

/**
 * Text-to-Speech synthesis with cancel and repeat support.
 */
export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (error: unknown) => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.(new Error('SpeechSynthesis not supported'));
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.lang = 'en-US';

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (event) => {
    // If canceled manually, do not treat as fatal error
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      console.warn('Speech synthesis error:', event);
      options?.onError?.(event);
    }
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Immediately cancels all currently active text-to-speech utterances.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Calculates straight-line distance in meters between two GPS coordinates using Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance into human-friendly string (meters / feet / miles).
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} meters`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}
