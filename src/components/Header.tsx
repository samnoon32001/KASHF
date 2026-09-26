import React, { useState } from 'react';
import {
  Bell,
  Search,
  Menu,
  Shield,
  User,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { UserRole } from '../types';

export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    activeRole,
    settings,
    unreadNotificationCount,
    setGlobalSearchQuery,
    switchRolePreview,
    handleLogout,
    setActiveTab,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    director: { label: 'Director', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    academic_coordinator: { label: 'Academic Coord.', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    faculty: { label: 'Faculty', color: 'bg-sky-100 text-sky-800 border-sky-300' },
    creative_head: { label: 'Creative Head', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    telecaller: { label: 'Telecaller CRM', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    student: { label: 'Student Portal', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  };

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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#117B78] to-[#0D9C88] text-white shadow-sm font-black text-lg tracking-wider">
            K
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-base tracking-tight text-slate-900 leading-none">
              <strong className="font-extrabold text-slate-950">Kashf</strong>{' '}
              <span className="font-medium text-slate-700">Institute of Islamic Excellence</span>
            </h1>
            <p className="text-[11px] font-semibold text-[#117B78] mt-0.5">
              Portal & LMS
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search students, faculty, courses, leads, tasks..."
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#117B78] focus:outline-none focus:ring-2 focus:ring-[#117B78]/15 transition"
          />
        </div>
      </div>

      {/* Right: Role Previewer, PWA Install, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <button
            id="role-preview-selector-btn"
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-xs cursor-pointer transition hover:opacity-90 ${
              roleLabels[activeRole]?.color || 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
            title="Switch demo role to preview different dashboards"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{roleLabels[activeRole]?.label}</span>
            <span className="sm:hidden font-mono">{activeRole.slice(0, 3).toUpperCase()}</span>
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Switch Preview Role</p>
                <p className="text-[11px] text-slate-500">Test different user experiences</p>
              </div>
              <div className="py-1 space-y-0.5">
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRolePreview(role);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                      activeRole === role
                        ? 'bg-[#117B78]/10 text-[#117B78] font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{roleLabels[role].label}</span>
                    {activeRole === role && <span className="h-2 w-2 rounded-full bg-[#117B78]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PWA Install Button */}
        <div className="hidden sm:block">
          <PWAInstallButton compact={true} />
        </div>

        {/* Notification Bell */}
        <button
          id="notification-bell-btn"
          onClick={() => setActiveTab('notifications')}
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

        {/* User Profile Avatar / Dropdown */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl p-1 text-left hover:bg-slate-100 transition cursor-pointer"
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
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
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
                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[11px] font-semibold text-[#117B78]">
                  <span>Role: {roleLabels[activeRole]?.label}</span>
                </div>
              </div>

              <div className="py-1">
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
    </header>
  );
};
