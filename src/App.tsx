import React, { useState } from 'react';
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

import {
  GraduationCap,
  ShieldCheck,
  LogIn,
  Sparkles,
  WifiOff,
  UserCheck,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { RoleType } from './types';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    activeTab,
    loginWithGoogle,
    switchRole,
    isOffline,
  } = useApp();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Login view if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo & Branding */}
          <div className="flex items-center justify-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#117B78] to-[#0D9C88] text-white shadow-xl font-black text-2xl tracking-wider">
              K
            </div>
            <div>
              <h1 className="text-2xl tracking-tight text-slate-900 leading-tight">
                <strong className="font-extrabold text-slate-950">Kashf</strong>
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                Institute of Islamic Excellence
              </p>
            </div>
          </div>

          <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900">
            Sign in to your Institutional Account
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            Secure Role-Based Access for Students, Faculty, Administration & Marketing
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
            {/* Google Sign In Button */}
            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.9.2-1.7.4-2.4L1.6 7.1C.6 9.1 0 11.4 0 14s.6 4.9 1.6 6.9l3.7-2.9c0-.4-.2-.9-.2-1.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"
                />
              </svg>
              <span>Continue with Google (Firebase Auth)</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold">
                  Or instant demo role sign-in
                </span>
              </div>
            </div>

            {/* Demo Quick Sign-in Grid */}
            <div className="space-y-2">
              {[
                { role: 'super_admin' as RoleType, label: 'Super Admin', desc: 'Root institution control' },
                { role: 'faculty' as RoleType, label: 'Faculty / Professor', desc: 'Classes, attendance, grading' },
                { role: 'student' as RoleType, label: 'Enrolled Student', desc: 'Lectures, assignments, rewards' },
                { role: 'telecaller' as RoleType, label: 'Telecaller / CRM', desc: 'Meta lead ads & calls' },
                { role: 'creative_head' as RoleType, label: 'Creative Head', desc: 'Media & campaign workflow' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-[#117B78] hover:bg-[#117B78]/5 transition text-left cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#117B78]">
                      Sign in as {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#117B78] transition" />
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Encrypted with Firebase Auth & Cloud Firestore RBAC Security Rules
              </p>
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
        return <UsersView />;
      case 'courses':
        return <CoursesView />;
      case 'classes':
        return <ClassesView />;
      case 'recordings':
        return <RecordedClassesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'tasks':
        return <TasksView />;
      case 'creative':
        return <CreativeTasksView />;
      case 'media':
        return <MediaLibraryView />;
      case 'leads':
        return <LeadsCRMView />;
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
