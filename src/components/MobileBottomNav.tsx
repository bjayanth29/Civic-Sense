import React from 'react';
import { useCivic } from '../context/CivicContext';
import { Home, Map, PlusCircle, Compass, User, Shield } from 'lucide-react';
import { ViewType } from '../types';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, isAuthorityMode } = useCivic();

  const items: Array<{ id: ViewType; label: string; icon: React.ReactNode }> = [
    { id: 'landing', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'Map', icon: <Map className="w-5 h-5" /> },
    { id: 'report', label: 'Report', icon: <PlusCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-5 h-5" /> },
    isAuthorityMode
      ? { id: 'admin', label: 'Dispatch', icon: <Shield className="w-5 h-5 text-amber-500" /> }
      : { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060913]/80 backdrop-blur-xl border-t border-white/[0.08] shadow-lg shadow-black/40 px-2 py-2 flex items-center justify-around safe-area-bottom">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-white font-semibold bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/[0.08]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
