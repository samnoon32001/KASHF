import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-white shadow-xl border border-amber-500/30 animate-pulse"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div>
        <span className="font-semibold text-amber-300">Offline Mode</span>
        <span className="text-slate-300 ml-1">Cached application data is available. Actions will sync upon reconnect.</span>
      </div>
    </div>
  );
};
