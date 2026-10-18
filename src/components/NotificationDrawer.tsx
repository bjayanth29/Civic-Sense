import React from 'react';
import { useCivic } from '../context/CivicContext';
import { Bell, CheckCheck, Clock, ExternalLink, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    hazards,
    setSelectedHazard,
    setCurrentView
  } = useCivic();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    const target = hazards.find((h) => h.id === notif.hazardId);
    if (target) {
      setSelectedHazard(target);
    } else {
      setCurrentView('explore');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-800 dark:text-slate-100" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Civic Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition-colors px-2 py-1 rounded"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No notifications right now
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You will be notified when your reported hazards are verified, assigned, or resolved.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl cursor-pointer transition-colors ${
                  notif.read
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                    {notif.hazardId}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {notif.hazardTitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {notif.message}
                </p>
                <div className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 mt-2 font-medium">
                  <span>View Incident</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
