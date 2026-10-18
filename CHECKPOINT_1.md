# CivicSense: Checkpoint 1 Baseline Specification & Architecture

This document records the foundational state of **CivicSense**, an AI-assisted civic hazard reporting, mapping, community verification, and municipal resolution platform.

---

## 1. Executive Summary & Problem Context

Municipal public works departments often struggle with delayed hazard response due to unstructured citizen complaints, missing location details, duplicate reports, and manual triage bottlenecks. 

**CivicSense** addresses this by introducing:
- **Multimodal AI Computer Vision**: Automatic damage classification, severity scoring, and 2D bounding-box localization from citizen-uploaded photos.
- **Smart Duplicate Prevention**: Proximity and similarity clustering that groups recurring reports into single prioritized work orders.
- **Dynamic Civic Priority Scoring**: A weighted algorithmic queue ranking hazards by safety severity, traffic disruption, vulnerable school zones, crowd validation, and report age.
- **Full Transparency & Community Verification**: Interactive public timelines, upvoting ("Confirm Hazard"), field evidence updates, and before/after resolution proof.

---

## 2. Checkpoint 1 Feature Matrix

The platform is structured into 8 integrated views and modules:

### 1. Landing & Home Portal (`LandingView.tsx`)
- **Top Bar Contract**: Single-element wordmark (`CS CivicSense`), quick navigation links, global search shortcut (`⌘K`), notification badges, light/dark theme switch, and Citizen/Authority persona toggle.
- **Hero Banner**: High-resolution urban backdrop with clear action CTAs (*Report a Hazard*, *Explore Live Map*).
- **Live Statistics**: Real-time counters showing 1,482+ verified repairs, 22.4h turnaround, 96.4% AI vision accuracy, and critical incident alerts.
- **How It Works**: 4-step pipeline (*Snap Photo*, *AI Analysis*, *Community Validation*, *Municipal Resolution*).
- **Category Directory**: 8 municipal hazard categories with live incident counts.
- **Recent Reports Grid & Public Impact Spotlight**: Real-time showcase of community issues and closed tickets.

### 2. AI-Powered Hazard Intake (`ReportHazardView.tsx`)
- **Multimodal Upload**: Drag-and-drop zone, camera upload trigger, and instant preset samples (*Asphalt Pothole*, *Fallen Tree Limb*, *Clogged Storm Drain*).
- **Computer Vision Analysis**: Integrated with `/api/analyze-hazard` (powered by Gemini Vision with intelligent heuristic fallback).
- **Damage Bounding Box**: Normalized 2D box coordinates (`[ymin, xmin, ymax, xmax]`) projected onto the live image preview with toggleable SVG overlay.
- **Duplicate Detection & Merge**: Identifies open incidents within 150m of the selected location, offering a single-click *Merge & Upvote* button (+1 priority) or independent submission.
- **Interactive Street Pin Picker**: Integrated Google Map allowing citizens to click or drag a marker to fine-tune GPS coordinates.
- **AI Description Assistant**: "Enhance with AI" button that auto-expands terse citizen notes with visual findings.
- **Privacy Controls**: Options for anonymous reporting and field-crew-only coordinate transmission.

### 3. Interactive Live Hazard Map (`MapView.tsx`)
- **Map Engine**: Powered by Google Maps Platform via `@vis.gl/react-google-maps` using `mapId="DEMO_MAP_ID"`.
- **Advanced Markers**: Color-coded pins with severity indicators (Critical = Red, High = Amber, Medium = Blue, Low = Slate) and pulsing radial rings.
- **Interactive InfoWindows**: Embedded thumbnail, incident ID, title, address, severity badge, confirmation count, and direct link to full ticket modal.
- **Urban Heatmap Mode**: Radial graduated circle overlays highlighting high-incident density zones.
- **Search & Filter Bar**: Instant filter by Category, Severity, Status, and search query.
- **Synchronized Feed Sidebar**: Collapsible list of visible incidents that fly the map camera directly to selected pins.

### 4. Hazard Details & Lifecycle Timeline (`HazardDetailsModal.tsx`)
- **Image Inspection**: High-res incident view with optional AI bounding-box overlay.
- **Resolved Proof Tab**: Interactive before-and-after photo comparison for closed work orders.
- **Status Lifecycle Timeline**: 5 verified stages:
  1. *Reported* (Initial intake & AI triage)
  2. *Verified* (Citizen or inspector confirmation)
  3. *Assigned* (Dispatched to designated municipal division)
  4. *In Progress* (Crew on site with active work order)
  5. *Resolved* (Repairs completed, inspected, and verified)
- **Community Confirmation**: Upvoting counter that directly elevates civic priority.
- **Evidence & Discussion Feed**: Citizen commentary, timeline updates, and notes.

### 5. Explore Hazards Catalog (`ExploreView.tsx`)
- **Categorized Tabs**: *Trending*, *Nearby (Within 5km)*, *Recently Reported*, *Critical Hazards*, and *Recently Resolved*.
- **Search & Chips**: Live search across titles, addresses, and districts with category filter chips.
- **Display Modes**: Grid card view and dense tabular list view switcher.

### 6. AI Civic Priority Dashboard (`PriorityQueueView.tsx`)
- **Algorithmic Ranking**: Automated urgency index calculating a score from 0 to 100 based on:
  - **Vision Severity (40%)**: Critical (100 pts), High (75 pts), Medium (50 pts), Low (25 pts).
  - **Traffic Disruption (20%)**: Arterial corridors, bike lanes, bus routes.
  - **School & Vulnerable Zones (20%)**: Proximity to elementary schools, transit hubs, elder care facilities.
  - **Crowd Confirmation (10%)**: Verification count normalized to +10 pts.
  - **Age Decay (10%)**: Unresolved duration adding urgency over time.
- **Ranked Work Orders**: Priority badges (#1, #2, #3, ...) with one-click dispatch action.

### 7. Civic Analytics & Resolution Gallery (`AnalyticsView.tsx`)
- **KPI Metrics**: Total reports, resolution velocity, active municipal crews, and citizen satisfaction ratings.
- **Interactive Before/After Slider**: Split visual comparison demonstrating public works repair results.
- **Visual Distributions**: Incident breakdown by category, severity distribution bar, and district reporting density.

### 8. User Profile & Admin Authority Console (`ProfileView.tsx`, `AdminAuthorityView.tsx`)
- **Citizen Profile**: Personal contribution score, citizen ranking badge (*Civic Guardian Lv. 4*), submitted reports history, and saved watchlist.
- **Municipal Dispatch Console**: Restricted dispatcher view for assigning specialized crews (*DPW Rapid Asphalt Crew*, *Urban Forestry Arborists*, *SFPUC Emergency Electric*), advancing tickets, and uploading resolution proof.

---

## 3. Data Schema & Core Entities

```typescript
export type HazardCategory =
  | 'roads'
  | 'trees'
  | 'electrical'
  | 'water'
  | 'structural'
  | 'waste'
  | 'traffic'
  | 'fire';

export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';

export type HazardStatus = 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved';

export interface BoundingBox {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  label: string;
}

export interface PriorityFactors {
  severityWeight: number;    // 0-40 pts
  trafficImpact: number;     // 0-20 pts
  vulnerableZone: number;    // 0-20 pts
  crowdConfirmation: number; // 0-10 pts
  timeDecay: number;         // 0-10 pts
}

export interface HazardReport {
  id: string;
  title: string;
  description: string;
  category: HazardCategory;
  severity: HazardSeverity;
  status: HazardStatus;
  location: {
    address: string;
    lat: number;
    lng: number;
    district: string;
    nearSchoolOrHospital?: boolean;
    majorThoroughfare?: boolean;
  };
  imageUrl: string;
  resolvedImageUrl?: string;
  aiClassification: {
    categoryDetected: string;
    confidence: number;
    suggestedSeverity: HazardSeverity;
    boundingBox?: BoundingBox;
    identifiedAttributes: string[];
    department: string;
    impactReason: string;
  };
  priorityScore: number;
  priorityFactors: PriorityFactors;
  reportedAt: string;
  resolvedAt?: string;
  reportedBy: string;
  isAnonymous: boolean;
  upvotes: number;
  timeline: AuditTimelineEvent[];
  comments: Comment[];
  assignedUnit?: string;
}
```

---

## 4. Technical Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CivicSense Platform                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────┐           ┌──────────────────────────────┐
│       Frontend (SPA)        │           │     Backend Server (Node)    │
│  • React 19 + TypeScript    │           │  • Express API Proxy         │
│  • Tailwind CSS v4          │◄─────────►│  • /api/analyze-hazard       │
│  • @vis.gl/react-google-maps│           │  • Gemini 2.5 Flash Vision   │
│  • Lucide React Icons       │           │  • In-Memory Hazard Registry │
└─────────────────────────────┘           └──────────────────────────────┘
           │                                                 │
           ▼                                                 ▼
┌─────────────────────────────┐           ┌──────────────────────────────┐
│        State Management     │           │       External Services      │
│  • CivicContext (React)     │           │  • Google Maps Platform API  │
│  • 12 Pre-Seeded Incidents  │           │  • AdvancedMarker & Quota    │
│  • LocalStorage Persistence │           │  • Municipal Dispatch Units  │
└─────────────────────────────┘           └──────────────────────────────┘
```

---

## 5. Verification & Compilation Status

- **Build Engine**: Vite + TypeScript (`tsc --noEmit`).
- **Server Entrypoint**: Express running on port 3000 via `server.ts`.
- **Map SDK**: `@vis.gl/react-google-maps` with Google Maps Demo Key and in-app quota monitoring listener.
- **Verification Tests**: Passed clean `compile_applet` and `lint_applet` with zero syntax or typing errors.
