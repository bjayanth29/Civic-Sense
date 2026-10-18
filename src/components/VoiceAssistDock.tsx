import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useCivic } from '../context/CivicContext';
import { HazardCategory, HazardReport, HazardSeverity } from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  X,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
} from 'lucide-react';

// SpeechRecognition type polyfill
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

type VoiceStep = 'idle' | 'type' | 'description' | 'location' | 'confirm' | 'submitting' | 'done';

const CATEGORY_MAP: Record<string, HazardCategory> = {
  pothole: 'roads',
  road: 'roads',
  asphalt: 'roads',
  pavement: 'roads',
  street: 'roads',
  tree: 'trees',
  branch: 'trees',
  limb: 'trees',
  foliage: 'trees',
  electric: 'electrical',
  electrical: 'electrical',
  wire: 'electrical',
  light: 'electrical',
  lamp: 'electrical',
  power: 'electrical',
  water: 'water',
  drain: 'water',
  leak: 'water',
  flood: 'water',
  sewer: 'water',
  pipe: 'water',
  crack: 'structural',
  structural: 'structural',
  bridge: 'structural',
  wall: 'structural',
  footpath: 'structural',
  sidewalk: 'structural',
  garbage: 'waste',
  waste: 'waste',
  trash: 'waste',
  dump: 'waste',
  debris: 'waste',
  traffic: 'traffic',
  sign: 'traffic',
  signal: 'traffic',
  fire: 'fire',
  smoke: 'fire',
  hazard: 'roads',
};

export const VoiceAssistDock: React.FC = () => {
  const {
    speak,
    stopSpeech,
    repeatLastSpeech,
    isSpeaking,
    announcePolite,
    announceAssertive,
    requestUserLocation,
    userLocation,
    isVoiceAssistOpen,
    setIsVoiceAssistOpen,
  } = useAccessibility();

  const { addHazard } = useCivic();

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Conversation history
  const [transcript, setTranscript] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: 'CivicSense VoiceAssist is ready. Say "Report hazard" to start a guided report, or ask for help.',
    },
  ]);

  // Guided reporting draft state
  const [step, setStep] = useState<VoiceStep>('idle');
  const [draftCategory, setDraftCategory] = useState<HazardCategory>('roads');
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftDescription, setDraftDescription] = useState<string>('');
  const [draftLocation, setDraftLocation] = useState<{ address: string; lat: number; lng: number }>({
    address: 'Near User Location',
    lat: 37.7749,
    lng: -122.4194,
  });
  const [draftSeverity, setDraftSeverity] = useState<HazardSeverity>('high');

  // Text input alternative for keyboard navigators
  const [textInput, setTextInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        announcePolite('Listening. Speak your answer now.');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          handleUserInput(spoken);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicPermissionDenied(true);
          const err = 'Microphone permission was denied. You can use the text box below to interact.';
          announceAssertive(err);
          setTranscript((prev) => [...prev, { sender: 'assistant', text: err }]);
        } else if (event.error === 'no-speech') {
          announcePolite('No speech detected. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup failed:', e);
      setSpeechSupported(false);
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  // Scroll to bottom of transcript
  useEffect(() => {
    if (isVoiceAssistOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, isVoiceAssistOpen]);

  // Start speech recognition
  const startListening = useCallback(() => {
    stopSpeech();
    if (!speechSupported) {
      announceAssertive('Speech recognition is not supported in this browser. Please use the text input.');
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch (e) {
      // If already started, restart
      recognitionRef.current?.abort();
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch {}
      }, 100);
    }
  }, [speechSupported, stopSpeech, announceAssertive]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Assistant response helper
  const assistantReply = useCallback(
    (text: string) => {
      setTranscript((prev) => [...prev, { sender: 'assistant', text }]);
      announcePolite(text);
      speak(text);
    },
    [announcePolite, speak]
  );

  // Guided Voice Workflow State Machine (Feature 2)
  const handleUserInput = (input: string) => {
    const clean = input.trim();
    if (!clean) return;

    setTranscript((prev) => [...prev, { sender: 'user', text: clean }]);
    const lower = clean.toLowerCase();

    // Universal cancel command
    if (lower.includes('cancel') || lower.includes('stop report') || lower.includes('abort')) {
      setStep('idle');
      assistantReply('Hazard report cancelled. Let me know if you need anything else.');
      return;
    }

    // Step 0: Idle
    if (step === 'idle') {
      if (
        lower.includes('report') ||
        lower.includes('pothole') ||
        lower.includes('hazard') ||
        lower.includes('issue') ||
        lower.includes('broken')
      ) {
        setStep('type');
        assistantReply(
          'Starting guided civic hazard report. Step 1: What type of hazard is it? For example: pothole, fallen tree, broken streetlight, water leak, or sidewalk damage.'
        );
      } else if (lower.includes('help') || lower.includes('what can i say')) {
        assistantReply(
          'You can say "Report hazard" to submit a pothole or street obstruction, "Read nearby hazards" to hear nearby reports, or "Cancel" anytime.'
        );
      } else {
        // Check if user named a category directly
        let foundCat: HazardCategory | null = null;
        for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
          if (lower.includes(key)) {
            foundCat = cat;
            break;
          }
        }
        if (foundCat) {
          setDraftCategory(foundCat);
          setDraftTitle(`Reported ${foundCat} hazard`);
          setStep('description');
          assistantReply(
            `Identified ${foundCat} hazard. Step 2: Please describe the hazard in detail. How severe is the damage, and does it block pedestrians or traffic?`
          );
        } else {
          assistantReply(
            `I heard: "${clean}". Say "Report hazard" to start a guided submission, or type your answer.`
          );
        }
      }
      return;
    }

    // Step 1: Hazard Type
    if (step === 'type') {
      let matchedCat: HazardCategory = 'roads';
      let titleGuess = `Civic ${clean} hazard`;

      for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
        if (lower.includes(key)) {
          matchedCat = cat;
          titleGuess = `Reported ${clean}`;
          break;
        }
      }

      setDraftCategory(matchedCat);
      setDraftTitle(titleGuess);
      setStep('description');
      assistantReply(
        `Recorded category as ${matchedCat}. Step 2: Please provide a description of the hazard and how it impacts safety.`
      );
      return;
    }

    // Step 2: Description
    if (step === 'description') {
      setDraftDescription(clean);

      // Infer severity
      let severity: HazardSeverity = 'medium';
      if (lower.includes('critical') || lower.includes('dangerous') || lower.includes('emergency') || lower.includes('exposed wire')) {
        severity = 'critical';
      } else if (lower.includes('severe') || lower.includes('large') || lower.includes('huge') || lower.includes('deep')) {
        severity = 'high';
      } else if (lower.includes('minor') || lower.includes('small')) {
        severity = 'low';
      }
      setDraftSeverity(severity);

      setStep('location');
      assistantReply(
        `Description recorded. Step 3: Where is this hazard located? You can say "Use my current location", or speak a street name or landmark.`
      );
      return;
    }

    // Step 3: Location
    if (step === 'location') {
      if (lower.includes('current') || lower.includes('here') || lower.includes('gps') || lower.includes('my location')) {
        assistantReply('Retrieving your GPS location...');
        requestUserLocation().then((loc) => {
          if (loc) {
            setDraftLocation({
              address: `GPS (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`,
              lat: loc.lat,
              lng: loc.lng,
            });
            setStep('confirm');
            assistantReply(
              `Location set to your current GPS position. Step 4: Please review and confirm. You are submitting a ${draftCategory} hazard: "${clean}". Say "Confirm" to submit to the city public works department, or say "Cancel".`
            );
          } else {
            setStep('location');
            assistantReply(
              'Could not access GPS. Please speak or type the street address or cross street.'
            );
          }
        });
      } else {
        // Custom address spoken
        const fallbackCoords = userLocation || { lat: 37.7749, lng: -122.4194 };
        setDraftLocation({
          address: clean,
          lat: fallbackCoords.lat,
          lng: fallbackCoords.lng,
        });
        setStep('confirm');
        assistantReply(
          `Location recorded as "${clean}". Step 4: Review and confirm. Category: ${draftCategory}. Description: "${draftDescription}". Say "Confirm" to submit, or say "Cancel".`
        );
      }
      return;
    }

    // Step 4: Confirmation & Submission
    if (step === 'confirm') {
      if (lower.includes('confirm') || lower.includes('yes') || lower.includes('submit') || lower.includes('send') || lower.includes('go')) {
        submitVoiceReport();
      } else if (lower.includes('no') || lower.includes('cancel')) {
        setStep('idle');
        assistantReply('Report cancelled.');
      } else {
        assistantReply('Please say "Confirm" to submit the report to public works, or "Cancel" to abort.');
      }
      return;
    }
  };

  // Submit real report to CivicContext & Backend
  const submitVoiceReport = async () => {
    setStep('submitting');
    assistantReply('Submitting your report to the municipal dispatch queue...');

    try {
      const newReport = addHazard({
        title: draftTitle || `Voice Reported ${draftCategory.toUpperCase()}`,
        description: draftDescription || 'Reported via CivicSense VoiceAssist.',
        category: draftCategory,
        severity: draftSeverity,
        status: 'reported',
        location: {
          address: draftLocation.address,
          lat: draftLocation.lat,
          lng: draftLocation.lng,
          district: 'Metro District',
        },
        imageUrl: '/src/assets/images/hazard_pothole_road_1791218443596.jpg',
        aiAnalysis: {
          categoryDetected: `Voice Verified ${draftCategory}`,
          confidence: 0.95,
          severityDetected: draftSeverity,
          department: draftCategory === 'roads' ? 'Department of Public Works' : 'Municipal Services',
          impactReason: 'Reported through VoiceAssist with priority dispatch classification.',
          detectedHazards: ['Voice Assisted Intake', 'Hands-Free Submission', 'Accessibility Verified'],
          boundingBoxes: [
            { label: 'Voice Identified Damage', box_2d: [200, 200, 800, 800], confidence: 0.95 }
          ]
        },
        reporter: {
          id: 'user-voice',
          name: 'VoiceAssist Resident',
          isAnonymous: false,
          badge: 'Voice Guardian'
        },
        priorityScore: draftSeverity === 'critical' ? 88 : draftSeverity === 'high' ? 74 : 52,
        trafficImpact: draftSeverity === 'critical' || draftSeverity === 'high' ? 'high' : 'medium',
        isSchoolZone: false
      });

      setStep('done');

      const successMsg = `Your hazard report has been successfully submitted! Assigned Report ID is ${newReport.id}. It is now in the municipal queue with ${newReport.severity} severity. Thank you for reporting!`;
      assistantReply(successMsg);

      setTimeout(() => {
        setStep('idle');
      }, 5000);
    } catch (err) {
      console.error('Voice submission failed:', err);
      setStep('confirm');
      assistantReply('Submission failed due to a network error. Your details are saved. Say "Confirm" to retry.');
    }
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const msg = textInput;
    setTextInput('');
    handleUserInput(msg);
  };

  return (
    <>
      {/* 1. Persistent Floating VoiceAssist Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          ref={voiceButtonRef}
          onClick={() => {
            const nextState = !isVoiceAssistOpen;
            setIsVoiceAssistOpen(nextState);
            if (nextState) {
              announcePolite('CivicSense VoiceAssist dock opened. Say "Report hazard" to begin.');
              if (speechSupported && !micPermissionDenied) {
                startListening();
              }
            } else {
              stopListening();
              stopSpeech();
              announcePolite('CivicSense VoiceAssist dock closed.');
            }
          }}
          className={`flex items-center gap-2.5 px-4 py-3.5 rounded-full font-semibold text-sm shadow-xl transition-all focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none ${
            isVoiceAssistOpen
              ? 'bg-sky-600 text-white shadow-sky-600/30'
              : isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
              : 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-slate-900/30 hover:scale-105'
          }`}
          aria-label={
            isVoiceAssistOpen
              ? 'Close Voice Assistant Dock'
              : isListening
              ? 'Listening... Click to open Voice Assistant Dock'
              : 'Open CivicSense Voice Assistant (Speech & Keyboard)'
          }
          aria-expanded={isVoiceAssistOpen}
          aria-haspopup="dialog"
        >
          {isListening ? (
            <Mic className="w-5 h-5 text-white animate-bounce" aria-hidden="true" />
          ) : (
            <Mic className="w-5 h-5" aria-hidden="true" />
          )}
          <span className="font-bold tracking-tight">VoiceAssist</span>
          {isSpeaking && <Volume2 className="w-4 h-4 animate-pulse text-sky-300" aria-hidden="true" />}
        </button>
      </div>

      {/* 2. Expandable Accessible Voice Dock */}
      {isVoiceAssistOpen && (
        <section
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[75vh] bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="false"
          aria-labelledby="voice-dock-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 id="voice-dock-title" className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  CivicSense VoiceAssist
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {step === 'idle'
                    ? 'Ready for speech or text commands'
                    : `Guided Intake · Step: ${step.toUpperCase()}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Stop audio button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeech}
                  className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                  aria-label="Stop speaking"
                  title="Stop speaking"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
              {/* Repeat last speech */}
              <button
                onClick={repeatLastSpeech}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Repeat last speech"
                title="Repeat message"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {/* Close dock */}
              <button
                onClick={() => {
                  stopListening();
                  stopSpeech();
                  setIsVoiceAssistOpen(false);
                }}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Close VoiceAssist Dock"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guided Step Progress Indicator */}
          {step !== 'idle' && (
            <div className="px-4 py-2 bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/40 text-xs text-sky-800 dark:text-sky-300 flex items-center justify-between">
              <span className="font-semibold">
                {step === 'type' && '1. Hazard Type'}
                {step === 'description' && '2. Description'}
                {step === 'location' && '3. Location'}
                {step === 'confirm' && '4. Confirm Report'}
                {step === 'submitting' && 'Submitting...'}
                {step === 'done' && 'Completed!'}
              </span>
              <button
                onClick={() => {
                  setStep('idle');
                  assistantReply('Report workflow cancelled.');
                }}
                className="text-[11px] underline hover:text-sky-950 dark:hover:text-white"
              >
                Cancel Report
              </button>
            </div>
          )}

          {/* Transcript Message Area */}
          <div
            className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-80 text-xs text-slate-800 dark:text-slate-200"
            role="log"
            aria-live="polite"
            aria-label="Voice conversation transcript"
          >
            {transcript.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white font-medium rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                  }`}
                >
                  <span className="sr-only">{msg.sender === 'user' ? 'You said: ' : 'Assistant said: '}</span>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Browser / Permission Warnings */}
          {(!speechSupported || micPermissionDenied) && (
            <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
              <span>
                {micPermissionDenied
                  ? 'Microphone blocked. You can type instructions or answers below.'
                  : 'Web Speech recognition is not supported in this browser. Please use the text input below.'}
              </span>
            </div>
          )}

          {/* Action & Input Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Listening control & Quick suggestion chips */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!speechSupported || micPermissionDenied}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs transition-colors ${
                  isListening
                    ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                    : 'bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start microphone speech input'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" aria-hidden="true" />
                    <span>Listening (Tap to Stop)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" aria-hidden="true" />
                    <span>Tap & Speak</span>
                  </>
                )}
              </button>

              {step === 'confirm' && (
                <button
                  onClick={submitVoiceReport}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5"
                  aria-label="Confirm submission"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm</span>
                </button>
              )}
            </div>

            {/* Keyboard-Accessible Text Alternative Input Form */}
            <form onSubmit={handleManualSend} className="flex items-center gap-1.5 pt-1">
              <label htmlFor="voice-text-input" className="sr-only">
                Type a message or answer for VoiceAssist
              </label>
              <input
                id="voice-text-input"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  step === 'idle'
                    ? 'Type "Report hazard" or a question...'
                    : step === 'type'
                    ? 'Type category (e.g. pothole, tree)...'
                    : step === 'description'
                    ? 'Type description of damage...'
                    : step === 'location'
                    ? 'Type address or "current location"...'
                    : 'Type "confirm" to submit...'
                }
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors"
                aria-label="Send text command"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
};
