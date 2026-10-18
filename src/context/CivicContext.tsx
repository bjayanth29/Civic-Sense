import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  HazardReport,
  HazardStatus,
  HazardCategory,
  HazardSeverity,
  UserProfile,
  CivicNotification,
  ViewType
} from '../types';
import { INITIAL_HAZARDS } from '../data/mockHazards';

interface CivicContextType {
  hazards: HazardReport[];
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedHazard: HazardReport | null;
  setSelectedHazard: (hazard: HazardReport | null) => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isAuthorityMode: boolean;
  setIsAuthorityMode: (val: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  notifications: CivicNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addHazard: (newHazard: Omit<HazardReport, 'id' | 'reportedAt' | 'updatedAt' | 'upvotes' | 'confirmations' | 'comments' | 'timeline'>) => HazardReport;
  upvoteHazard: (hazardId: string) => void;
  addConfirmation: (hazardId: string, note?: string, photoUrl?: string) => void;
  addComment: (hazardId: string, text: string) => void;
  updateHazardStatus: (hazardId: string, newStatus: HazardStatus, note?: string, assignedTeam?: string, resolvedPhoto?: string) => void;
  toggleSaveHazard: (hazardId: string) => void;
  isSavedHazard: (hazardId: string) => boolean;
  mergeDuplicateHazard: (primaryHazardId: string, duplicateReportTitle: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: HazardCategory | 'all';
  setCategoryFilter: (cat: HazardCategory | 'all') => void;
  severityFilter: HazardSeverity | 'all';
  setSeverityFilter: (sev: HazardSeverity | 'all') => void;
  statusFilter: HazardStatus | 'all';
  setStatusFilter: (status: HazardStatus | 'all') => void;
  resetAllData: () => void;
  toasts: Array<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }>;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_CITIZEN_USER: UserProfile = {
  id: 'usr-current',
  name: 'Jane Chen',
  email: 'jane.chen@community.org',
  role: 'citizen',
  badge: 'Civic Guardian Lv. 4',
  impactScore: 680,
  reportsSubmitted: 6,
  confirmationsGiven: 28,
  verifiedFixes: 19,
  savedHazardIds: ['HAZ-2026-8941', 'HAZ-2026-8942'],
  anonymizeByDefault: false
};

const DEFAULT_NOTIFICATIONS: CivicNotification[] = [
  {
    id: 'notif-1',
    type: 'assigned',
    hazardId: 'HAZ-2026-8941',
    hazardTitle: 'High-Impact Asphalt Pothole on Market St',
    message: 'DPW Rapid Asphalt Crew #3 has been dispatched to your report.',
    timestamp: '2026-10-05T06:35:00Z',
    read: false
  },
  {
    id: 'notif-2',
    type: 'confirmation',
    hazardId: 'HAZ-2026-8942',
    hazardTitle: 'Fallen Tree Limb on Haight St',
    message: '42 neighbors verified and confirmed this hazard.',
    timestamp: '2026-10-05T07:15:00Z',
    read: false
  },
  {
    id: 'notif-3',
    type: 'resolution',
    hazardId: 'HAZ-2026-8930',
    hazardTitle: 'Severe Sunken Pothole on Geary Blvd',
    message: 'Paving completed and verified by municipal QA inspection.',
    timestamp: '2026-10-04T15:40:00Z',
    read: true
  }
];

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hazards, setHazards] = useState<HazardReport[]>(() => {
    try {
      const stored = localStorage.getItem('civicsense_hazards_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read hazards from localStorage:', e);
    }
    return INITIAL_HAZARDS;
  });

  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [selectedHazard, setSelectedHazard] = useState<HazardReport | null>(null);
  const [isAuthorityMode, setIsAuthorityMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('civicsense_dark_mode');
      if (stored !== null) return stored === 'true';
    } catch (e) {}
    return true; // Default to signature dark navy palette for CivicSense
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('civicsense_user_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_CITIZEN_USER;
  });

  const [notifications, setNotifications] = useState<CivicNotification[]>(() => {
    try {
      const stored = localStorage.getItem('civicsense_notifs_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_NOTIFICATIONS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<HazardCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<HazardSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<HazardStatus | 'all'>('all');

  const [toasts, setToasts] = useState<
    Array<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }>
  >([]);

  useEffect(() => {
    try {
      localStorage.setItem('civicsense_hazards_v1', JSON.stringify(hazards));
    } catch (e) {}
  }, [hazards]);

  useEffect(() => {
    try {
      localStorage.setItem('civicsense_user_v1', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('civicsense_notifs_v1', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('civicsense_dark_mode', String(isDarkMode));
    } catch (e) {}
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addHazard = (
    newHazardData: Omit<
      HazardReport,
      'id' | 'reportedAt' | 'updatedAt' | 'upvotes' | 'confirmations' | 'comments' | 'timeline'
    >
  ): HazardReport => {
    const newId = `HAZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const createdHazard: HazardReport = {
      ...newHazardData,
      id: newId,
      reportedAt: now,
      updatedAt: now,
      upvotes: 1,
      confirmations: [
        {
          id: `conf-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: now,
          note: 'Initial report verification.'
        }
      ],
      comments: [],
      timeline: [
        {
          status: 'reported',
          timestamp: now,
          label: 'Citizen Report Filed',
          note: `Reported with AI vision analysis (${Math.round(newHazardData.aiAnalysis.confidence * 100)}% confidence).`,
          actor: newHazardData.reporter.isAnonymous ? 'Anonymous Citizen' : currentUser.name
        },
        {
          status: 'verified',
          timestamp: now,
          label: 'Automated AI Pre-Screen',
          note: `Classified as ${newHazardData.severity.toUpperCase()} severity. Routed to ${newHazardData.aiAnalysis.department}.`,
          actor: 'CivicSense AI Engine'
        }
      ]
    };

    setHazards((prev) => [createdHazard, ...prev]);

    // Update user stats
    setCurrentUser((prev) => ({
      ...prev,
      reportsSubmitted: prev.reportsSubmitted + 1,
      impactScore: prev.impactScore + 50
    }));

    showToast('Hazard Reported Successfully', `Tracking ID: ${newId}. Routed to municipal queue.`, 'success');
    return createdHazard;
  };

  const upvoteHazard = (hazardId: string) => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          return {
            ...h,
            upvotes: h.upvotes + 1,
            priorityScore: Math.min(100, h.priorityScore + 2),
            updatedAt: new Date().toISOString()
          };
        }
        return h;
      })
    );

    // Update selected hazard if active
    if (selectedHazard && selectedHazard.id === hazardId) {
      setSelectedHazard((prev) =>
        prev
          ? {
              ...prev,
              upvotes: prev.upvotes + 1,
              priorityScore: Math.min(100, prev.priorityScore + 2)
            }
          : null
      );
    }

    setCurrentUser((prev) => ({
      ...prev,
      confirmationsGiven: prev.confirmationsGiven + 1,
      impactScore: prev.impactScore + 10
    }));

    showToast('Community Upvote Recorded', 'Increased priority score for municipal crews.', 'info');
  };

  const addConfirmation = (hazardId: string, note?: string, photoUrl?: string) => {
    const newConf = {
      id: `conf-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      note: note || 'Confirmed this hazard condition in person.',
      photoUrl
    };

    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          const updated = {
            ...h,
            confirmations: [newConf, ...h.confirmations],
            upvotes: h.upvotes + 1,
            priorityScore: Math.min(100, h.priorityScore + 3),
            updatedAt: new Date().toISOString()
          };
          if (selectedHazard && selectedHazard.id === hazardId) {
            setSelectedHazard(updated);
          }
          return updated;
        }
        return h;
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      confirmationsGiven: prev.confirmationsGiven + 1,
      impactScore: prev.impactScore + 25
    }));

    showToast('Verification Logged', 'Your on-site evidence strengthens dispatch urgency.', 'success');
  };

  const addComment = (hazardId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: `comm-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: isAuthorityMode ? 'authority' : 'citizen',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          const updated = {
            ...h,
            comments: [...h.comments, newComment],
            updatedAt: new Date().toISOString()
          };
          if (selectedHazard && selectedHazard.id === hazardId) {
            setSelectedHazard(updated);
          }
          return updated;
        }
        return h;
      })
    );
  };

  const updateHazardStatus = (
    hazardId: string,
    newStatus: HazardStatus,
    note?: string,
    assignedTeam?: string,
    resolvedPhoto?: string
  ) => {
    const now = new Date().toISOString();

    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          const statusLabels: Record<HazardStatus, string> = {
            reported: 'Report Logged',
            verified: 'Condition Verified',
            assigned: 'Dispatched to Crew',
            in_progress: 'Repairs Active on Site',
            resolved: 'Hazard Resolved & Inspected'
          };

          const newTimelineEvent = {
            status: newStatus,
            timestamp: now,
            label: statusLabels[newStatus],
            note: note || `Status progressed to ${newStatus.replace('_', ' ')}.`,
            actor: isAuthorityMode ? `${currentUser.name} (City Dispatch)` : 'Municipal Authority'
          };

          const updated: HazardReport = {
            ...h,
            status: newStatus,
            updatedAt: now,
            timeline: [...h.timeline, newTimelineEvent],
            ...(assignedTeam
              ? {
                  assignedTo: {
                    team: assignedTeam,
                    department: h.aiAnalysis.department,
                    dispatchedAt: now,
                    etaHours: 2
                  }
                }
              : {}),
            ...(newStatus === 'resolved'
              ? {
                  resolvedAt: now,
                  resolutionNote: note || 'Repairs completed and signed off.',
                  resolvedImageUrl: resolvedPhoto || '/src/assets/images/hazard_resolved_fix_1791218482910.jpg',
                  priorityScore: 0
                }
              : {})
          };

          if (selectedHazard && selectedHazard.id === hazardId) {
            setSelectedHazard(updated);
          }
          return updated;
        }
        return h;
      })
    );

    // Notify user
    const targetHazard = hazards.find((h) => h.id === hazardId);
    if (targetHazard) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: newStatus === 'resolved' ? 'resolution' : 'status_change',
          hazardId,
          hazardTitle: targetHazard.title,
          message: `Hazard status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`,
          timestamp: now,
          read: false
        },
        ...prev
      ]);
    }

    showToast('Status Updated', `Report ${hazardId} is now marked ${newStatus.replace('_', ' ')}.`, 'info');
  };

  const toggleSaveHazard = (hazardId: string) => {
    setCurrentUser((prev) => {
      const isSaved = prev.savedHazardIds.includes(hazardId);
      const newSaved = isSaved
        ? prev.savedHazardIds.filter((id) => id !== hazardId)
        : [...prev.savedHazardIds, hazardId];
      return { ...prev, savedHazardIds: newSaved };
    });
  };

  const isSavedHazard = (hazardId: string) => currentUser.savedHazardIds.includes(hazardId);

  const mergeDuplicateHazard = (primaryHazardId: string, duplicateReportTitle: string) => {
    upvoteHazard(primaryHazardId);
    addComment(
      primaryHazardId,
      `[Duplicate Merged]: Citizen duplicate submission merged into this primary ticket: "${duplicateReportTitle}". Upvote added.`
    );
    showToast('Duplicate Merged', `Merged into primary ticket ${primaryHazardId} with +1 upvote.`, 'success');
  };

  const resetAllData = () => {
    localStorage.removeItem('civicsense_hazards_v1');
    localStorage.removeItem('civicsense_notifs_v1');
    setHazards(INITIAL_HAZARDS);
    setNotifications(DEFAULT_NOTIFICATIONS);
    showToast('Data Reset', 'Restored pristine demonstration hazards data.', 'info');
  };

  return (
    <CivicContext.Provider
      value={{
        hazards,
        currentView,
        setCurrentView,
        selectedHazard,
        setSelectedHazard,
        currentUser,
        setCurrentUser,
        isAuthorityMode,
        setIsAuthorityMode,
        isDarkMode,
        toggleDarkMode,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addHazard,
        upvoteHazard,
        addConfirmation,
        addComment,
        updateHazardStatus,
        toggleSaveHazard,
        isSavedHazard,
        mergeDuplicateHazard,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        severityFilter,
        setSeverityFilter,
        statusFilter,
        setStatusFilter,
        resetAllData,
        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = () => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
