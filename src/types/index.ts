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
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  confidence: number;
}

export interface AIAnalysisResult {
  confidence: number;
  categoryDetected: string;
  severityDetected: HazardSeverity;
  impactReason: string;
  department: string;
  detectedHazards: string[];
  boundingBoxes: BoundingBox[];
}

export interface HazardLocation {
  lat: number;
  lng: number;
  address: string;
  district: string;
  crossStreet?: string;
}

export interface Confirmation {
  id: string;
  userId: string;
  userName: string;
  userBadge?: string;
  timestamp: string;
  note?: string;
  photoUrl?: string;
}

export interface HazardComment {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  text: string;
  timestamp: string;
}

export interface TimelineEvent {
  status: HazardStatus;
  timestamp: string;
  label: string;
  note: string;
  actor: string;
}

export interface HazardReport {
  id: string;
  title: string;
  description: string;
  category: HazardCategory;
  severity: HazardSeverity;
  status: HazardStatus;
  location: HazardLocation;
  imageUrl: string;
  resolvedImageUrl?: string;
  aiAnalysis: AIAnalysisResult;
  reportedAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    isAnonymous: boolean;
    badge: string;
  };
  assignedTo?: {
    team: string;
    department: string;
    dispatchedAt: string;
    etaHours?: number;
  };
  upvotes: number;
  confirmations: Confirmation[];
  comments: HazardComment[];
  timeline: TimelineEvent[];
  priorityScore: number;
  trafficImpact: 'low' | 'medium' | 'high';
  isSchoolZone: boolean;
  resolutionNote?: string;
  resolvedAt?: string;
  mergedWithId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'authority';
  badge: string;
  impactScore: number;
  reportsSubmitted: number;
  confirmationsGiven: number;
  verifiedFixes: number;
  savedHazardIds: string[];
  anonymizeByDefault: boolean;
  crewDepartment?: string;
}

export interface CivicNotification {
  id: string;
  type: 'status_change' | 'confirmation' | 'resolution' | 'assigned';
  hazardId: string;
  hazardTitle: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type ViewType =
  | 'landing'
  | 'report'
  | 'map'
  | 'explore'
  | 'priority'
  | 'analytics'
  | 'profile'
  | 'admin';

export interface GemmaClassificationResult {
  category:
    | 'pothole'
    | 'garbage'
    | 'water leakage'
    | 'drainage'
    | 'broken streetlight'
    | 'damaged road'
    | 'traffic hazard'
    | 'illegal dumping'
    | 'public infrastructure damage'
    | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  reasoning: string;
  recommendedDepartment: string;
  recommendedAction: string;
  urgencyScore: number;
  requiresHumanReview: boolean;
  detectedLanguage: string;
  confidence: number;
  sourceModel: string;
}
