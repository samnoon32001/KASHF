import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNavigation } from './components/MobileNavigation';
import { FirstLoginModal } from './components/FirstLoginModal';

// Views
import { DashboardView } from './views/DashboardView';
import { UsersView } from './views/UsersView';
import { CoursesView } from './views/CoursesView';
import { ClassesView } from './views/ClassesView';
import { RecordedClassesView } from './views/RecordedClassesView';
import { AttendanceView } from './views/AttendanceView';
import { TasksView } from './views/TasksView';
import { CreativeTasksView } from './views/CreativeTasksView';
import { MediaLibraryView } from './views/MediaLibraryView';
import { LeadsCRMView } from './views/LeadsCRMView';
import { SettingsView } from './views/SettingsView';
import { NotificationsView } from './views/NotificationsView';

import {
  GraduationCap,
  ShieldCheck,
  LogIn,
  Sparkles,
  WifiOff,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { RoleType } from './types';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    activeTab,
    loginWithCredentials,
    settings,
    isOffline,
    isDatabaseConnected,
    firestoreDatabaseId,
  } = useApp();

  // Login form state
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('kashf_saved_username') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('kashf_saved_password') || '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('kashf_remember_me') === 'true';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setAuthError('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const success = await loginWithCredentials(identifier.trim(), password, rememberMe);
      if (!success) {
        setAuthError('Invalid credentials. Check your username/email or password.');
      } else {
        if (rememberMe) {
          localStorage.setItem('kashf_saved_username', identifier.trim());
          localStorage.setItem('kashf_saved_password', password);
          localStorage.setItem('kashf_remember_me', 'true');
        } else {
          localStorage.removeItem('kashf_saved_username');
          localStorage.removeItem('kashf_saved_password');
          localStorage.setItem('kashf_remember_me', 'false');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login view if not logged in
  if (!currentUser) {
    const appDisplayName = settings.appName || settings.institutionName || 'Kashf Institute of Islamic Excellence';

    return (
      <div className="min-h-screen bg-[#F8FAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo & Branding */}
          <div className="flex items-center justify-center gap-3.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="App Logo"
                className="h-14 w-14 object-contain rounded-2xl bg-white p-1 shadow-md border border-slate-200"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#117B78] to-[#0D9C88] text-white shadow-xl font-black text-2xl tracking-wider">
                {appDisplayName.charAt(0) || 'K'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {appDisplayName}
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                {settings.tagline || 'Institutional Excellence Portal'}
              </p>
            </div>
          </div>

          <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900">
            Sign in to your Account
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            Role-based access for Super Admin, Faculty, Coordinators, and Students
          </p>
        </div>

        <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100 space-y-6">
            {authError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{authError}</span>
              </div>
            )}

            {/* REAL USERNAME & PASSWORD FORM */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username or Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin or sarah_jenkins or student@kashf.edu"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78] focus:ring-2 focus:ring-[#117B78]/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78] focus:ring-2 focus:ring-[#117B78]/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#117B78] focus:ring-[#117B78]"
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    Save Password / Remember Me
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#117B78] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Database Connected Status */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-700">
                Cloud Firestore: {isDatabaseConnected ? 'Connected & Live' : 'Connecting...'}
              </span>
              <span className="font-mono text-[9px] text-slate-400">({firestoreDatabaseId.slice(0, 16)}...)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render view based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'users':
      case 'students':
        return <UsersView initialFilter={activeTab === 'students' ? 'student' : 'all'} />;
      case 'courses':
        return <CoursesView />;
      case 'classes':
        return <ClassesView />;
      case 'recordings':
        return <RecordedClassesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'tasks':
      case 'points':
        return <TasksView />;
      case 'creative':
        return <CreativeTasksView />;
      case 'media':
        return <MediaLibraryView />;
      case 'leads':
        return <LeadsCRMView />;
      case 'notifications':
        return <NotificationsView />;
      case 'roles':
        return <SettingsView initialTab="roles" />;
      case 'reports':
        return <AttendanceView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFA] flex">
      {/* Setup / Password change modal for first login */}
      <FirstLoginModal />

      {/* Desktop & Mobile Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Offline Banner if connectivity drops */}
        {isOffline && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>
              Offline Mode Active (PWA). All modifications are saved locally and will synchronize with Firestore once reconnected.
            </span>
          </div>
        )}

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {renderTabContent()}
        </main>

        {/* Mobile Bottom Bar */}
        <MobileNavigation />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
