import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Menu,
  Shield,
  User,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { GlobalSearch } from './GlobalSearch';
import { UserRole } from '../types';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    activeRole,
    settings,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    setGlobalSearchQuery,
    handleLogout,
    setActiveTab,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    director: { label: 'Director', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    academic_coordinator: { label: 'Academic Coord.', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    faculty: { label: 'Faculty', color: 'bg-sky-100 text-sky-800 border-sky-300' },
    creative_head: { label: 'Creative Head', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    telecaller: { label: 'Telecaller CRM', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    student: { label: 'Student', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  };

  const currentRoleInfo = roleLabels[activeRole] || { label: 'User', color: 'bg-slate-100 text-slate-800 border-slate-200' };

  const appDisplayName = settings.appName || settings.institutionName || 'Kashf Institute of Islamic Excellence';

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md transition-all shadow-xs"
    >
      {/* Left: Mobile Menu Toggle & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-9 w-9 object-contain rounded-xl"
              onError={(e) => {
                // fallback
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#117B78] to-[#0D9C88] text-white shadow-sm font-black text-lg tracking-wider shrink-0">
              {appDisplayName.charAt(0) || 'K'}
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-base tracking-tight text-slate-900 leading-none truncate max-w-xs md:max-w-md font-bold">
              {appDisplayName}
            </h1>
            <p className="text-[11px] font-semibold text-[#117B78] mt-0.5">
              Portal & Management System
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Global Search Input (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-lg mx-6">
        <GlobalSearch />
      </div>

      {/* Right: PWA Install, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open global search"
          title="Search students, courses, tasks, CRM leads"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* PWA Install Button */}
        <div className="hidden sm:block">
          <PWAInstallButton compact={true} />
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span
                id="unread-notification-badge"
                className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs"
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <p className="text-[11px] text-slate-500">{unreadNotificationCount} unread alerts</p>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-bold text-[#117B78] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                {notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      n.read
                        ? 'border-slate-100 bg-slate-50/50 text-slate-600'
                        : 'border-[#117B78]/20 bg-[#117B78]/5 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-[#117B78]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No new notifications
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
                >
                  View All Notifications Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar / Dropdown (With Outside Click auto-close) */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl p-1 text-left hover:bg-slate-100 transition cursor-pointer"
            aria-expanded={showUserMenu}
          >
            {currentUser?.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-[#117B78]/20"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#117B78] text-xs font-bold text-white shadow-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] font-medium text-slate-500 capitalize leading-none">
                {currentUser?.role?.replace('_', ' ') || 'Role'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || currentUser?.username}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[11px] font-semibold text-[#117B78]">
                  <span>Role: {currentRoleInfo.label}</span>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  id="menu-settings-btn"
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>

                <button
                  id="menu-logout-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Global Search Modal Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/50 backdrop-blur-xs p-4 md:hidden animate-in fade-in">
          <div className="w-full bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">Global Search</span>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <GlobalSearch
              isMobileModal={true}
              onCloseMobileModal={() => setShowMobileSearch(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};
