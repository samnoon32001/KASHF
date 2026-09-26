import React, { useState, useMemo } from 'react';
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
  RefreshCw,
  Server,
  Cloud,
  Clock,
  Activity,
  Users,
  UserCheck,
  Search,
  Sliders,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, RoleDefinition, UserProfile } from '../types';
import { ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, DEFAULT_ROLE_DEFINITIONS, PermissionItem } from '../data/permissions';

export const SettingsView: React.FC<{ initialTab?: 'general' | 'roles' | 'database' | 'integrations' | 'notifications' }> = ({ initialTab = 'general' }) => {
  const {
    currentUser,
    activeRole,
    can,
    settings,
    updateSettings,
    roles,
    addRole,
    updateRole,
    deleteRole,
    users,
    updateUser,
    isDatabaseConnected,
    isSyncing,
    lastSyncTime,
    firebaseProjectId,
    firestoreDatabaseId,
    refreshDatabaseSync,
    courses,
    subjects,
    classes,
    recordedClasses,
    attendance,
    tasks,
    taskSubmissions,
    creativeTasks,
    media,
    leads,
    notifications,
    auditLogs,
    pointsHistory,
    logAudit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'database' | 'integrations' | 'notifications'>(initialTab);

  // Institution profile & branding form state
  const [appName, setAppName] = useState(settings.appName || 'Kashf Institute of Islamic Excellence');
  const [institutionName, setInstitutionName] = useState(settings.institutionName || 'Kashf Institute of Islamic Excellence');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || '');
  const [tagline, setTagline] = useState(settings.tagline || 'Fostering academic rigor, moral character, and Islamic scholarship');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'administration@kashf.edu');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '+1 (555) 328-9000');
  const [address, setAddress] = useState(settings.address || 'Kashf Campus of Islamic Excellence');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Roles & Permissions State
  const [permissionViewMode, setPermissionViewMode] = useState<'role' | 'user'>('role');
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('faculty');
  const [rolePermissionsDraft, setRolePermissionsDraft] = useState<Record<string, string[]>>({});
  const [permissionSearch, setPermissionSearch] = useState('');

  // Custom Role Creation Modal State
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleKey, setNewRoleKey] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleTemplate, setNewRoleTemplate] = useState<string>('faculty');

  // User-specific permission state
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userPermissionsDraft, setUserPermissionsDraft] = useState<Record<string, string[]>>({});

  // Database Tab Ping Test state
  const [isPingingDb, setIsPingingDb] = useState(false);
  const [dbLatency, setDbLatency] = useState<number | null>(null);

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

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
    showNotification('Institutional profile and branding updated and saved to Cloud Firestore.');
  };

  // Dynamic role list combining all roles in database
  const allRolesList = useMemo(() => {
    if (roles && roles.length > 0) {
      return roles.map((r) => ({
        role: r.roleKey,
        id: r.id,
        label: r.name,
        desc: r.description || `Configured ${r.name} access level and privileges`,
        isSystem: r.isSystem,
      }));
    }
    return DEFAULT_ROLE_DEFINITIONS.map((r) => ({
      role: r.roleKey,
      id: r.id,
      label: r.name,
      desc: r.description,
      isSystem: r.isSystem,
    }));
  }, [roles]);

  // Helper to get active permissions for a selected role
  const currentRoleActivePerms = useMemo(() => {
    if (rolePermissionsDraft[selectedRoleKey]) {
      return rolePermissionsDraft[selectedRoleKey];
    }
    const fromRolesState = roles.find((r) => r.roleKey === selectedRoleKey || r.id === selectedRoleKey);
    if (fromRolesState && fromRolesState.permissions) {
      return fromRolesState.permissions;
    }
    return ROLE_DEFAULT_PERMISSIONS[selectedRoleKey] || [];
  }, [selectedRoleKey, rolePermissionsDraft, roles]);

  // Helper to toggle a single permission for the selected role
  const handleToggleRolePermission = (permId: string) => {
    const current = currentRoleActivePerms;
    const exists = current.includes(permId);
    const updated = exists ? current.filter((p) => p !== permId) : [...current, permId];
    setRolePermissionsDraft((prev) => ({
      ...prev,
      [selectedRoleKey]: updated,
    }));
  };

  // Quick actions for role permissions
  const handleSelectAllRolePerms = () => {
    setRolePermissionsDraft((prev) => ({
      ...prev,
      [selectedRoleKey]: ALL_PERMISSIONS.map((p) => p.id),
    }));
  };

  const handleDeselectAllRolePerms = () => {
    setRolePermissionsDraft((prev) => ({
      ...prev,
      [selectedRoleKey]: [],
    }));
  };

  const handleResetRoleToDefault = () => {
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[selectedRoleKey] || [];
    setRolePermissionsDraft((prev) => ({
      ...prev,
      [selectedRoleKey]: defaultPerms,
    }));
    showNotification(`Reset role "${selectedRoleKey.replace('_', ' ')}" to default baseline permissions.`);
  };

  // Clone permissions from another role
  const handleCloneRolePermissions = (sourceRoleKey: string) => {
    if (!sourceRoleKey) return;
    const sourceRole = roles.find((r) => r.roleKey === sourceRoleKey || r.id === sourceRoleKey);
    const perms = sourceRole?.permissions || ROLE_DEFAULT_PERMISSIONS[sourceRoleKey] || [];
    setRolePermissionsDraft((prev) => ({
      ...prev,
      [selectedRoleKey]: perms,
    }));
    showNotification(`Cloned ${perms.length} permissions from role "${sourceRoleKey.replace('_', ' ')}". Click Save to apply.`);
  };

  // Create new custom role
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const key = newRoleKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') || ('custom_' + Date.now());
    const templatePerms = roles.find((r) => r.roleKey === newRoleTemplate)?.permissions || ROLE_DEFAULT_PERMISSIONS[newRoleTemplate] || [];

    addRole({
      roleKey: key,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || `Custom institutional role: ${newRoleName.trim()}`,
      permissions: templatePerms,
    });

    setSelectedRoleKey(key);
    setShowAddRoleModal(false);
    setNewRoleName('');
    setNewRoleKey('');
    setNewRoleDesc('');
    showNotification(`Custom role "${newRoleName.trim()}" created successfully and saved to Cloud Firestore!`);
  };

  // Delete custom role
  const handleDeleteRole = (roleItem: { id: string; role: string; label: string; isSystem?: boolean }) => {
    if (roleItem.isSystem) {
      alert('System-defined default roles cannot be deleted, but you can freely customize their permissions.');
      return;
    }
    if (confirm(`Are you sure you want to delete custom role "${roleItem.label}"?`)) {
      deleteRole(roleItem.id);
      setSelectedRoleKey('faculty');
      showNotification(`Custom role "${roleItem.label}" deleted.`);
    }
  };

  // Save role permissions to Cloud Firestore
  const handleSaveRolePermissions = () => {
    const permsToSave = currentRoleActivePerms;
    updateRole(selectedRoleKey, { permissions: permsToSave });
    logAudit('ROLE_PERMISSIONS_UPDATED', 'RBAC', `Updated permissions for role: ${selectedRoleKey} (${permsToSave.length} permissions)`);
    showNotification(`Successfully saved permissions for role "${selectedRoleKey.replace('_', ' ')}" to Cloud Firestore!`);
  };

  // USER PERMISSIONS MANAGEMENT
  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || users[0] || null;
  }, [users, selectedUserId]);

  const currentUserActivePerms = useMemo(() => {
    if (!selectedUser) return [];
    if (userPermissionsDraft[selectedUser.id]) {
      return userPermissionsDraft[selectedUser.id];
    }
    if (selectedUser.permissions && selectedUser.permissions.length > 0) {
      return selectedUser.permissions;
    }
    // Fall back to their role's permissions
    const roleDef = roles.find((r) => r.roleKey === selectedUser.role);
    return roleDef?.permissions || ROLE_DEFAULT_PERMISSIONS[selectedUser.role] || [];
  }, [selectedUser, userPermissionsDraft, roles]);

  const handleToggleUserPermission = (permId: string) => {
    if (!selectedUser) return;
    const current = currentUserActivePerms;
    const exists = current.includes(permId);
    const updated = exists ? current.filter((p) => p !== permId) : [...current, permId];
    setUserPermissionsDraft((prev) => ({
      ...prev,
      [selectedUser.id]: updated,
    }));
  };

  const handleSyncUserWithRole = () => {
    if (!selectedUser) return;
    const roleDef = roles.find((r) => r.roleKey === selectedUser.role);
    const defaultPerms = roleDef?.permissions || ROLE_DEFAULT_PERMISSIONS[selectedUser.role] || [];
    setUserPermissionsDraft((prev) => ({
      ...prev,
      [selectedUser.id]: defaultPerms,
    }));
    showNotification(`Synchronized ${selectedUser.name}'s permissions with ${selectedUser.role.replace('_', ' ')} default.`);
  };

  const handleGrantAllUserPerms = () => {
    if (!selectedUser) return;
    setUserPermissionsDraft((prev) => ({
      ...prev,
      [selectedUser.id]: ALL_PERMISSIONS.map((p) => p.id),
    }));
  };

  const handleRevokeAllUserPerms = () => {
    if (!selectedUser) return;
    setUserPermissionsDraft((prev) => ({
      ...prev,
      [selectedUser.id]: [],
    }));
  };

  const handleCloneUserPerms = (sourceUserId: string) => {
    if (!selectedUser || !sourceUserId) return;
    const sourceUser = users.find((u) => u.id === sourceUserId);
    if (!sourceUser) return;
    const perms =
      sourceUser.permissions && sourceUser.permissions.length > 0
        ? sourceUser.permissions
        : roles.find((r) => r.roleKey === sourceUser.role)?.permissions || ROLE_DEFAULT_PERMISSIONS[sourceUser.role] || [];

    setUserPermissionsDraft((prev) => ({
      ...prev,
      [selectedUser.id]: perms,
    }));
    showNotification(`Copied ${perms.length} permissions from ${sourceUser.name}. Click Save to apply.`);
  };

  const handleSaveUserPermissions = () => {
    if (!selectedUser) return;
    const permsToSave = currentUserActivePerms;
    updateUser(selectedUser.id, { permissions: permsToSave });
    logAudit('USER_PERMISSIONS_UPDATED', 'RBAC', `Updated permissions for user: ${selectedUser.name} (${selectedUser.email})`);
    showNotification(`Permissions for ${selectedUser.name} (${selectedUser.role}) updated and saved to Cloud Firestore!`);
  };

  // Grouped Permissions by Category
  const permissionCategories = useMemo(() => {
    const map = new Map<string, PermissionItem[]>();
    ALL_PERMISSIONS.forEach((p) => {
      const q = permissionSearch.trim().toLowerCase();
      if (q && !p.label.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return;
      }
      const existing = map.get(p.category) || [];
      existing.push(p);
      map.set(p.category, existing);
    });
    return Array.from(map.entries());
  }, [permissionSearch]);

  // Ping Firestore database latency benchmark
  const handleTestDatabasePing = async () => {
    setIsPingingDb(true);
    const start = performance.now();
    try {
      await refreshDatabaseSync();
      const end = performance.now();
      setDbLatency(Math.round(end - start));
      showNotification('Database round-trip ping completed successfully.');
    } catch {
      setDbLatency(null);
    } finally {
      setIsPingingDb(false);
    }
  };

  const filteredUsersForPicker = useMemo(() => {
    const q = userSearchTerm.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.admissionNumber && u.admissionNumber.toLowerCase().includes(q));

      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchTerm, userRoleFilter]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Settings & Permissions Matrix
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure institutional credentials, granular role & user permissions, and live Cloud Firestore database synchronization.
        </p>
      </div>

      {/* Cloud Database Connected Quick Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-50 border border-emerald-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-900">
                Cloud Firestore: {isDatabaseConnected ? 'Connected & Live' : 'Connecting to Cloud...'}
              </span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
                {firestoreDatabaseId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live multi-device database synchronization active across all 14 academic collections.
            </p>
          </div>
        </div>

        {activeTab !== 'database' && (
          <button
            onClick={() => setActiveTab('database')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition cursor-pointer self-start sm:self-center shrink-0 shadow-2xs"
          >
            <span>View Cloud Database Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
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
          <span>Roles & User Permissions</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'database'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Cloud Database (Firebase)</span>
          <span className="flex h-2 w-2 relative ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
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
          <span>API & Webhooks</span>
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
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage || 'Configurations updated and synced to Firestore cloud.'}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. GENERAL & BRANDING TAB */}
      {/* ======================================================== */}
      {activeTab === 'general' && (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">App Branding & Visual Identity</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize your App Name, Top/Sidebar Logo, and Browser Favicon Icon in real-time.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
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

      {/* ======================================================== */}
      {/* 2. ROLES & USER PERMISSIONS MATRIX (FULLY EDITABLE) */}
      {/* ======================================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Sub-navigation: Role-Level vs User-Level Permissions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Access Control & Permissions Editor</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full permission management for all institutional roles and individual user overrides.
              </p>
            </div>

            <div className="flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200/80 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setPermissionViewMode('role')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  permissionViewMode === 'role'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#117B78]" />
                <span>Edit All Roles ({allRolesList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPermissionViewMode('user')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  permissionViewMode === 'user'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#117B78]" />
                <span>Edit Individual Users ({users.length})</span>
              </button>
            </div>
          </div>

          {/* MODE A: EDIT BY ROLE */}
          {permissionViewMode === 'role' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Role Picker List */}
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select Role to Edit ({allRolesList.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddRoleModal(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#117B78] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Custom Role</span>
                  </button>
                </div>

                {allRolesList.map((item) => {
                  const isSelected = selectedRoleKey === item.role;
                  const roleDef = roles.find((r) => r.roleKey === item.role || r.id === item.role);
                  const permCount = (rolePermissionsDraft[item.role] || roleDef?.permissions || ROLE_DEFAULT_PERMISSIONS[item.role] || []).length;

                  return (
                    <div
                      key={item.role}
                      onClick={() => setSelectedRoleKey(item.role)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer relative group ${
                        isSelected
                          ? 'bg-[#117B78]/10 border-[#117B78] shadow-xs ring-1 ring-[#117B78]/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{item.label}</p>
                          {item.isSystem ? (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">System</span>
                          ) : (
                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-200">Custom</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {permCount} perms
                          </span>
                          {!item.isSystem && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRole(item);
                              }}
                              title="Delete custom role"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Role Permissions Checkbox Matrix */}
              <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        Editing Role
                      </span>
                      <h4 className="text-base font-black text-slate-900 capitalize">
                        {selectedRoleKey.replace('_', ' ')}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check or uncheck individual capabilities. Changes apply immediately to all users holding this role.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Clone from other role */}
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleCloneRolePermissions(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                    >
                      <option value="">Clone from Role...</option>
                      {allRolesList
                        .filter((r) => r.role !== selectedRoleKey)
                        .map((r) => (
                          <option key={r.role} value={r.role}>
                            Copy from {r.label}
                          </option>
                        ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleSelectAllRolePerms}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllRolePerms}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Deselect All
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRoleToDefault}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="Reset back to default role preset"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Search filter for permissions */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    placeholder="Search permissions by keyword (e.g. view, create, attendance, grades)..."
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78] focus:bg-white"
                  />
                </div>

                {/* Categorized Permission Checkbox Grid */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {permissionCategories.map(([category, items]) => {
                    const allCatChecked = items.every((p) => currentRoleActivePerms.includes(p.id));

                    return (
                      <div key={category} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#117B78]"></span>
                            {category} Module ({items.length})
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const itemIds = items.map((i) => i.id);
                              if (allCatChecked) {
                                setRolePermissionsDraft((prev) => ({
                                  ...prev,
                                  [selectedRoleKey]: currentRoleActivePerms.filter((id) => !itemIds.includes(id)),
                                }));
                              } else {
                                setRolePermissionsDraft((prev) => ({
                                  ...prev,
                                  [selectedRoleKey]: Array.from(new Set([...currentRoleActivePerms, ...itemIds])),
                                }));
                              }
                            }}
                            className="text-[10px] font-bold text-[#117B78] hover:underline cursor-pointer"
                          >
                            {allCatChecked ? 'Deselect Module' : 'Select All in Module'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((perm) => {
                            const isChecked = currentRoleActivePerms.includes(perm.id);

                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                                  isChecked
                                    ? 'bg-white border-emerald-300 shadow-xs'
                                    : 'bg-white/60 border-slate-200/80 hover:bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleRolePermission(perm.id)}
                                  className="h-4 w-4 mt-0.5 rounded border-slate-300 accent-[#117B78] focus:ring-[#117B78]"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-bold text-slate-900 truncate">{perm.label}</p>
                                    <span className="text-[9px] font-mono text-slate-400 shrink-0">{perm.id}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{perm.description}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Role Permissions Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Active permissions count: <strong className="text-slate-900">{currentRoleActivePerms.length}</strong> of {ALL_PERMISSIONS.length}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveRolePermissions}
                    className="flex items-center gap-2 rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save "{selectedRoleKey.replace('_', ' ')}" Permissions to Cloud</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: EDIT BY INDIVIDUAL USER */}
          {permissionViewMode === 'user' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* User Selector List */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select User to Customize
                  </h4>
                  <span className="text-[11px] text-slate-400">{filteredUsersForPicker.length} users</span>
                </div>

                {/* Role filter pills */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'student', label: 'Students' },
                    { id: 'faculty', label: 'Faculty' },
                    { id: 'academic_coordinator', label: 'Coord.' },
                    { id: 'director', label: 'Director' },
                    { id: 'creative_head', label: 'Creative' },
                    { id: 'telecaller', label: 'CRM' },
                  ].map((filterTab) => (
                    <button
                      key={filterTab.id}
                      type="button"
                      onClick={() => setUserRoleFilter(filterTab.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        userRoleFilter === filterTab.id
                          ? 'bg-[#117B78] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                </div>

                {/* User Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search user by name, email, or role..."
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredUsersForPicker.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const hasCustomOverrides = !!(u.permissions && u.permissions.length > 0);

                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#117B78]/10 border-[#117B78] shadow-xs ring-1 ring-[#117B78]/30'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700 capitalize">
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email}</p>
                        {hasCustomOverrides ? (
                          <span className="inline-block mt-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200">
                            Custom Overrides ({u.permissions?.length} perms)
                          </span>
                        ) : (
                          <span className="inline-block mt-1 rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 border border-slate-100">
                            Role Baseline
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {filteredUsersForPicker.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No users match filter
                    </div>
                  )}
                </div>
              </div>

              {/* User Permissions Checkbox Matrix */}
              {selectedUser && (
                <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                          Customizing User
                        </span>
                        <h4 className="text-base font-black text-slate-900">
                          {selectedUser.name}
                        </h4>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 capitalize">
                          Role: {selectedUser.role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Email: <span className="font-mono text-slate-700 font-semibold">{selectedUser.email}</span> • Department: {selectedUser.department}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Clone from other user */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleCloneUserPerms(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="px-2 py-1 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer outline-none"
                      >
                        <option value="">Clone from User...</option>
                        {users
                          .filter((u) => u.id !== selectedUser.id)
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              Copy from {u.name} ({u.role})
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleSyncUserWithRole}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Reset this user's permissions to match their role default"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sync with Role</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGrantAllUserPerms}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Grant All
                      </button>

                      <button
                        type="button"
                        onClick={handleRevokeAllUserPerms}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Revoke All
                      </button>
                    </div>
                  </div>

                  {/* Categorized Checkbox Matrix for this User */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {permissionCategories.map(([category, items]) => {
                      const allCatChecked = items.every((p) => currentUserActivePerms.includes(p.id));

                      return (
                        <div key={category} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#117B78]"></span>
                              {category} ({items.length})
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                const itemIds = items.map((i) => i.id);
                                if (allCatChecked) {
                                  setUserPermissionsDraft((prev) => ({
                                    ...prev,
                                    [selectedUser.id]: currentUserActivePerms.filter((id) => !itemIds.includes(id)),
                                  }));
                                } else {
                                  setUserPermissionsDraft((prev) => ({
                                    ...prev,
                                    [selectedUser.id]: Array.from(new Set([...currentUserActivePerms, ...itemIds])),
                                  }));
                                }
                              }}
                              className="text-[10px] font-bold text-[#117B78] hover:underline cursor-pointer"
                            >
                              {allCatChecked ? 'Deselect Module' : 'Select All in Module'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items.map((perm) => {
                              const isChecked = currentUserActivePerms.includes(perm.id);

                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                                    isChecked
                                      ? 'bg-white border-emerald-300 shadow-xs'
                                      : 'bg-white/60 border-slate-200/80 hover:bg-white'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleUserPermission(perm.id)}
                                    className="h-4 w-4 mt-0.5 rounded border-slate-300 accent-[#117B78] focus:ring-[#117B78]"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <p className="text-xs font-bold text-slate-900 truncate">{perm.label}</p>
                                      <span className="text-[9px] font-mono text-slate-400 shrink-0">{perm.id}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{perm.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save User Permissions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Granted to {selectedUser.name}: <strong className="text-slate-900">{currentUserActivePerms.length}</strong> of {ALL_PERMISSIONS.length}
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveUserPermissions}
                      className="flex items-center gap-2 rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Permissions for {selectedUser.name} to Cloud</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CLOUD DATABASE (FIREBASE) DETAILS & LIVE DIAGNOSTICS */}
      {/* ======================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-6 max-w-4xl">
          {/* Main Status Hero Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight">Google Cloud Firestore</h3>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Live & Synchronized
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Primary cloud persistence layer. All academic entities, users, classes, assignments, and leads are synchronized via real-time WebSocket listeners across all browsers.
                  </p>
                </div>
              </div>

              {/* Ping Benchmark Button */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleTestDatabasePing}
                  disabled={isPingingDb || isSyncing}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPingingDb || isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isPingingDb ? 'Pinging Cloud...' : 'Test Sync Ping'}</span>
                </button>
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Database ID
                  </span>
                  <button
                    onClick={() => handleCopy(firestoreDatabaseId, 'dbid')}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition"
                    title="Copy Database ID"
                  >
                    {copiedKey === 'dbid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span className="font-mono font-bold text-emerald-300 text-xs break-all" title={firestoreDatabaseId}>
                  {firestoreDatabaseId}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    GCP Project ID
                  </span>
                  <button
                    onClick={() => handleCopy(firebaseProjectId, 'projid')}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition"
                    title="Copy Project ID"
                  >
                    {copiedKey === 'projid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span className="font-mono font-bold text-white text-xs">
                  {firebaseProjectId}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Sync Mode
                </span>
                <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  WebSocket (onSnapshot)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Latency Ping
                </span>
                <span className="font-mono font-bold text-white text-xs">
                  {dbLatency !== null ? `${dbLatency} ms (Fast)` : isDatabaseConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>

            {lastSyncTime && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last verified cloud stream event: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </p>
            )}
          </div>

          {/* Cross-Browser Synchronous Guarantee Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Cross-Browser & Multi-Device Real-Time Architecture
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  When you delete or edit a record in one browser (e.g. Chrome), a <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">deleteDoc()</code> or <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">setDoc()</code> mutation executes directly on Google Cloud Firestore. Firestore emits a real-time event to all open tabs and browsers, immediately purging or updating the item everywhere. No stale deleted data will ever reappear upon page refresh or when logging in from a different browser.
                </p>
              </div>
            </div>
          </div>

          {/* 14 Live Cloud Collections & Record Counters */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Live Cloud Firestore Collections</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  14 synchronized collections actively listening for live database events.
                </p>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                All 14 Connected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Courses', path: 'courses', count: courses.length },
                { label: 'Users & Staff', path: 'users', count: users.length },
                { label: 'Subjects', path: 'subjects', count: subjects.length },
                { label: 'Live Classes', path: 'classes', count: classes.length },
                { label: 'Recorded Lectures', path: 'recordedClasses', count: recordedClasses.length },
                { label: 'Attendance Records', path: 'attendance', count: attendance.length },
                { label: 'Tasks & Homework', path: 'tasks', count: tasks.length },
                { label: 'Task Submissions', path: 'taskSubmissions', count: taskSubmissions.length },
                { label: 'Creative Tasks', path: 'creativeTasks', count: creativeTasks.length },
                { label: 'Media Assets', path: 'media', count: media.length },
                { label: 'CRM Leads', path: 'leads', count: leads.length },
                { label: 'Student Points', path: 'pointsHistory', count: pointsHistory.length },
                { label: 'Audit Trail Logs', path: 'auditLogs', count: auditLogs.length },
                { label: 'Notifications', path: 'notifications', count: notifications.length },
              ].map((col) => (
                <div key={col.path} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">/{col.path}</span>
                  <p className="text-lg font-black text-slate-900">{col.count}</p>
                  <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{col.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. INTEGRATIONS TAB */}
      {/* ======================================================== */}
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
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. NOTIFICATIONS TAB */}
      {/* ======================================================== */}
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

      {/* CREATE CUSTOM ROLE MODAL */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Custom Institutional Role</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define a new role and choose a baseline permissions template.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoleModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => {
                    setNewRoleName(e.target.value);
                    if (!newRoleKey || newRoleKey === newRoleName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
                      setNewRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                    }
                  }}
                  placeholder="e.g. Assistant Dean or Lab Supervisor"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unique Role Key *
                </label>
                <input
                  type="text"
                  required
                  value={newRoleKey}
                  onChange={(e) => setNewRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  placeholder="e.g. assistant_dean"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Description
                </label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Brief summary of duties and privileges..."
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Permissions Template
                </label>
                <select
                  value={newRoleTemplate}
                  onChange={(e) => setNewRoleTemplate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  {allRolesList.map((r) => (
                    <option key={r.role} value={r.role}>
                      Start with {r.label} permissions
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  You can fine-tune every individual permission after creating this role.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#117B78] text-xs font-bold text-white hover:bg-[#0D9C88] shadow-sm transition cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
