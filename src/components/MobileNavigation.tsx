import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckSquare,
  Bell,
  User,
  FolderTree,
  UserCheck,
  Users,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const MobileNavigation: React.FC = () => {
  const { activeRole, activeTab, setActiveTab, unreadNotificationCount } = useApp();

  interface BottomNavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasBadge?: boolean;
  }

  const getRoleNavItems = (role: UserRole): BottomNavItem[] => {
    switch (role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'classes', label: 'Classes', icon: Calendar },
          { id: 'notifications', label: 'Alerts', icon: Bell, hasBadge: unreadNotificationCount > 0 },
          { id: 'settings', label: 'Profile', icon: User },
        ];
      case 'faculty':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'classes', label: 'Classes', icon: Calendar },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'settings', label: 'Profile', icon: User },
        ];
      case 'telecaller':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'leads', label: 'Leads', icon: UserCheck },
          { id: 'classes', label: 'Follow-ups', icon: Clock },
          { id: 'notifications', label: 'Alerts', icon: Bell, hasBadge: unreadNotificationCount > 0 },
          { id: 'settings', label: 'Profile', icon: User },
        ];
      case 'creative_head':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'creative', label: 'Tasks', icon: CheckSquare },
          { id: 'media', label: 'Media', icon: FolderTree },
          { id: 'notifications', label: 'Alerts', icon: Bell, hasBadge: unreadNotificationCount > 0 },
          { id: 'settings', label: 'Profile', icon: User },
        ];
      case 'academic_coordinator':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'users', label: 'Faculty', icon: Users },
          { id: 'students', label: 'Students', icon: GraduationCap },
          { id: 'settings', label: 'Profile', icon: User },
        ];
      case 'director':
      case 'super_admin':
      default:
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'classes', label: 'Classes', icon: Calendar },
          { id: 'leads', label: 'CRM', icon: UserCheck },
          { id: 'settings', label: 'Settings', icon: User },
        ];
    }
  };

  const navItems = getRoleNavItems(activeRole);

  return (
    <nav
      id="mobile-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden shadow-lg safe-area-bottom"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center w-14 py-1 transition cursor-pointer ${
              isActive ? 'text-[#117B78]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {item.hasBadge && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
