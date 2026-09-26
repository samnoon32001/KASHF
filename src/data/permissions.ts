import { RoleDefinition, UserRole } from '../types';

export interface PermissionItem {
  id: string;
  label: string;
  category: string;
  description: string;
}

export const ALL_PERMISSIONS: PermissionItem[] = [
  // Users
  { id: 'users.view', label: 'View Users', category: 'Users', description: 'Can view staff and system users' },
  { id: 'users.create', label: 'Create Users', category: 'Users', description: 'Can add new staff and system users' },
  { id: 'users.edit', label: 'Edit Users', category: 'Users', description: 'Can edit staff profiles and roles' },
  { id: 'users.delete', label: 'Delete Users', category: 'Users', description: 'Can delete users' },
  { id: 'users.activate', label: 'Activate/Deactivate', category: 'Users', description: 'Can activate or suspend user accounts' },

  // Students
  { id: 'students.view', label: 'View Students', category: 'Students', description: 'Can view student roster and profiles' },
  { id: 'students.create', label: 'Enroll Students', category: 'Students', description: 'Can enroll new students' },
  { id: 'students.edit', label: 'Edit Students', category: 'Students', description: 'Can modify student records' },
  { id: 'students.delete', label: 'Delete Students', category: 'Students', description: 'Can remove students' },
  { id: 'students.import', label: 'Import Students', category: 'Students', description: 'Can bulk import student data' },
  { id: 'students.export', label: 'Export Students', category: 'Students', description: 'Can export student records' },

  // Courses
  { id: 'courses.view', label: 'View Courses', category: 'Courses', description: 'Can view courses and syllabus' },
  { id: 'courses.create', label: 'Create Courses', category: 'Courses', description: 'Can create new courses and curriculums' },
  { id: 'courses.edit', label: 'Edit Courses', category: 'Courses', description: 'Can modify course details and subjects' },
  { id: 'courses.delete', label: 'Delete Courses', category: 'Courses', description: 'Can delete courses' },

  // Faculties
  { id: 'faculties.view', label: 'View Faculties', category: 'Faculties', description: 'Can view faculty profiles and workload' },
  { id: 'faculties.create', label: 'Add Faculty', category: 'Faculties', description: 'Can register new faculty members' },
  { id: 'faculties.edit', label: 'Edit Faculty', category: 'Faculties', description: 'Can edit faculty information and subjects' },
  { id: 'faculties.delete', label: 'Delete Faculty', category: 'Faculties', description: 'Can remove faculty records' },

  // Attendance
  { id: 'attendance.view', label: 'View Attendance', category: 'Attendance', description: 'Can view attendance summaries' },
  { id: 'attendance.create', label: 'Take Attendance', category: 'Attendance', description: 'Can record student class attendance' },
  { id: 'attendance.edit', label: 'Edit Attendance', category: 'Attendance', description: 'Can modify past attendance marks' },
  { id: 'attendance.delete', label: 'Delete Attendance', category: 'Attendance', description: 'Can remove attendance entries' },
  { id: 'attendance.export', label: 'Export Attendance', category: 'Attendance', description: 'Can download attendance spreadsheets' },

  // Tasks & Points
  { id: 'tasks.view', label: 'View Tasks', category: 'Tasks', description: 'Can view assignments and tasks' },
  { id: 'tasks.create', label: 'Create Tasks', category: 'Tasks', description: 'Can create new student assignments' },
  { id: 'tasks.assign', label: 'Assign Tasks', category: 'Tasks', description: 'Can assign tasks to courses and students' },
  { id: 'tasks.edit', label: 'Edit Tasks', category: 'Tasks', description: 'Can modify task descriptions and points' },
  { id: 'tasks.delete', label: 'Delete Tasks', category: 'Tasks', description: 'Can remove assignments' },
  { id: 'tasks.approve', label: 'Grade & Award Points', category: 'Tasks', description: 'Can review submissions and award points' },

  // Media & Creative
  { id: 'media.view', label: 'View Media', category: 'Creative & Media', description: 'Can view creative assets and media library' },
  { id: 'media.create', label: 'Upload Media', category: 'Creative & Media', description: 'Can upload posters, videos and documents' },
  { id: 'media.edit', label: 'Manage Media', category: 'Creative & Media', description: 'Can manage media categories and tags' },
  { id: 'media.delete', label: 'Delete Media', category: 'Creative & Media', description: 'Can remove media assets' },
  { id: 'media.approve', label: 'Approve Creative Tasks', category: 'Creative & Media', description: 'Can approve or request revisions on designs' },

  // CRM & Leads
  { id: 'leads.view', label: 'View Leads', category: 'CRM & Leads', description: 'Can view lead pipelines and contacts' },
  { id: 'leads.create', label: 'Add Leads', category: 'CRM & Leads', description: 'Can add manual leads or sync ads' },
  { id: 'leads.edit', label: 'Update Leads', category: 'CRM & Leads', description: 'Can update notes, status and follow-ups' },
  { id: 'leads.delete', label: 'Delete Leads', category: 'CRM & Leads', description: 'Can remove lead records' },
  { id: 'leads.assign', label: 'Assign Leads', category: 'CRM & Leads', description: 'Can assign leads to telecallers' },
  { id: 'leads.export', label: 'Export Leads', category: 'CRM & Leads', description: 'Can export lead lists' },

  // Website CMS
  { id: 'website.view', label: 'View Website CMS', category: 'Website', description: 'Can view website CMS sections' },
  { id: 'website.manage', label: 'Manage Website', category: 'Website', description: 'Can publish banners and announcements' },
  { id: 'website.pages', label: 'Manage Pages', category: 'Website', description: 'Can edit landing pages and events' },
  { id: 'website.settings', label: 'Website Settings', category: 'Website', description: 'Can configure website SEO and links' },

  // Reports & Analytics
  { id: 'reports.view', label: 'View Reports', category: 'Reports', description: 'Can view institutional analytics' },
  { id: 'reports.export', label: 'Export Reports', category: 'Reports', description: 'Can download executive CSV summaries' },

  // Audit Logs
  { id: 'audit.view', label: 'View Audit Logs', category: 'Audit', description: 'Can inspect system audit logs' },

  // Institution Settings
  { id: 'settings.manage', label: 'Manage Settings', category: 'Settings', description: 'Can configure institution branding, integrations, and RBAC' },
];

export const DEFAULT_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    roleKey: 'super_admin',
    name: 'Super Admin',
    description: 'Full institutional control and administrative access across all modules.',
    permissions: ALL_PERMISSIONS.map((p) => p.id),
    isSystem: true,
  },
  {
    id: 'role-director',
    roleKey: 'director',
    name: 'Director',
    description: 'Executive oversight of academics, operations, creative campaigns, and student analytics.',
    permissions: [
      'users.view',
      'students.view',
      'students.export',
      'courses.view',
      'faculties.view',
      'attendance.view',
      'attendance.export',
      'tasks.view',
      'media.view',
      'media.approve',
      'leads.view',
      'leads.export',
      'website.view',
      'reports.view',
      'reports.export',
      'audit.view',
    ],
    isSystem: true,
  },
  {
    id: 'role-academic-coordinator',
    roleKey: 'academic_coordinator',
    name: 'Academic Coordinator',
    description: 'Manages curriculum, courses, faculties workload, schedules, attendance, and student tracking.',
    permissions: [
      'students.view',
      'students.create',
      'students.edit',
      'students.import',
      'students.export',
      'courses.view',
      'courses.create',
      'courses.edit',
      'faculties.view',
      'faculties.create',
      'faculties.edit',
      'attendance.view',
      'attendance.create',
      'attendance.edit',
      'attendance.export',
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'tasks.approve',
      'reports.view',
    ],
    isSystem: true,
  },
  {
    id: 'role-creative-head',
    roleKey: 'creative_head',
    name: 'Creative Head',
    description: 'Oversees creative task execution, media library, branding assets, and institutional website content.',
    permissions: [
      'media.view',
      'media.create',
      'media.edit',
      'media.delete',
      'media.approve',
      'website.view',
      'website.manage',
      'website.pages',
      'website.settings',
    ],
    isSystem: true,
  },
  {
    id: 'role-faculty',
    roleKey: 'faculty',
    name: 'Faculty',
    description: 'Conducts classes, starts Google Meet sessions, marks attendance, and assigns & grades student tasks.',
    permissions: [
      'courses.view',
      'students.view',
      'attendance.view',
      'attendance.create',
      'attendance.edit',
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'tasks.approve',
      'media.view',
    ],
    isSystem: true,
  },
  {
    id: 'role-telecaller',
    roleKey: 'telecaller',
    name: 'Telecaller',
    description: 'Handles CRM leads, Meta Lead Ad prospects, phone calls, follow-ups, and enrollment conversions.',
    permissions: [
      'leads.view',
      'leads.create',
      'leads.edit',
      'leads.assign',
      'leads.export',
      'courses.view',
    ],
    isSystem: true,
  },
  {
    id: 'role-student',
    roleKey: 'student',
    name: 'Student',
    description: 'Enrolled student with simplified dashboard for courses, live classes, recordings, tasks, and points.',
    permissions: [
      'courses.view',
      'attendance.view',
      'tasks.view',
    ],
    isSystem: true,
  },
];

export function hasPermission(user: { permissions?: string[]; role: UserRole } | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return !!user.permissions?.includes(permission);
}

export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = DEFAULT_ROLE_DEFINITIONS.reduce((acc, r) => {
  acc[r.roleKey] = r.permissions;
  return acc;
}, {} as Record<string, string[]>);

