import React, { useState, useRef } from 'react';
import { Map, AdvancedMarker, ColorScheme } from '@vis.gl/react-google-maps';
import { useCivic } from '../context/CivicContext';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Bot,
  Brain,
  ShieldAlert,
  Loader2,
  Check
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';
import { HazardCategory, HazardSeverity, BoundingBox, GemmaClassificationResult } from '../types';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import { useAccessibility } from '../context/AccessibilityContext';
import { Mic } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_SAMPLES = [
  {
    name: 'Asphalt Pothole',
    category: 'roads' as HazardCategory,
    imageUrl: '/src/assets/images/hazard_pothole_road_1791218443596.jpg',
    defaultAddress: '840 Market Street, San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194
  },
  {
    name: 'Fallen Tree Limb',
    category: 'trees' as HazardCategory,
    imageUrl: '/src/assets/images/hazard_fallen_tree_1791218456024.jpg',
    defaultAddress: '1420 Haight Street, San Francisco, CA',
    lat: 37.7694,
    lng: -122.4467
  },
  {
    name: 'Clogged Storm Drain',
    category: 'water' as HazardCategory,
    imageUrl: '/src/assets/images/hazard_flooded_drain_1791218470195.jpg',
    defaultAddress: '2240 Mission Street, San Francisco, CA',
    lat: 37.7599,
    lng: -122.4148
  }
];

export const ReportHazardView: React.FC = () => {
  const {
    addHazard,
    setCurrentView,
    setSelectedHazard,
    currentUser,
    hazards,
    mergeDuplicateHazard,
    showToast,
    isDarkMode
  } = useCivic();

  const { announcePolite, setIsVoiceAssistOpen } = useAccessibility();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_SAMPLES[0].imageUrl);
  const [category, setCategory] = useState<HazardCategory>('roads');
  const [severity, setSeverity] = useState<HazardSeverity>('high');
  const [title, setTitle] = useState('Deep Roadway Pothole with Sub-base Erosion');
  const [description, setDescription] = useState(
    'Deep cavity in center lane measuring approximately 30cm across. Vehicles swerving abruptly to avoid rim damage.'
  );
  const [address, setAddress] = useState('840 Market Street, San Francisco, CA');
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [district, setDistrict] = useState('District 6 (Civic Center)');
  const [isAnonymous, setIsAnonymous] = useState(currentUser.anonymizeByDefault);
  const [crewGpsOnly, setCrewGpsOnly] = useState(true);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0.96);
  const [aiCategoryDetected, setAiCategoryDetected] = useState('Severe Asphalt Pothole with Sub-base Exposure');
  const [aiImpactReason, setAiImpactReason] = useState(
    'Imminent vehicle tire/wheel failure and collision hazard in active transit corridor.'
  );
  const [aiDepartment, setAiDepartment] = useState('Department of Public Works — Street Maintenance');
  const [aiDetectedHazards, setAiDetectedHazards] = useState(['Pavement Void', 'Fractured Bitumen Edges', 'Loose Ballast Gravel']);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([
    { label: 'Deep Asphalt Cavity', box_2d: [320, 240, 760, 780], confidence: 0.96 },
    { label: 'Pavement Void Perimeter', box_2d: [200, 150, 880, 890], confidence: 0.88 }
  ]);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  // Gemma AI Classification State
  const [isClassifyingGemma, setIsClassifyingGemma] = useState(false);
  const [gemmaResult, setGemmaResult] = useState<GemmaClassificationResult | null>(null);
  const [gemmaError, setGemmaError] = useState<string | null>(null);
  const [hasUserEditedCategory, setHasUserEditedCategory] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  // Duplicate Check State
  const [dismissDuplicate, setDismissDuplicate] = useState(false);

  // Check for nearby potential duplicate
  const potentialDuplicate = !dismissDuplicate
    ? hazards.find((h) => {
        if (h.status === 'resolved') return false;
        // Same category or nearby coordinate (~0.005 deg is ~500m)
        const latDiff = Math.abs(h.location.lat - lat);
        const lngDiff = Math.abs(h.location.lng - lng);
        return (latDiff < 0.006 && lngDiff < 0.006) || (h.category === category && h.location.address.toLowerCase().includes(address.toLowerCase().split(' ')[1] || ''));
      })
    : null;

  // Run AI analysis
  const runAiAnalysis = async (imgSrc: string, catHint?: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgSrc.startsWith('data:') ? imgSrc : undefined,
          categoryHint: catHint || category,
          descriptionHint: description
        })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        if (d.category) setCategory(d.category);
        if (d.title) setTitle(d.title);
        if (d.description) setDescription(d.description);
        if (d.severity) setSeverity(d.severity);
        if (d.confidence) setAiConfidence(d.confidence);
        if (d.categoryDetected) setAiCategoryDetected(d.categoryDetected);
        if (d.impactReason) setAiImpactReason(d.impactReason);
        if (d.department) setAiDepartment(d.department);
        if (d.detectedHazards) setAiDetectedHazards(d.detectedHazards);
        if (d.boundingBoxes) setBoundingBoxes(d.boundingBoxes);
        showToast('AI Vision Inspection Complete', `Confidence score: ${Math.round(d.confidence * 100)}%`, 'info');
      }
    } catch (err) {
      console.warn('AI analysis call failed, using fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        runAiAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SAMPLES[0]) => {
    setSelectedImage(preset.imageUrl);
    setCategory(preset.category);
    setAddress(preset.defaultAddress);
    setLat(preset.lat);
    setLng(preset.lng);
    setDismissDuplicate(false);
    runAiAnalysis(preset.imageUrl, preset.category);
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(5)));
          setLng(Number(pos.coords.longitude.toFixed(5)));
          setAddress(`Near ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°W`);
          showToast('GPS Coordinates Acquired', 'Location locked to device geolocation.', 'success');
        },
        (err) => {
          showToast('Geolocation Inaccessible', 'Using metropolitan downtown default.', 'warning');
        }
      );
    } else {
      showToast('Geolocation Not Supported', 'Please enter address manually.', 'warning');
    }
  };

  const mapGemmaCategoryToCivicSense = (gemmaCat: GemmaClassificationResult['category']): HazardCategory => {
    switch (gemmaCat) {
      case 'pothole':
      case 'damaged road':
        return 'roads';
      case 'garbage':
      case 'illegal dumping':
        return 'waste';
      case 'water leakage':
      case 'drainage':
        return 'water';
      case 'broken streetlight':
        return 'electrical';
      case 'traffic hazard':
        return 'traffic';
      case 'public infrastructure damage':
        return 'structural';
      default:
        return 'roads';
    }
  };

  const runGemmaClassification = async (textToClassify: string) => {
    const query = textToClassify.trim();
    if (!query || query.length < 12) {
      setGemmaResult(null);
      setGemmaError(null);
      return;
    }

    setIsClassifyingGemma(true);
    setGemmaError(null);

    try {
      const res = await fetch('/api/ai/classify-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: query,
          location: {
            address,
            lat,
            lng,
            district
          }
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setGemmaResult(data.data);
        if (!hasUserEditedCategory) {
          const mapped = mapGemmaCategoryToCivicSense(data.data.category);
          setCategory(mapped);
          if (data.data.severity) {
            setSeverity(data.data.severity);
          }
        }
        announcePolite(`Gemma AI classified report as ${data.data.category} with urgency score ${data.data.urgencyScore}.`);
      } else {
        setGemmaError(data.error || 'Unable to classify report with Gemma at this time.');
      }
    } catch (err: any) {
      setGemmaError('Network request failed while connecting to Gemma AI service.');
    } finally {
      setIsClassifyingGemma(false);
    }
  };

  const handleDescriptionChange = (newVal: string) => {
    setDescription(newVal);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (newVal.trim().length >= 15) {
      debounceTimerRef.current = setTimeout(() => {
        runGemmaClassification(newVal);
      }, 850);
    }
  };

  const applyGemmaSuggestions = () => {
    if (!gemmaResult) return;
    const mapped = mapGemmaCategoryToCivicSense(gemmaResult.category);
    setCategory(mapped);
    setSeverity(gemmaResult.severity);
    if (gemmaResult.summary && gemmaResult.summary.length > 5) {
      setTitle(gemmaResult.summary.slice(0, 80));
    }
    showToast('Gemma Classification Applied', `Set category to ${gemmaResult.category} (${gemmaResult.severity} severity)`, 'success');
  };

  const handleEnhanceDescription = () => {
    setDescription(
      `AI Verified: High-priority hazard observed at ${address}. Impact analysis identifies ${aiDetectedHazards.join(
        ', '
      )}. ${aiImpactReason}`
    );
    showToast('Description Enhanced', 'Integrated computer vision findings into report narrative.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Compute priority score
    let baseScore = 60;
    if (severity === 'critical') baseScore = 95;
    else if (severity === 'high') baseScore = 85;
    else if (severity === 'medium') baseScore = 70;

    const newReport = addHazard({
      title: title || 'Reported Municipal Hazard',
      description: description || 'Visual hazard reported by citizen.',
      category,
      severity,
      status: 'reported',
      location: {
        lat,
        lng,
        address,
        district
      },
      imageUrl: selectedImage,
      aiAnalysis: {
        confidence: aiConfidence,
        categoryDetected: aiCategoryDetected,
        severityDetected: severity,
        impactReason: aiImpactReason,
        department: aiDepartment,
        detectedHazards: aiDetectedHazards,
        boundingBoxes
      },
      reporter: {
        id: currentUser.id,
        name: isAnonymous ? 'Anonymous Citizen' : currentUser.name,
        isAnonymous,
        badge: currentUser.badge
      },
      priorityScore: baseScore,
      trafficImpact: severity === 'critical' || severity === 'high' ? 'high' : 'medium',
      isSchoolZone: false
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setSelectedHazard(newReport);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          <span>Municipal Incident Intake</span>
          <span>·</span>
          <span>Computer Vision Verified</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Report an Urban Hazard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Submit photo evidence. CivicSense automatically classifies severity, locates the municipal boundary, and checks for nearby duplicates before alerting field response teams.
        </p>
      </div>

      {/* VoiceAssist Accessibility Prompt for Blind & Visually Impaired Citizens */}
      <div className="mb-6 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-600 text-white rounded-xl shrink-0">
            <Mic className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-sky-950 dark:text-sky-200">
              Prefer Spoken Voice Reporting?
            </h2>
            <p className="text-xs text-sky-800 dark:text-sky-300">
              Use CivicSense VoiceAssist to describe and submit hazards hands-free with guided speech prompts.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVoiceAssistOpen(true);
            announcePolite('CivicSense VoiceAssist dock opened for hands-free reporting.');
          }}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors cursor-pointer"
          aria-label="Open VoiceAssist for guided speech reporting"
        >
          Start Voice Report
        </button>
      </div>

      {/* Duplicate Incident Suggestion Banner */}
      {potentialDuplicate && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Potential Duplicate Report Detected
                </span>
                <span className="text-xs font-mono text-amber-700/80 dark:text-amber-400">
                  ({potentialDuplicate.id})
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-0.5">
                "{potentialDuplicate.title}" is already registered near this spot ({potentialDuplicate.location.address}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => mergeDuplicateHazard(potentialDuplicate.id, title)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              Merge & Upvote (+1 Priority)
            </button>
            <button
              type="button"
              onClick={() => setDismissDuplicate(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Submit as Separate
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Photo & Computer Vision Preview */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-500" />
                1. Photographic Evidence & Computer Vision
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Take a photo or choose a realistic preset test case
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Try preset:</span>
              {PRESET_SAMPLES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    selectedImage === preset.imageUrl
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Dropzone & Interactive Image Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 group">
                <img
                  src={selectedImage}
                  alt="Hazard preview"
                  className="w-full h-full object-cover"
                />

                {/* Computer Vision Bounding Box Overlay */}
                <BoundingBoxOverlay
                  boundingBoxes={boundingBoxes}
                  visible={showBoundingBoxes && !isAnalyzing}
                />

                {/* AI Scanning State overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-3" />
                    <p className="text-sm font-semibold">Gemini Vision Analyzing Image...</p>
                    <p className="text-xs text-slate-300 mt-1">
                      Detecting damage boundaries & calculating confidence
                    </p>
                  </div>
                )}

                {/* Bounding box toggle */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-md flex items-center gap-1.5 transition-colors"
                  >
                    {showBoundingBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showBoundingBoxes ? 'Hide AI Boxes' : 'Show AI Boxes'}</span>
                  </button>
                </div>
              </div>

              {/* Upload controls */}
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Custom Photo
                </button>
                <button
                  type="button"
                  onClick={() => runAiAnalysis(selectedImage)}
                  disabled={isAnalyzing}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-300 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Re-Scan Image
                </button>
              </div>
            </div>

            {/* AI Analysis Results Card */}
            <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Detection Summary</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {Math.round(aiConfidence * 100)}% Confidence
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Classification
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {aiCategoryDetected}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Target Municipal Unit
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mt-0.5">
                      {aiDepartment}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Safety Risk Factor
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {aiImpactReason}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Visual Annotations Identified
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiDetectedHazards.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                AI assistance guides routing. Final ticket is verified by municipal dispatch.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Hazard Details & Severity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            2. Hazard Details & Classification
          </h2>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCategory(key as HazardCategory);
                    setHasUserEditedCategory(true);
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                    category === key
                      ? 'border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {config.label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {config.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'low', label: 'Low', desc: 'Minor cosmetic flaw or nuisance' },
                { id: 'medium', label: 'Medium', desc: 'Pedestrian inconvenience' },
                { id: 'high', label: 'High', desc: 'Active traffic impairment / hazard' },
                { id: 'critical', label: 'Critical', desc: 'Imminent danger to life / limb' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeverity(s.id as HazardSeverity)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    severity === s.id
                      ? s.id === 'critical'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-slate-900 dark:border-white bg-slate-900/5 dark:bg-white/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-slate-900 dark:text-slate-100">
                      {s.label}
                    </span>
                    {severity === s.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Incident Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400"
                placeholder="Brief summary of condition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Description & Hazards Observed
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => runGemmaClassification(description)}
                    disabled={isClassifyingGemma || !description.trim()}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5 text-indigo-500" />
                    Classify with Gemma
                  </button>
                  <button
                    type="button"
                    onClick={handleEnhanceDescription}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Enhance with AI findings
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400"
                placeholder="Describe size, depth, traffic lane obstruction..."
              />

              {/* Gemma AI Classification Loading State */}
              {isClassifyingGemma && (
                <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
                  <span className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    Google Gemma AI analyzing report context, severity, and department triage...
                  </span>
                </div>
              )}

              {/* Gemma AI Classification Error State */}
              {gemmaError && !isClassifyingGemma && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{gemmaError}</p>
                      <p className="text-[11px] text-amber-700/90 dark:text-amber-400 mt-0.5">
                        You can continue to submit manually or retry the classification.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => runGemmaClassification(description)}
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Gemma AI Intelligence Result Card */}
              {gemmaResult && !isClassifyingGemma && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-sky-950/20 border border-indigo-200/90 dark:border-indigo-800/80 shadow-xs space-y-3.5">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            Gemma CivicTriage Intelligence
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                            {gemmaResult.sourceModel}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {Math.round(gemmaResult.confidence * 100)}% model confidence estimate · language: {gemmaResult.detectedLanguage.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono ${
                          gemmaResult.urgencyScore >= 80
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                            : gemmaResult.urgencyScore >= 60
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        <span>Urgency Score:</span>
                        <span>{gemmaResult.urgencyScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Classification Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Predicted Category & Severity
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">
                          {gemmaResult.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            gemmaResult.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : gemmaResult.severity === 'high'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          }`}
                        >
                          {gemmaResult.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        Unit: {gemmaResult.recommendedDepartment}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Recommended Municipal Action
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                        {gemmaResult.recommendedAction}
                      </p>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Model Reasoning: </span>
                    {gemmaResult.reasoning}
                  </div>

                  {/* Mandatory Human Review Warning if flagged */}
                  {gemmaResult.requiresHumanReview && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Human Inspector Review Required: </span>
                        <span>Potential immediate safety threat or ambiguous site condition requires municipal human dispatch validation.</span>
                      </div>
                    </div>
                  )}

                  {/* Citizen Control & Disclaimer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/60">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      *Gemma model estimate for triage assistance. Does not constitute physical on-site verification.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => runGemmaClassification(description)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Re-Analyze
                      </button>
                      <button
                        type="button"
                        onClick={applyGemmaSuggestions}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply AI Suggestions
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Location Detection & Pin Picker */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              3. Street Location & District
            </h2>
            <button
              type="button"
              onClick={handleGeolocate}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              Use Current GPS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Street Address or Cross Street
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400"
                placeholder="e.g. 840 Market Street, San Francisco"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                District / Borough
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          {/* Coordinates read-out */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Coordinates: {lat}° N, {lng}° W</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">
              High Precision GPS Active
            </span>
          </div>

          {/* Interactive Google Map Pin Dropper */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Fine-Tune Pin Location (Click map to move pin)
            </span>
            <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
              <Map
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                center={{ lat, lng }}
                zoom={15}
                gestureHandling="greedy"
                disableDefaultUI={false}
                colorScheme={isDarkMode ? ColorScheme.DARK : ColorScheme.LIGHT}
                style={{ width: '100%', height: '100%' }}
                onClick={(e) => {
                  if (e.detail?.latLng) {
                    setLat(Number(e.detail.latLng.lat.toFixed(5)));
                    setLng(Number(e.detail.latLng.lng.toFixed(5)));
                  }
                }}
              >
                <AdvancedMarker position={{ lat, lng }}>
                  <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white text-sm font-bold animate-bounce">
                    📍
                  </div>
                </AdvancedMarker>
              </Map>
            </div>
          </div>
        </div>

        {/* Section 4: Privacy & Permissions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            4. Privacy & Transmission Controls
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-slate-900"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Anonymize My Report
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Mask display name as "Anonymous Citizen" on public maps.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={crewGpsOnly}
                onChange={(e) => setCrewGpsOnly(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-slate-900"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Restrict Exact Telemetry
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Exact centimeter GPS is shared solely with municipal crews.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Incident to Municipal Queue
          </button>
        </div>
      </form>
    </div>
  );
};
