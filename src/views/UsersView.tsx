import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_ROLE_DEFINITIONS } from '../data/permissions';

export const UsersView: React.FC = () => {
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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('Academic Affairs');
  const [formRole, setFormRole] = useState<UserRole>('faculty');
  const [formAdmissionNumber, setFormAdmissionNumber] = useState('');

  const canEditUsers = can('users.edit') || currentUser?.role === 'super_admin';
  const canDeleteUsers = can('users.delete') || currentUser?.role === 'super_admin';

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.admissionNumber && u.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    addUser({
      name: formName,
      email: formEmail,
      phone: formPhone,
      department: formDepartment,
      role: formRole,
      status: 'active',
      admissionNumber: formRole === 'student' ? formAdmissionNumber || 'ADM-2026-' + Math.floor(100 + Math.random() * 900) : undefined,
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setShowAddModal(false);
  };

  const handleExport = () => {
    exportToCSV(
      'users_roster',
      filteredUsers.map((u) => ({
        ID: u.id,
        Name: u.name,
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
            Manage institutional staff, educators, coordinators, telecallers, and students.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {canEditUsers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#117B78] focus:ring-2 focus:ring-[#117B78]/15 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#117B78] outline-none"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="director">Director</option>
            <option value="academic_coordinator">Academic Coordinator</option>
            <option value="faculty">Faculty</option>
            <option value="creative_head">Creative Head</option>
            <option value="telecaller">Telecaller</option>
            <option value="student">Student</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-[#117B78] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                <th className="py-3.5 px-4">Role & Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredUsers.map((user) => {
                const isPrimaryAdmin = user.email === 'admin@institution.local';
                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#117B78]/10 text-[#117B78] flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{user.email}</p>
                          {user.admissionNumber && (
                            <span className="inline-block font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                              ID: {user.admissionNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className="inline-flex items-center rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[11px] font-bold text-[#117B78] capitalize">
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

                    <td className="py-4 px-4 text-slate-500">
                      {user.joiningDate || '2026-01-01'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEditUsers && !isPrimaryAdmin && (
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            title={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
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
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
                                deleteUser(user.id);
                              }
                            }}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Add New Institutional User</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create an account with role-based access permissions.
            </p>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Williams"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="user@institution.local"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    <option value="faculty">Faculty</option>
                    <option value="academic_coordinator">Academic Coordinator</option>
                    <option value="creative_head">Creative Head</option>
                    <option value="telecaller">Telecaller</option>
                    <option value="student">Student</option>
                    <option value="director">Director</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              {formRole === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    value={formAdmissionNumber}
                    onChange={(e) => setFormAdmissionNumber(e.target.value)}
                    placeholder="e.g. ADM-2026-101"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
