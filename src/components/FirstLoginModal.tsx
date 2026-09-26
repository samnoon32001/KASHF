import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Circle, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FirstLoginModal: React.FC = () => {
  const {
    showFirstLoginModal,
    updateInitialPassword,
    settings,
    updateSettings,
    setActiveTab,
    users,
    roles,
    courses,
    subjects,
  } = useApp();

  const [step, setStep] = useState<'password' | 'checklist'>('password');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!showFirstLoginModal) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword === 'ChangeMe@2026!') {
      setError('Please choose a new unique password different from the initial default.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    updateInitialPassword(newPassword);
    setStep('checklist');
  };

  const checklistItems = [
    {
      id: 'profile',
      title: 'Institutional Profile & Brand Setup',
      desc: 'Set institute name, colors, contact details and branding.',
      completed: !!settings.institutionName,
      action: () => setActiveTab('settings'),
    },
    {
      id: 'staff',
      title: 'Add Faculty and Staff Members',
      desc: 'Onboard academic and administrative team members.',
      completed: users.some((u) => u.role === 'faculty'),
      action: () => setActiveTab('users'),
    },
    {
      id: 'roles',
      title: 'Configure Roles & Permissions (RBAC)',
      desc: 'Define custom access levels or audit system permissions.',
      completed: roles.length > 5,
      action: () => setActiveTab('roles'),
    },
    {
      id: 'courses',
      title: 'Create First Course & Syllabus',
      desc: 'Set up curriculum, schedule duration, and categories.',
      completed: courses.length > 0,
      action: () => setActiveTab('courses'),
    },
    {
      id: 'subjects',
      title: 'Assign Subjects to Faculty',
      desc: 'Link specialized modules to designated educators.',
      completed: subjects.length > 0,
      action: () => setActiveTab('courses'),
    },
    {
      id: 'students',
      title: 'Enroll Students or Import Roster',
      desc: 'Add enrolled learners or import student spreadsheets.',
      completed: users.some((u) => u.role === 'student'),
      action: () => setActiveTab('students'),
    },
    {
      id: 'integrations',
      title: 'Verify Google Meet & Meta Lead Ads',
      desc: 'Enable instant Google Meet classrooms and CRM leads.',
      completed: settings.googleMeetEnabled,
      action: () => setActiveTab('settings'),
    },
  ];

  const allDone = checklistItems.every((item) => item.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {step === 'password' ? (
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#117B78]/10 text-[#117B78] mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Security Setup: Change Default Password
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              As Super Administrator, you are logging in with the initial default credentials
              (<span className="font-mono text-slate-700 font-semibold">ChangeMe@2026!</span>). For institutional security, please set a new personal password to continue.
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Secure Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="new-password-input"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#117B78] focus:ring-2 focus:ring-[#117B78]/15 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="confirm-password-input"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#117B78] focus:ring-2 focus:ring-[#117B78]/15 outline-none"
                  />
                </div>
              </div>

              <button
                id="submit-new-password-btn"
                type="submit"
                className="w-full mt-2 h-11 rounded-xl bg-[#117B78] font-bold text-xs text-white shadow-md hover:bg-[#0D9C88] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Save Password & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Welcome to your Institution Portal
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Complete the setup checklist below to personalize and activate all institutional modules.
            </p>

            <div className="mt-5 space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-[#117B78]/40 hover:bg-[#117B78]/5 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 mt-0.5 shrink-0 group-hover:text-[#117B78]" />
                    )}
                    <div>
                      <p className={`text-xs font-bold ${item.completed ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#117B78] opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                    Open →
                  </span>
                </div>
              ))}
            </div>

            <button
              id="finish-setup-checklist-btn"
              onClick={() => {
                updateSettings({ setupChecklistCompleted: true });
                updateInitialPassword(newPassword || 'Updated@2026!');
              }}
              className="w-full mt-6 h-11 rounded-xl bg-[#117B78] font-bold text-xs text-white shadow-md hover:bg-[#0D9C88] transition cursor-pointer"
            >
              Enter Institutional Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
