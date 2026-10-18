import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  X,
  MapPin,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Clock,
  Shield,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Share2,
  Bookmark,
  Eye,
  EyeOff,
  UserCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import { HazardStatus } from '../types';
import { useAccessibility } from '../context/AccessibilityContext';
import { Volume2, VolumeX } from 'lucide-react';

export const HazardDetailsModal: React.FC = () => {
  const {
    selectedHazard,
    setSelectedHazard,
    upvoteHazard,
    addConfirmation,
    addComment,
    updateHazardStatus,
    toggleSaveHazard,
    isSavedHazard,
    isAuthorityMode,
    showToast
  } = useCivic();

  const { speak, stopSpeech, isSpeaking, announcePolite } = useAccessibility();

  const [showBoxes, setShowBoxes] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'reported' | 'resolved'>('reported');
  const [isModalReading, setIsModalReading] = useState(false);

  // Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeech();
        setSelectedHazard(null);
        announcePolite('Closed incident details modal.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedHazard, stopSpeech, announcePolite]);

  if (!selectedHazard) return null;

  const isSaved = isSavedHazard(selectedHazard.id);
  const catConfig = CATEGORIES_CONFIG[selectedHazard.category] || CATEGORIES_CONFIG.roads;

  const handleUpvote = () => {
    upvoteHazard(selectedHazard.id);
  };

  const handleConfirm = () => {
    addConfirmation(selectedHazard.id, evidenceNote);
    setEvidenceNote('');
    setIsAddingEvidence(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(selectedHazard.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Incident URL copied to clipboard.', 'info');
    }
  };

  const handleReadDetailsAloud = () => {
    if (isModalReading && isSpeaking) {
      stopSpeech();
      setIsModalReading(false);
      announcePolite('Stopped reading incident details.');
      return;
    }

    setIsModalReading(true);
    const lastEvent = selectedHazard.timeline[selectedHazard.timeline.length - 1];
    const aiAttributes = selectedHazard.aiAnalysis?.detectedHazards?.join(', ') || 'Damage detected on site';
    const aiSummary = selectedHazard.aiAnalysis
      ? `AI Vision classifies this as ${selectedHazard.aiAnalysis.categoryDetected} with ${Math.round(selectedHazard.aiAnalysis.confidence * 100)} percent confidence. Impact analysis: ${selectedHazard.aiAnalysis.impactReason}. Identified attributes: ${aiAttributes}.`
      : '';

    const text = `Incident ${selectedHazard.id}: ${selectedHazard.title}. Located at ${selectedHazard.location.address}, district ${selectedHazard.location.district}. Severity is ${selectedHazard.severity}. Current status is ${selectedHazard.status.replace('_', ' ')}. Priority score is ${selectedHazard.priorityScore} out of 100. Description: ${selectedHazard.description}. ${aiSummary} Reported on ${new Date(selectedHazard.reportedAt).toLocaleDateString()} by ${selectedHazard.reporter.name}. Community confirmations: ${selectedHazard.upvotes}. Latest timeline update: ${lastEvent?.note || 'Report recorded'}.`;

    announcePolite(`Reading details for incident ${selectedHazard.id}`);
    speak(text, {
      onEnd: () => {
        setIsModalReading(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => {
          stopSpeech();
          setSelectedHazard(null);
        }}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-hazard-title"
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0">
              {selectedHazard.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {catConfig.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Read Aloud button (Feature 3) */}
            <button
              onClick={handleReadDetailsAloud}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-sky-500 ${
                isModalReading && isSpeaking
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800'
                  : 'text-sky-700 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800'
              }`}
              aria-label={isModalReading && isSpeaking ? 'Stop reading incident details aloud' : 'Read all incident details aloud'}
              title={isModalReading && isSpeaking ? 'Stop Audio' : 'Listen to Incident Summary'}
            >
              {isModalReading && isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-600" aria-hidden="true" />
                  <span className="hidden sm:inline">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span className="hidden sm:inline">Read Aloud</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleSaveHazard(selectedHazard.id)}
              className={`p-2 rounded-lg transition-colors ${
                isSaved
                  ? 'text-sky-600 bg-sky-50 dark:bg-sky-950/30'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={isSaved ? 'Saved to Profile' : 'Save Hazard'}
              aria-label={isSaved ? 'Remove from saved' : 'Save to profile'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              title="Share Incident"
              aria-label="Share incident link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                stopSpeech();
                setSelectedHazard(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label="Close incident details modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Top Grid: Photo & Primary Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Image with Bounding Box Overlay */}
            <div className="md:col-span-7 space-y-3">
              {/* Tab if resolved with before/after photos */}
              {selectedHazard.resolvedImageUrl && (
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveImageTab('reported')}
                    className={`flex-1 py-1.5 rounded-lg transition-colors ${
                      activeImageTab === 'reported'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Initial Incident Photo
                  </button>
                  <button
                    onClick={() => setActiveImageTab('resolved')}
                    className={`flex-1 py-1.5 rounded-lg transition-colors ${
                      activeImageTab === 'resolved'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Verified Repair Photo
                  </button>
                </div>
              )}

              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <img
                  src={
                    activeImageTab === 'resolved' && selectedHazard.resolvedImageUrl
                      ? selectedHazard.resolvedImageUrl
                      : selectedHazard.imageUrl
                  }
                  alt={
                    activeImageTab === 'resolved'
                      ? `Photograph of completed municipal repair for ${selectedHazard.title} at ${selectedHazard.location.address}. Verified resolved by public works dispatch.`
                      : `Photograph of reported ${selectedHazard.title} at ${selectedHazard.location.address}. AI-detected damage attributes: ${selectedHazard.aiAnalysis?.detectedHazards?.join(', ') || 'Hazardous surface condition'}. (Automated AI visual assessment, pending field sign-off).`
                  }
                  className="w-full h-full object-cover"
                />

                {activeImageTab === 'reported' && (
                  <BoundingBoxOverlay
                    boundingBoxes={selectedHazard.aiAnalysis.boundingBoxes}
                    visible={showBoxes}
                  />
                )}

                {activeImageTab === 'reported' && selectedHazard.aiAnalysis.boundingBoxes?.length > 0 && (
                  <button
                    onClick={() => setShowBoxes(!showBoxes)}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 transition-colors"
                  >
                    {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showBoxes ? 'Hide AI Overlay' : 'Show AI Overlay'}</span>
                  </button>
                )}

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider ${
                      selectedHazard.severity === 'critical'
                        ? 'bg-rose-600/90 text-white'
                        : selectedHazard.severity === 'high'
                        ? 'bg-amber-600/90 text-white'
                        : 'bg-slate-900/80 text-white'
                    }`}
                  >
                    {selectedHazard.severity} Severity
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md">
                    Priority Score: {selectedHazard.priorityScore}/100
                  </span>
                </div>
              </div>

              {/* Upvote & Confirm bar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpvote}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Confirm Hazard ({selectedHazard.upvotes})</span>
                </button>
                <button
                  onClick={() => setIsAddingEvidence(!isAddingEvidence)}
                  className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Add Evidence
                </button>
              </div>

              {/* Optional inline evidence input */}
              {isAddingEvidence && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Submit On-Site Condition Update
                  </label>
                  <input
                    type="text"
                    value={evidenceNote}
                    onChange={(e) => setEvidenceNote(e.target.value)}
                    placeholder="e.g. Tree limb shifted closer to power lines, water level is dropping..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingEvidence(false)}
                      className="px-3 py-1.5 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="px-3 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                      Submit Evidence Note
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Technical Details & AI Assessment */}
            <div className="md:col-span-5 space-y-5">
              <div>
                <h1 id="modal-hazard-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {selectedHazard.title}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{selectedHazard.location.address}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  District: {selectedHazard.location.district} ({selectedHazard.location.lat.toFixed(4)}°N, {selectedHazard.location.lng.toFixed(4)}°W)
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedHazard.description}
              </div>

              {/* AI Vision Card */}
              <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    AI Computer Vision Findings
                  </span>
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                    {Math.round(selectedHazard.aiAnalysis.confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Department: </span>
                    {selectedHazard.aiAnalysis.department}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Risk Assessment: </span>
                    {selectedHazard.aiAnalysis.impactReason}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedHazard.aiAnalysis.detectedHazards?.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dispatch Info */}
              {selectedHazard.assignedTo && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    Assigned Field Crew
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    {selectedHazard.assignedTo.team}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dispatched: {new Date(selectedHazard.assignedTo.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}

              {/* Authority Quick Controls (If in Authority Mode) */}
              {isAuthorityMode && (
                <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Municipal Authority Controls
                  </div>
                  <div className="text-xs text-slate-300">
                    Update work order status:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['verified', 'assigned', 'in_progress', 'resolved'] as HazardStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateHazardStatus(selectedHazard.id, st)}
                        className={`py-1.5 px-2 rounded-lg font-semibold capitalize border transition-colors ${
                          selectedHazard.status === st
                            ? 'bg-amber-500 text-slate-900 border-amber-500'
                            : 'border-slate-700 hover:border-slate-500 text-slate-200'
                        }`}
                      >
                        Mark {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Hazard Status Timeline */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Status Progression Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {selectedHazard.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-sky-500" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {event.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {event.note}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Action by: {event.actor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Comments & Community Discussion */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              Community Discussion ({selectedHazard.comments.length})
            </h3>

            {/* Existing comments */}
            <div className="space-y-3 mb-4">
              {selectedHazard.comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No public comments yet. Share on-the-ground observations below.
                </p>
              ) : (
                selectedHazard.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.userName} {c.userRole === 'authority' && '★ (Authority Official)'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {c.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a field note or comment..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
