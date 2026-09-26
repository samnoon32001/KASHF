import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Video,
  ClipboardCheck,
  CheckSquare,
  Award,
  Palette,
  FolderTree,
  UserCheck,
  BarChart3,
  FileText,
  Settings,
  Bell,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, can, currentUser, settings, unreadNotificationCount } = useApp();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isStudent = currentUser?.role === 'student';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
    badge?: number | string;
    hideForStudent?: boolean;
  }

  interface NavSection {
    sectionTitle: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      sectionTitle: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: isStudent ? 'My Learning Hub' : 'Dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      sectionTitle: 'Academic Core',
      items: [
        {
          id: 'courses',
          label: isStudent ? 'My Courses' : 'Courses & Subjects',
          icon: BookOpen,
          permission: 'courses.view',
        },
        {
          id: 'classes',
          label: isStudent ? 'Live Classes & Meet' : 'Class Schedules',
          icon: Calendar,
          permission: 'courses.view',
        },
        {
          id: 'recordings',
          label: 'Recorded Classes',
          icon: Video,
          permission: 'courses.view',
        },
        {
          id: 'attendance',
          label: isStudent ? 'My Attendance' : 'Attendance Log',
          icon: ClipboardCheck,
          permission: 'attendance.view',
        },
        {
          id: 'students',
          label: 'Student Roster',
          icon: GraduationCap,
          permission: 'students.view',
          hideForStudent: true,
        },
      ],
    },
    {
      sectionTitle: 'Tasks & Rewards',
      items: [
        {
          id: 'tasks',
          label: isStudent ? 'My Assignments' : 'Tasks & Submissions',
          icon: CheckSquare,
          permission: 'tasks.view',
        },
        {
          id: 'points',
          label: isStudent ? 'Earned Points' : 'Student Points',
          icon: Award,
        },
      ],
    },
    {
      sectionTitle: 'Creative & Media',
      items: [
        {
          id: 'creative',
          label: 'Creative Tasks',
          icon: Palette,
          permission: 'media.view',
          hideForStudent: true,
        },
        {
          id: 'media',
          label: 'Media Library',
          icon: FolderTree,
          permission: 'media.view',
          hideForStudent: true,
        },
      ],
    },
    {
      sectionTitle: 'CRM & Growth',
      items: [
        {
          id: 'leads',
          label: 'Meta Leads & CRM',
          icon: UserCheck,
          permission: 'leads.view',
          hideForStudent: true,
        },
      ],
    },
    {
      sectionTitle: 'Management & System',
      items: [
        {
          id: 'users',
          label: 'User Management',
          icon: Users,
          permission: 'users.view',
          hideForStudent: true,
        },
        {
          id: 'roles',
          label: 'Roles & RBAC',
          icon: ShieldCheck,
          permission: 'users.view',
          hideForStudent: true,
        },
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: BarChart3,
          permission: 'reports.view',
          hideForStudent: true,
        },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: FileText,
          permission: 'audit.view',
          hideForStudent: true,
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: Settings,
          permission: 'settings.manage',
          hideForStudent: true,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#117B78] to-[#0D9C88] text-white shadow-sm font-black text-lg shrink-0">
              K
            </div>
            <div className="min-w-0">
              <span className="text-sm font-black tracking-tight text-slate-950 block truncate leading-tight">
                Kashf
              </span>
              <span className="block text-[10px] font-medium text-slate-500 tracking-tight leading-tight truncate">
                Institute of Islamic Excellence
              </span>
            </div>
          </div>

          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section) => {
            const filteredItems = section.items.filter((item) => {
              if (isStudent && item.hideForStudent) return false;
              if (isSuperAdmin) return true;
              if (!item.permission) return true;
              return can(item.permission);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.sectionTitle} className="space-y-1">
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.sectionTitle}
                </p>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#117B78] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-[#117B78]/5 p-3 border border-[#117B78]/10">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-bold text-slate-800">PWA & Firestore Online</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Synced with institutional database
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
