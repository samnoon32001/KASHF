import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  KeyRound,
  Edit2,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, PermissionItem } from '../data/permissions';

export const UsersView: React.FC<{ initialFilter?: 'all' | 'faculty' | 'student' | 'staff' }> = ({
  initialFilter = 'all',
}) => {
  const {
    users,
    roles,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    exportToCSV,
    can,
    currentUser,
    globalSearchQuery,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [roleFilter, setRoleFilter] = useState<string>(initialFilter);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // User-Specific Permissions Modal State
  const [userForPermissionsModal, setUserForPermissionsModal] = useState<UserProfile | null>(null);
  const [userDraftPermissions, setUserDraftPermissions] = useState<string[]>([]);
  const [permissionModalSearch, setPermissionModalSearch] = useState('');
  const [permissionsSaveSuccess, setPermissionsSaveSuccess] = useState(false);

  const handleOpenPermissionsModal = (u: UserProfile) => {
    setUserForPermissionsModal(u);
    const existing =
      u.permissions && u.permissions.length > 0
        ? u.permissions
        : roles.find((r) => r.roleKey === u.role)?.permissions || ROLE_DEFAULT_PERMISSIONS[u.role] || [];
    setUserDraftPermissions(existing);
    setPermissionModalSearch('');
    setPermissionsSaveSuccess(false);
  };

  const handleToggleUserModalPermission = (permId: string) => {
    setUserDraftPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSyncUserModalRole = () => {
    if (!userForPermissionsModal) return;
    const roleDef = roles.find((r) => r.roleKey === userForPermissionsModal.role);
    const defaultPerms = roleDef?.permissions || ROLE_DEFAULT_PERMISSIONS[userForPermissionsModal.role] || [];
    setUserDraftPermissions(defaultPerms);
  };

  const handleSaveUserModalPermissions = () => {
    if (!userForPermissionsModal) return;
    updateUser(userForPermissionsModal.id, { permissions: userDraftPermissions });
    setPermissionsSaveSuccess(true);
    setTimeout(() => {
      setPermissionsSaveSuccess(false);
      setUserForPermissionsModal(null);
    }, 1200);
  };

  // Add User Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('Academic Affairs');
  const [formRole, setFormRole] = useState<UserRole>('faculty');
  const [formAdmissionNumber, setFormAdmissionNumber] = useState('');

  // Edit User Form State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('faculty');
  const [editAdmissionNumber, setEditAdmissionNumber] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canEditUsers = can('users.edit') || currentUser?.role === 'super_admin';
  const canDeleteUsers = can('users.delete') || currentUser?.role === 'super_admin';

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.admissionNumber && u.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesRole = true;
    if (roleFilter === 'faculty') {
      matchesRole = u.role === 'faculty';
    } else if (roleFilter === 'student') {
      matchesRole = u.role === 'student';
    } else if (roleFilter === 'staff') {
      matchesRole = u.role !== 'student' && u.role !== 'faculty';
    } else if (roleFilter !== 'all') {
      matchesRole = u.role === roleFilter;
    }

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '123';
  };

  const handleOpenAddModal = (defaultRole?: UserRole) => {
    const role = defaultRole || 'faculty';
    setFormRole(role);
    setFormName('');
    setFormUsername('');
    setFormPassword(generateRandomPassword());
    setFormEmail('');
    setFormPhone('');
    setFormDepartment(role === 'student' ? 'General Academic' : 'Academic Affairs');
    setFormAdmissionNumber(role === 'student' ? 'ADM-2026-' + Math.floor(100 + Math.random() * 900) : '');
    setShowAddModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const username = formUsername.trim() || formEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const password = formPassword.trim() || 'password123';

    addUser({
      name: formName.trim(),
      username,
      password,
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      department: formDepartment.trim(),
      role: formRole,
      status: 'active',
      admissionNumber:
        formRole === 'student'
          ? formAdmissionNumber.trim() || 'ADM-2026-' + Math.floor(100 + Math.random() * 900)
          : undefined,
    });

    setShowAddModal(false);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setSelectedUserForEdit(user);
    setEditName(user.name);
    setEditUsername(user.username || user.email.split('@')[0]);
    setEditPassword(user.password || '');
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditDepartment(user.department || '');
    setEditRole(user.role);
    setEditAdmissionNumber(user.admissionNumber || '');
    setEditStatus(user.status);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    updateUser(selectedUserForEdit.id, {
      name: editName.trim(),
      username: editUsername.trim(),
      password: editPassword.trim() || undefined,
      email: editEmail.trim().toLowerCase(),
      phone: editPhone.trim(),
      department: editDepartment.trim(),
      role: editRole,
      status: editStatus,
      admissionNumber: editRole === 'student' ? editAdmissionNumber.trim() : undefined,
    });

    setSelectedUserForEdit(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  const handleCopyCredentials = (u: UserProfile) => {
    const text = `Username: ${u.username || u.email}\nPassword: ${u.password || 'Same as login password'}\nRole: ${u.role}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    exportToCSV(
      'users_directory',
      filteredUsers.map((u) => ({
        ID: u.id,
        Name: u.name,
        Username: u.username || 'N/A',
        Email: u.email,
        Role: u.role,
        Department: u.department || 'N/A',
        Status: u.status,
        Phone: u.phone || 'N/A',
        AdmissionNumber: u.admissionNumber || 'N/A',
        JoiningDate: u.joiningDate,
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            User Management & Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create and manage usernames, credentials, faculties, students, coordinators, and directors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('roles')}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
            title="Edit system-wide role permissions"
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Role Permissions Matrix</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {canEditUsers && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddModal('student')}
                className="flex items-center gap-1.5 rounded-xl border border-[#117B78] bg-[#117B78]/10 px-3.5 py-2.5 text-xs font-bold text-[#117B78] hover:bg-[#117B78]/20 transition cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Add Student</span>
              </button>

              <button
                onClick={() => handleOpenAddModal('faculty')}
                className="flex items-center gap-1.5 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Faculty / User</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: `All Users (${users.length})` },
          { id: 'student', label: `Students (${users.filter((u) => u.role === 'student').length})` },
          { id: 'faculty', label: `Faculties (${users.filter((u) => u.role === 'faculty').length})` },
          {
            id: 'staff',
            label: `Staff & Admin (${
              users.filter((u) => u.role !== 'student' && u.role !== 'faculty').length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              roleFilter === tab.id
                ? 'bg-[#117B78] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, username, email, or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#117B78] focus:ring-2 focus:ring-[#117B78]/15 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#117B78] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">User / Contact</th>
                <th className="py-3.5 px-4">Username & Auth</th>
                <th className="py-3.5 px-4">Role & Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredUsers.map((user) => {
                const isPrimaryAdmin = user.email === 'admin@institution.local' || user.id === 'user-superadmin';
                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#117B78]/10 text-[#117B78] flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{user.email}</p>
                          {user.admissionNumber && (
                            <span className="inline-block font-mono text-[10px] text-[#117B78] font-bold bg-[#117B78]/10 px-1.5 py-0.2 rounded mt-0.5">
                              ID: {user.admissionNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          @{user.username || user.email.split('@')[0]}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Pass: {user.password ? '••••••••' : 'Default'}
                          </span>
                          <button
                            onClick={() => handleCopyCredentials(user)}
                            title="Copy credentials"
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedId === user.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold capitalize ${
                            user.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'faculty'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'student'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">{user.department || 'General'}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        />
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEditUsers && (
                          <button
                            onClick={() => handleOpenPermissionsModal(user)}
                            title="Edit Permissions & Privileges"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}

                        {canEditUsers && (
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User & Credentials"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#117B78] cursor-pointer transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {canEditUsers && !isPrimaryAdmin && (
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            title={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition"
                          >
                            {user.status === 'active' ? (
                              <XCircle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </button>
                        )}

                        {canDeleteUsers && !isPrimaryAdmin && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Institutional User</h3>
                <p className="text-xs text-slate-500">
                  Configure user credentials, username, password and assigned role.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Williams"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="e.g. arthur_williams"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Account Password</label>
                  <button
                    type="button"
                    onClick={() => setFormPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-[#117B78] hover:underline cursor-pointer"
                  >
                    Generate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 pl-3 pr-10 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@kashf.edu"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="academic_coordinator">Academic Coordinator</option>
                    <option value="creative_head">Creative Head</option>
                    <option value="telecaller">Telecaller</option>
                    <option value="director">Director</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              {formRole === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={formAdmissionNumber}
                    onChange={(e) => setFormAdmissionNumber(e.target.value)}
                    placeholder="e.g. ADM-2026-101"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit User & Authentication</h3>
                <p className="text-xs text-slate-500">Update account credentials and user profile</p>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setEditPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-[#117B78] hover:underline cursor-pointer"
                  >
                    Reset with Random Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password to reset"
                    className="w-full h-10 rounded-xl border border-slate-200 pl-3 pr-10 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="academic_coordinator">Academic Coordinator</option>
                    <option value="creative_head">Creative Head</option>
                    <option value="telecaller">Telecaller</option>
                    <option value="director">Director</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {editRole === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={editAdmissionNumber}
                    onChange={(e) => setEditAdmissionNumber(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRM MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email})?
              All associated permissions and credentials will be revoked immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setUserToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER PERMISSIONS MODAL */}
      {userForPermissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Custom Permissions: {userForPermissionsModal.name}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 capitalize">
                    {userForPermissionsModal.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Email: <span className="font-mono text-slate-700 font-semibold">{userForPermissionsModal.email}</span> • Department: {userForPermissionsModal.department}
                </p>
              </div>

              <button
                onClick={() => setUserForPermissionsModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Search */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={permissionModalSearch}
                  onChange={(e) => setPermissionModalSearch(e.target.value)}
                  placeholder="Filter permissions..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncUserModalRole}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Sync with Role Default
                </button>
                <button
                  type="button"
                  onClick={() => setUserDraftPermissions(ALL_PERMISSIONS.map((p) => p.id))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Grant All
                </button>
                <button
                  type="button"
                  onClick={() => setUserDraftPermissions([])}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Revoke All
                </button>
              </div>
            </div>

            {/* Modal Body: Categorized Checkboxes */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 max-h-[55vh]">
              {permissionsSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Permissions successfully saved to Cloud Firestore for this user!</span>
                </div>
              )}

              {ALL_PERMISSIONS.filter((p) => {
                const q = permissionModalSearch.toLowerCase().trim();
                if (!q) return true;
                return (
                  p.label.toLowerCase().includes(q) ||
                  p.id.toLowerCase().includes(q) ||
                  p.description.toLowerCase().includes(q) ||
                  p.category.toLowerCase().includes(q)
                );
              }).map((perm) => {
                const isChecked = userDraftPermissions.includes(perm.id);

                return (
                  <label
                    key={perm.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
                      isChecked
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleUserModalPermission(perm.id)}
                      className="h-4 w-4 mt-0.5 rounded border-slate-300 accent-[#117B78] focus:ring-[#117B78]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{perm.label}</p>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-500 uppercase">
                            {perm.category}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{perm.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{perm.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Active permissions: <strong className="text-slate-900">{userDraftPermissions.length}</strong> of {ALL_PERMISSIONS.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUserForPermissionsModal(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserModalPermissions}
                  className="rounded-xl bg-[#117B78] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                >
                  Save Permissions to Cloud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
