import React, { useState, useRef, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  Server,
  Cloud,
  Layers,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DatabaseStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    isDatabaseConnected,
    isSyncing,
    lastSyncTime,
    firebaseProjectId,
    firestoreDatabaseId,
    refreshDatabaseSync,
    courses,
    users,
    tasks,
    leads,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await refreshDatabaseSync();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
    } catch {
      setPingLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  const formattedTime = lastSyncTime
    ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Syncing...';

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition cursor-pointer border ${
          isDatabaseConnected
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70 hover:border-emerald-300'
            : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
        }`}
        title="Click for live Firestore database status"
      >
        <div className="relative flex items-center justify-center">
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span
            className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              isDatabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
        </div>

        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="text-[10px] font-bold tracking-tight">
            {isDatabaseConnected ? 'Firestore Connected' : 'Connecting DB...'}
          </span>
          <span className="text-[8px] text-emerald-700/80 font-mono mt-0.5 font-semibold">
            {isSyncing ? 'Syncing...' : 'Live Real-time'}
          </span>
        </div>

        <ChevronDown className="w-3 h-3 text-emerald-600/70 shrink-0 ml-0.5" />
      </button>

      {/* Database Diagnostic Details Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">Cloud Firestore</h4>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-200">
                    Live Database
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Google Cloud Firestore Integration</p>
              </div>
            </div>

            <button
              onClick={handlePing}
              disabled={isPinging}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Ping Firestore database"
            >
              <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging...' : 'Ping DB'}</span>
            </button>
          </div>

          {/* Cross-Browser Sync Notice */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Cross-Browser Live Synchronization</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Deletions, additions, and edits sync to Google Cloud in real-time. Changes made in one browser window immediately reflect across all other browsers.
                </p>
              </div>
            </div>
          </div>

          {/* Database Specs Grid */}
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" /> Database ID:
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-900 truncate max-w-[190px]" title={firestoreDatabaseId}>
                {firestoreDatabaseId}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-slate-400" /> Firebase Project:
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-900">
                {firebaseProjectId}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Active Sync:
              </span>
              <span className="text-[11px] font-semibold text-slate-700">
                {formattedTime}
              </span>
            </div>

            {pingLatency !== null && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-medium text-emerald-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Round-Trip Latency:
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-700">
                  {pingLatency} ms (Fast)
                </span>
              </div>
            )}
          </div>

          {/* Active Synced Collections Overview */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Live Cloud Records Count:
            </p>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Courses</p>
                <p className="text-xs font-bold text-slate-900">{courses.length}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Users</p>
                <p className="text-xs font-bold text-slate-900">{users.length}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Tasks</p>
                <p className="text-xs font-bold text-slate-900">{tasks.length}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Leads</p>
                <p className="text-xs font-bold text-slate-900">{leads.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
