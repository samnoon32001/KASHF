import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Bell,
  Key,
  Database,
  CheckCircle2,
  Lock,
  Save,
  Globe,
  Mail,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../data/permissions';

export const SettingsView: React.FC<{ initialTab?: 'general' | 'roles' | 'integrations' | 'notifications' }> = ({ initialTab = 'general' }) => {
  const { currentUser, activeRole, can, settings, updateSettings } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'integrations' | 'notifications'>(initialTab);

  // Institution profile & branding form state
  const [appName, setAppName] = useState(settings.appName || 'Kashf Institute of Islamic Excellence');
  const [institutionName, setInstitutionName] = useState(settings.institutionName || 'Kashf Institute of Islamic Excellence');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || '');
  const [tagline, setTagline] = useState(settings.tagline || 'Fostering academic rigor, moral character, and Islamic scholarship');
  const [institutionCode, setInstitutionCode] = useState('KASHF-2026');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'administration@kashf.edu');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '+1 (555) 328-9000');
  const [address, setAddress] = useState(settings.address || 'Kashf Campus of Islamic Excellence');
  const [academicYear, setAcademicYear] = useState('2026 - 2027 Academic Session');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Selected role for inspecting permissions
  const [selectedRole, setSelectedRole] = useState<RoleType>('super_admin');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [geminiApiKey, setGeminiApiKey] = useState(
    () => localStorage.getItem('kashf_gemini_api_key') || ''
  );
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiSaved, setGeminiSaved] = useState(false);

  const handleSaveGeminiKey = () => {
    localStorage.setItem('kashf_gemini_api_key', geminiApiKey);
    setGeminiSaved(true);
    setTimeout(() => setGeminiSaved(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      appName,
      institutionName,
      logoUrl,
      faviconUrl,
      tagline,
      contactEmail,
      contactPhone,
      address,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const rolesList: { role: RoleType; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Complete root institutional control and security access' },
    { role: 'academic_coordinator', label: 'Academic Coordinator', desc: 'Curriculum, course management, and faculty allocations' },
    { role: 'faculty', label: 'Academic Faculty', desc: 'Teaching, grading, classroom sessions, and student attendance' },
    { role: 'student', label: 'Student', desc: 'Live classes, assignments, recordings, and rewards' },
    { role: 'creative_head', label: 'Creative Head', desc: 'Marketing campaigns, media library, and design production' },
    { role: 'telecaller', label: 'Admissions Telecaller', desc: 'Meta lead management, admissions follow-ups, and student enrollment' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Settings & Permissions Matrix
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure institutional credentials, granular role permissions, and third-party API webhooks.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'general'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institution Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Permissions</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'integrations'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API & Webhook Integrations</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Institutional configurations updated and synced to Firestore cloud.</span>
        </div>
      )}

      {/* 1. GENERAL & BRANDING TAB */}
      {activeTab === 'general' && (
        <div className="max-w-3xl space-y-6">
          {/* Branding Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">App Branding & Visual Identity</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize your App Name, Top/Sidebar Logo, and Browser Favicon Icon in real-time.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* App Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Application Display Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Kashf Institute of Islamic Excellence"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#117B78] focus:ring-2 focus:ring-[#117B78]/15"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This updates the header title, sidebar brand, and browser window title dynamically.
                </p>
              </div>

              {/* App Logo */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Application Logo URL
                  </label>
                  <span className="text-[11px] text-slate-400">Live Preview on Right</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... (or leave blank to use default emblem)"
                    className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-contain p-1" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#117B78] to-[#0D9C88] text-white flex items-center justify-center font-black text-sm">
                        {appName.charAt(0) || 'K'}
                      </div>
                    )}
                  </div>
                </div>
                {/* Logo Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Presets:</span>
                  {[
                    { label: 'Default Emblem', url: '' },
                    { label: 'Islamic Crest', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80' },
                    { label: 'Golden Calligraphy', url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=100&auto=format&fit=crop&q=80' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setLogoUrl(p.url)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:border-[#117B78] hover:text-[#117B78] transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favicon Icon */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Favicon Icon URL
                  </label>
                  <span className="text-[11px] text-slate-400">Browser Tab Icon</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="https://... favicon .ico, .png, or .svg"
                    className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden shrink-0">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon Preview" className="h-6 w-6 object-contain" />
                    ) : (
                      <div className="h-6 w-6 rounded bg-[#117B78] text-white flex items-center justify-center font-bold text-[10px]">
                        K
                      </div>
                    )}
                  </div>
                </div>
                {/* Favicon Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Presets:</span>
                  {[
                    { label: 'Emerald Badge', url: 'https://api.iconify.design/lucide:shield-check.svg?color=%23117B78' },
                    { label: 'Academic Cap', url: 'https://api.iconify.design/lucide:graduation-cap.svg?color=%23117B78' },
                    { label: 'Islamic Star', url: 'https://api.iconify.design/lucide:sparkles.svg?color=%23117B78' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFaviconUrl(p.url)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:border-[#117B78] hover:text-[#117B78] transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Institution Name
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#117B78] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Branding & Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ROLES & PERMISSIONS TAB */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Roles list */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              System Roles
            </h4>
            {rolesList.map((item) => {
              const isSelected = selectedRole === item.role;
              return (
                <div
                  key={item.role}
                  onClick={() => setSelectedRole(item.role)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#117B78]/10 border-[#117B78] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Granular Permission list for selected role */}
          <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 capitalize">
                  Permissions Matrix: {selectedRole.replace('_', ' ')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned granular access capabilities enforced client-side and via Firestore Rules.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {ROLE_DEFAULT_PERMISSIONS[selectedRole]?.length || 0} permissions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {ROLE_DEFAULT_PERMISSIONS[selectedRole]?.map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-mono text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. INTEGRATIONS TAB */}
      {activeTab === 'integrations' && (
        <div className="space-y-5 max-w-3xl">
          {/* Meta Lead Ads Webhook */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Meta Lead Ads Real-time Webhook URL
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste this endpoint into your Meta Graph App Webhooks settings (Leadgen topic).
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                readOnly
                value="https://educore-lms.app/api/webhooks/meta-lead-ads"
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono text-slate-700"
              />
              <button
                onClick={() =>
                  handleCopy('https://educore-lms.app/api/webhooks/meta-lead-ads', 'meta_webhook')
                }
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 h-10 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                {copiedKey === 'meta_webhook' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Google Workspace & Meet */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Google Meet & Drive API Credentials
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  OAuth Client ID for generating live Meet rooms and streaming Drive lecture recordings.
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Connected
              </span>
            </div>

            <div className="space-y-2">
              <input
                readOnly
                value="educore-gsuite-workspace.apps.googleusercontent.com"
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono text-slate-700"
              />
            </div>
          </div>

          {/* Google Gemini AI API Configuration */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Google Gemini AI API
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                      models/gemini-2.5-flash
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Powers institutional curriculum generation, student inquiry responses, and automated tasks.
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  geminiApiKey
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {geminiApiKey ? 'Configured' : 'Key Needed'}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Hostinger & Server API Key
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Get Free API Key from Google AI Studio
                </a>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-xs font-mono text-slate-800 focus:outline-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveGeminiKey}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 h-10 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  {geminiSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{geminiSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Hostinger Guide callout */}
              <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  How to configure in Hostinger:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 pl-1 text-[11px]">
                  <li>Generate your free API key at <strong className="text-slate-700">aistudio.google.com/app/apikey</strong></li>
                  <li>In Hostinger hPanel, go to <strong className="text-slate-700">Websites → Manage → Environment Variables</strong> (or edit your <strong className="text-slate-700">.env</strong> file)</li>
                  <li>Add variable name: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">GEMINI_API_KEY</code></li>
                  <li>Paste your key starting with <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">AIzaSy...</code> and save</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Firebase Database Config */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Firebase Firestore Cloud Storage</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Project: <span className="font-mono font-bold text-slate-800">astute-runway-96shk</span> (Region: us-central1)
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Provisioned
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Role-based security rules (RBAC) are actively deployed. Offline persistence automatically caches read/write transactions into browser indexedDB and synchronizes upon reconnect.
            </p>
          </div>
        </div>
      )}

      {/* 4. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs max-w-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Automated Institution Notifications</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Live Class Starting Alert</p>
                <p className="text-[11px] text-slate-500">
                  Notify students 15 minutes prior to scheduled Google Meet session.
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#117B78]" />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Low Attendance Warning (&lt;75%)</p>
                <p className="text-[11px] text-slate-500">
                  Automatic notice dispatched to students and academic coordinators.
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#117B78]" />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Task Submission Grade & Points</p>
                <p className="text-[11px] text-slate-500">
                  Real-time reward points notification upon faculty approval.
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#117B78]" />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Meta Lead Ad Instant Ping</p>
                <p className="text-[11px] text-slate-500">
                  Instant sound chime and push banner when a new prospect submits Facebook/Instagram form.
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#117B78]" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
