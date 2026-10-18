import React, { useState, useRef, useEffect } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  MapPin,
  Camera,
  Cpu,
  Users,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Play,
  Pause
} from 'lucide-react';
import { CATEGORIES_CONFIG } from '../data/mockHazards';
import { HazardCategory } from '../types';

export const LandingView: React.FC = () => {
  const { setCurrentView, hazards, setSelectedHazard, setCategoryFilter } = useCivic();

  const recentHazards = hazards.slice(0, 4);
  const criticalCount = hazards.filter((h) => h.severity === 'critical' && h.status !== 'resolved').length;

  const handleCategoryClick = (catKey: string) => {
    setCategoryFilter(catKey as HazardCategory);
    setCurrentView('explore');
  };

  // Video background state & accessibility
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full bg-[#060913] text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Hero Section with Floating Rock Cinematic Animation */}
      <section className="relative overflow-hidden bg-[#060913] text-white">
        {/* Cinematic Floating Rocks Video & Layered Dark Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#060913]">
          {/* Still high-resolution dark navy poster frame (fallback & instant render) */}
          <img
            src="/src/assets/images/floating_rocks_poster_dark.jpg"
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              isVideoLoaded && !prefersReducedMotion && !isVideoError ? 'opacity-0' : 'opacity-85'
            }`}
          />

          {/* Clean MotionSites floating-rocks animation source */}
          {!prefersReducedMotion && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/src/assets/images/floating_rocks_poster_dark.jpg"
              className="w-full h-full object-cover object-center scale-[1.03] transition-opacity duration-1000 motion-reduce:hidden"
              style={{
                filter: 'brightness(0.38) contrast(1.32) saturate(1.22) hue-rotate(205deg)',
                opacity: isVideoLoaded && !isVideoError ? 0.9 : 0
              }}
              onCanPlay={() => setIsVideoLoaded(true)}
              onError={() => setIsVideoError(true)}
            >
              <source
                src="https://d8j0ntlcm91z4.cloudfront.net/user_3GJaYKPxdnQG0Q9O26lu6DPmcHu/hf_20260805_192612_e00017a8-56b0-4957-935b-9ffd87663994.mp4"
                type="video/mp4"
              />
            </video>
          )}

          {/* Atmospheric Lighting Layer: Subtle cyan/sky glow highlighting 3D depth and basalt facets */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_38%,rgba(14,165,233,0.16),rgba(6,182,212,0.05)_45%,transparent_72%)] pointer-events-none"
          />

          {/* Multiply Layer: Blends animation seamlessly into dark navy/midnight charcoal tone */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#060913]/30 mix-blend-multiply pointer-events-none"
          />

          {/* Left Readable Mask: Smooth horizontal gradient ensuring crisp headline & typography contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#060913] via-[#060913]/85 to-transparent pointer-events-none"
          />

          {/* Top Navbar Blend: Smooth gradient fading under the sticky header */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#060913] via-[#060913]/60 to-transparent pointer-events-none"
          />

          {/* Bottom Section Blend: Zero-seam transition gradient that flows directly into the Incident Pipeline section */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#060913]/70 to-[#060913] pointer-events-none"
          />
        </div>

        {/* Hero Interactive Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl">
            {/* Glass Hero Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0a1226]/65 border border-white/[0.12] text-slate-200 text-xs font-medium mb-6 backdrop-blur-md shadow-sm shadow-black/30 hover:border-sky-500/40 transition-colors">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              <span className="tracking-tight">Next-Gen Municipal Computer Vision & Community Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
              Spot city hazards.
              <br />
              <span className="text-slate-400 font-medium">
                Fix urban streets with AI speed.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              CivicSense connects active citizens with city public works departments. Upload a photo—our computer vision engine automatically classifies damage, detects severity bounding boxes, alerts nearby neighbors, and queues priority dispatch.
            </p>

            {/* Glass Hero CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentView('report')}
                className="px-6 py-3.5 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all duration-200 shadow-md shadow-black/30 hover:shadow-sky-500/15 active:scale-[0.99] flex items-center gap-2.5 cursor-pointer relative group"
              >
                <Camera className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Report a Hazard</span>
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#0b1328]/60 hover:bg-[#101b38]/75 border border-white/[0.14] hover:border-sky-500/40 backdrop-blur-md rounded-xl transition-all duration-200 shadow-sm shadow-black/30 hover:shadow-sky-500/10 active:scale-[0.99] flex items-center gap-2.5 cursor-pointer group"
              >
                <MapPin className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Explore Live Map</span>
              </button>
            </div>

            {/* Glass Statistics Cards */}
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="relative p-4 rounded-xl bg-[#091024]/60 backdrop-blur-md border border-white/[0.08] shadow-sm shadow-black/30 hover:border-sky-500/35 hover:bg-[#0d1733]/70 hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums tracking-tight group-hover:text-sky-200 transition-colors">
                  1,482
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium group-hover:text-slate-300 transition-colors">
                  Verified Repairs Fixed
                </div>
              </div>

              <div className="relative p-4 rounded-xl bg-[#091024]/60 backdrop-blur-md border border-white/[0.08] shadow-sm shadow-black/30 hover:border-sky-500/35 hover:bg-[#0d1733]/70 hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums tracking-tight group-hover:text-sky-200 transition-colors">
                  22.4h
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium group-hover:text-slate-300 transition-colors">
                  Avg Municipal Response
                </div>
              </div>

              <div className="relative p-4 rounded-xl bg-[#091024]/60 backdrop-blur-md border border-white/[0.08] shadow-sm shadow-black/30 hover:border-sky-500/35 hover:bg-[#0d1733]/70 hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums tracking-tight group-hover:text-sky-200 transition-colors">
                  96.4%
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium group-hover:text-slate-300 transition-colors">
                  AI Vision Accuracy
                </div>
              </div>

              <div className="relative p-4 rounded-xl bg-[#091024]/60 backdrop-blur-md border border-white/[0.08] shadow-sm shadow-black/30 hover:border-rose-500/40 hover:bg-[#180f20]/65 hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/20 to-transparent pointer-events-none" />
                <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-400 tabular-nums tracking-tight group-hover:text-rose-300 transition-colors">
                  {criticalCount} Active
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium group-hover:text-slate-300 transition-colors">
                  Critical Priority Incidents
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Motion accessibility & playback control with glass styling */}
        {!prefersReducedMotion && (
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause background animation' : 'Play background animation'}
            title={isPlaying ? 'Pause ambient animation' : 'Play ambient animation'}
            className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a1226]/60 hover:bg-[#0e1935]/80 border border-white/[0.1] hover:border-sky-500/30 text-xs text-slate-300 hover:text-white backdrop-blur-md transition-all shadow-sm cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-sky-400" /> : <Play className="w-3 h-3 text-slate-400" />}
            <span className="text-[11px] font-mono">{isPlaying ? 'Ambient Motion' : 'Paused'}</span>
          </button>
        )}
      </section>

      {/* How It Works Section: Automated Incident Pipeline */}
      <section className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#060913]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Automated Incident Pipeline
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">
            From Street Hazard to City Repair
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            CivicSense replaces slow paper bureaucracy with instant AI computer vision and transparent community accountability.
          </p>
        </div>

        {/* Glass Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative p-6 rounded-2xl bg-[#0a1122]/65 backdrop-blur-md border border-white/[0.08] hover:border-sky-500/30 hover:bg-[#0e172e]/80 shadow-md shadow-black/25 hover:shadow-xl hover:shadow-sky-950/20 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold text-sm mb-4 shadow-sm shadow-black/30 group-hover:scale-105 transition-transform">
              01
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
              Snap & Geo-Locate
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Take or upload a photo. High-precision GPS auto-detects cross streets and municipal district boundaries.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-[#0a1122]/65 backdrop-blur-md border border-white/[0.08] hover:border-sky-500/30 hover:bg-[#0e172e]/80 shadow-md shadow-black/25 hover:shadow-xl hover:shadow-sky-950/20 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center font-bold text-sm mb-4 shadow-sm shadow-black/30 group-hover:scale-105 transition-transform">
              02
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
              AI Vision Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Gemini computer vision parses the image, outlines 2D bounding boxes over damage, and computes a confidence score.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-[#0a1122]/65 backdrop-blur-md border border-white/[0.08] hover:border-amber-500/30 hover:bg-[#0e172e]/80 shadow-md shadow-black/25 hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold text-sm mb-4 shadow-sm shadow-black/30 group-hover:scale-105 transition-transform">
              03
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-amber-200 transition-colors">
              Community Triage
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Neighbors upvote, confirm severity, or merge duplicates. Real crowd-verification pushes urgent dangers to the top.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-[#0a1122]/65 backdrop-blur-md border border-white/[0.08] hover:border-emerald-500/30 hover:bg-[#0e172e]/80 shadow-md shadow-black/25 hover:shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold text-sm mb-4 shadow-sm shadow-black/30 group-hover:scale-105 transition-transform">
              04
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-emerald-200 transition-colors">
              Municipal Resolution
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Public Works dispatches crews with work orders. Once repaired, photographic proof is signed off and archived.
            </p>
          </div>
        </div>
      </section>

      {/* Hazard Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#070c18]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Infrastructure Scope
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Hazard Classifications Monitored
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('explore')}
            className="text-xs font-semibold text-slate-300 hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => {
            const count = hazards.filter((h) => h.category === key).length;
            return (
              <button
                key={key}
                onClick={() => handleCategoryClick(key)}
                className="p-4 rounded-xl bg-[#0b1222]/80 hover:bg-[#0f172a] border border-slate-800/80 hover:border-slate-700 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: config.badgeBg, color: config.color }}
                  >
                    ●
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400 tabular-nums">
                    {count} reports
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mt-3 group-hover:text-sky-400 transition-colors">
                  {config.label}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Live Reports Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#060913]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Field Reports
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Active Community Incidents
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('explore')}
            className="text-xs font-semibold text-slate-300 hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Explore all {hazards.length} hazards</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentHazards.map((hazard) => {
            return (
              <div
                key={hazard.id}
                onClick={() => setSelectedHazard(hazard)}
                className="group rounded-2xl bg-[#0a0f1d] border border-slate-800/80 overflow-hidden cursor-pointer hover:border-slate-700 transition-all flex flex-col"
              >
                <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={hazard.imageUrl}
                    alt={hazard.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-md uppercase tracking-wider ${
                        hazard.severity === 'critical'
                          ? 'bg-rose-500/90 text-white'
                          : hazard.severity === 'high'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-slate-800/80 text-white'
                      }`}
                    >
                      {hazard.severity}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md">
                      {Math.round(hazard.aiAnalysis.confidence * 100)}% AI Match
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-mono">
                      <span>{hazard.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{hazard.status.replace('_', ' ')}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-sky-400 transition-colors">
                      {hazard.title}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-2 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                      <span className="truncate">{hazard.location.address}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>{hazard.upvotes} confirmations</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community Impact / Verified Repairs Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#070c18]">
        <div className="bg-[#0a1122] rounded-3xl p-8 sm:p-12 text-white overflow-hidden relative border border-slate-800">
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Community Accountability
            </span>
            <h2 className="text-3xl font-bold mt-2">
              Transforming Civic Complaints into Measurable Infrastructure Repairs
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              When citizens confirm hazards and municipal crews upload verified completion photography, everyone wins. Explore real before-and-after restorations certified by city inspectors.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentView('analytics')}
                className="px-5 py-3 text-xs font-semibold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>View Before / After Fixes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('priority')}
                className="px-5 py-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>AI Priority Queue</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
