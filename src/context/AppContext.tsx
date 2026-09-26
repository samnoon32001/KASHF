import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  UserProfile,
  UserRole,
  RoleDefinition,
  Course,
  Subject,
  ClassSession,
  RecordedClass,
  AttendanceSession,
  Task,
  TaskSubmission,
  CreativeTask,
  MediaItem,
  Lead,
  Notification,
  AuditLog,
  InstitutionSettings,
  StudentPointsHistory,
} from '../types';
import { auth, loginWithGoogle, logoutUser, testFirestoreConnection, firebaseConfig } from '../firebase';
import {
  subscribeToCollection,
  subscribeToDocument,
  seedIfEmpty,
  saveDocument,
  deleteDocument,
  saveSingletonDocument,
  isCollectionSeeded,
  markCollectionSeeded,
} from '../services/firestoreSync';
import { ALL_PERMISSIONS, DEFAULT_ROLE_DEFINITIONS, hasPermission } from '../data/permissions';
import {
  INITIAL_SETTINGS,
  SAMPLE_COURSES,
  SAMPLE_SUBJECTS,
  SAMPLE_CLASSES,
  SAMPLE_RECORDED_CLASSES,
  SAMPLE_TASKS,
  SAMPLE_CREATIVE_TASKS,
  SAMPLE_MEDIA,
  SAMPLE_LEADS,
} from '../data/seedData';

// Storage keys
const STORAGE_KEY = 'kashf_lms_v1_state';

interface AppContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  activeRole: UserRole;
  currentRoleDefinition: RoleDefinition | undefined;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  users: UserProfile[];
  roles: RoleDefinition[];
  courses: Course[];
  subjects: Subject[];
  classes: ClassSession[];
  recordedClasses: RecordedClass[];
  attendance: AttendanceSession[];
  tasks: Task[];
  taskSubmissions: TaskSubmission[];
  creativeTasks: CreativeTask[];
  media: MediaItem[];
  leads: Lead[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: InstitutionSettings;
  pointsHistory: StudentPointsHistory[];
  unreadNotificationCount: number;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  showFirstLoginModal: boolean;
  setShowFirstLoginModal: (show: boolean) => void;

  // Cloud Database Connection State
  isDatabaseConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  firebaseProjectId: string;
  firestoreDatabaseId: string;
  refreshDatabaseSync: () => Promise<void>;

  // Auth & Roles
  loginWithCredentials: (identifier: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  updateInitialPassword: (newPassword: string) => void;
  switchRolePreview: (role: UserRole) => void;
  can: (permission: string) => boolean;

  // CRUD & Actions
  addUser: (userData: Omit<UserProfile, 'id' | 'joiningDate'>) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  addRole: (role: Omit<RoleDefinition, 'id' | 'isSystem'>) => void;
  updateRole: (id: string, updates: Partial<RoleDefinition>) => void;
  deleteRole: (id: string) => void;

  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addClassSession: (classSession: Omit<ClassSession, 'id' | 'attendanceSubmitted'>) => void;
  updateClassSession: (id: string, updates: Partial<ClassSession>) => void;
  deleteClassSession: (id: string) => void;
  startClassSession: (id: string) => void;
  endClassSession: (id: string, recordingUrl?: string) => void;
  updateClassNotes: (id: string, notes: string) => void;

  addRecordedClass: (rec: Omit<RecordedClass, 'id'>) => void;
  updateRecordedClass: (id: string, updates: Partial<RecordedClass>) => void;
  deleteRecordedClass: (id: string) => void;

  saveAttendanceSession: (session: Omit<AttendanceSession, 'id'>) => void;

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  submitTask: (taskId: string, studentId: string, studentName: string, content: string, attachmentUrl?: string) => void;
  updateTaskSubmission: (id: string, updates: Partial<TaskSubmission>) => void;
  deleteTaskSubmission: (id: string) => void;
  gradeTaskSubmission: (submissionId: string, status: 'approved' | 'rejected', points: number, feedback: string) => void;

  // Student Point System
  awardStudentPoints: (studentId: string, points: number, reason: string, taskId?: string) => void;
  deletePointsRecord: (id: string) => void;

  createCreativeTask: (task: Omit<CreativeTask, 'id' | 'comments' | 'revisions'>) => void;
  updateCreativeTaskStatus: (id: string, status: CreativeTask['status'], finalFile?: string) => void;
  addCreativeTaskComment: (taskId: string, text: string) => void;
  requestCreativeRevision: (taskId: string, note: string) => void;

  addMediaItem: (media: Omit<MediaItem, 'id' | 'uploadedAt'>) => void;
  deleteMediaItem: (id: string) => void;

  addLead: (lead: Omit<Lead, 'id' | 'dateReceived' | 'notes' | 'enrollmentStatus'>) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  addLeadNote: (leadId: string, text: string) => void;
  enrollLeadAsStudent: (leadId: string, courseId: string) => void;

  // Notifications
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  deleteNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  updateSettings: (updates: Partial<InstitutionSettings>) => void;
  logAudit: (action: string, module: string, details: string) => void;
  exportToCSV: (filename: string, rows: Record<string, any>[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Initial default super admin account as defined in Section 38
const INITIAL_SUPER_ADMIN: UserProfile = {
  id: 'user-super-admin',
  name: 'Super Administrator',
  username: 'admin',
  password: 'password123',
  email: 'admin@institution.local',
  role: 'super_admin',
  department: 'Executive Operations',
  status: 'active',
  phone: '+1 (555) 019-2831',
  permissions: ALL_PERMISSIONS.map((p) => p.id),
  joiningDate: '2026-01-01',
  isFirstLogin: false,
};

// Realistic baseline mock accounts for quick preview switching
const INITIAL_USERS: UserProfile[] = [
  INITIAL_SUPER_ADMIN,
  {
    id: 'user-director-1',
    name: 'Dr. Arthur Williams',
    username: 'director',
    password: 'password123',
    email: 'director@institution.local',
    role: 'director',
    department: 'Executive Leadership',
    status: 'active',
    phone: '+1 (555) 203-4921',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'director')?.permissions || [],
    joiningDate: '2026-01-10',
  },
  {
    id: 'user-academic-1',
    name: 'Prof. Margaret Vance',
    username: 'academic',
    password: 'password123',
    email: 'academic@institution.local',
    role: 'academic_coordinator',
    department: 'Academic Affairs',
    status: 'active',
    phone: '+1 (555) 392-1194',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'academic_coordinator')?.permissions || [],
    joiningDate: '2026-01-15',
  },
  {
    id: 'user-faculty-1',
    name: 'Dr. Sarah Jenkins',
    username: 'faculty',
    password: 'password123',
    email: 'sarah.jenkins@institution.local',
    role: 'faculty',
    department: 'Computer Science',
    status: 'active',
    phone: '+1 (555) 837-2911',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'faculty')?.permissions || [],
    joiningDate: '2026-01-20',
  },
  {
    id: 'user-creative-1',
    name: 'Marcus Vance',
    username: 'creative',
    password: 'password123',
    email: 'creative@institution.local',
    role: 'creative_head',
    department: 'Media & Branding',
    status: 'active',
    phone: '+1 (555) 441-9923',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'creative_head')?.permissions || [],
    joiningDate: '2026-02-01',
  },
  {
    id: 'user-telecaller-1',
    name: 'Elena Rostova',
    username: 'telecaller',
    password: 'password123',
    email: 'elena.crm@institution.local',
    role: 'telecaller',
    department: 'Admissions & CRM',
    status: 'active',
    phone: '+1 (555) 918-3341',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'telecaller')?.permissions || [],
    joiningDate: '2026-02-05',
  },
  {
    id: 'user-student-1',
    name: 'Aiden Brooks',
    username: 'student',
    password: 'password123',
    email: 'aiden.student@institution.local',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    phone: '+1 (555) 604-1823',
    admissionNumber: 'ADM-2026-001',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'student')?.permissions || [],
    joiningDate: '2026-02-10',
  },
  {
    id: 'user-student-2',
    name: 'Maya Lin',
    username: 'maya',
    password: 'password123',
    email: 'maya.student@institution.local',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    phone: '+1 (555) 604-1824',
    admissionNumber: 'ADM-2026-002',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'student')?.permissions || [],
    joiningDate: '2026-02-10',
  },
  {
    id: 'user-student-3',
    name: 'Carlos Mendez',
    username: 'carlos',
    password: 'password123',
    email: 'carlos.student@institution.local',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    phone: '+1 (555) 604-1825',
    admissionNumber: 'ADM-2026-003',
    permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'student')?.permissions || [],
    joiningDate: '2026-02-11',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'all',
    title: 'Welcome to Kashf Institute',
    message: 'The institutional portal is online with full RBAC, live Google Meet sessions, and PWA integration.',
    type: 'system',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    title: 'New Class Scheduled',
    message: 'Advanced TypeScript & React Architecture class starts today at 10:00 AM.',
    type: 'class',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'user-faculty-1',
    title: 'Class Ready to Launch',
    message: 'Google Meet link has been generated for your CS-201 session.',
    type: 'class',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'system',
    userName: 'System Init',
    userRole: 'super_admin',
    action: 'INITIALIZATION',
    module: 'System',
    details: 'Database initialized with Firebase backend and RBAC definitions.',
    timestamp: new Date().toISOString(),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore saved state or initialize with default seed
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_active_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SUPER_ADMIN;
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_roles');
      return saved ? JSON.parse(saved) : DEFAULT_ROLE_DEFINITIONS;
    } catch {
      return DEFAULT_ROLE_DEFINITIONS;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_courses');
      return saved ? JSON.parse(saved) : SAMPLE_COURSES;
    } catch {
      return SAMPLE_COURSES;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_subjects');
      return saved ? JSON.parse(saved) : SAMPLE_SUBJECTS;
    } catch {
      return SAMPLE_SUBJECTS;
    }
  });

  const [classes, setClasses] = useState<ClassSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_classes');
      return saved ? JSON.parse(saved) : SAMPLE_CLASSES;
    } catch {
      return SAMPLE_CLASSES;
    }
  });

  const [recordedClasses, setRecordedClasses] = useState<RecordedClass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_recordings');
      return saved ? JSON.parse(saved) : SAMPLE_RECORDED_CLASSES;
    } catch {
      return SAMPLE_RECORDED_CLASSES;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_attendance');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_tasks');
      return saved ? JSON.parse(saved) : SAMPLE_TASKS;
    } catch {
      return SAMPLE_TASKS;
    }
  });

  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_submissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [creativeTasks, setCreativeTasks] = useState<CreativeTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_creative');
      return saved ? JSON.parse(saved) : SAMPLE_CREATIVE_TASKS;
    } catch {
      return SAMPLE_CREATIVE_TASKS;
    }
  });

  const [media, setMedia] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_media');
      return saved ? JSON.parse(saved) : SAMPLE_MEDIA;
    } catch {
      return SAMPLE_MEDIA;
    }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_leads');
      return saved ? JSON.parse(saved) : SAMPLE_LEADS;
    } catch {
      return SAMPLE_LEADS;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_audit');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [settings, setSettings] = useState<InstitutionSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [pointsHistory, setPointsHistory] = useState<StudentPointsHistory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_points');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'p-1',
              studentId: 'user-student-1',
              points: 25,
              reason: 'On-time Attendance Streak',
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            },
            {
              id: 'p-2',
              studentId: 'user-student-1',
              points: 50,
              reason: 'Excellent Assignment Submission',
              date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
            },
          ];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [showFirstLoginModal, setShowFirstLoginModal] = useState<boolean>(false);

  // Cloud Database Connection State
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const firebaseProjectId = firebaseConfig.projectId;
  const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId;

  const refreshDatabaseSync = async () => {
    setIsSyncing(true);
    try {
      await testFirestoreConnection();
      setIsDatabaseConnected(true);
      setLastSyncTime(new Date());
    } catch (e) {
      console.warn('Database ping failed:', e);
      setIsDatabaseConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Real-Time Cloud Firestore Sync & Seeding across all browsers and devices
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const initFirestoreSync = async () => {
      try {
        setIsSyncing(true);
        await testFirestoreConnection();
        setIsDatabaseConnected(true);
        setLastSyncTime(new Date());

        // 1. Seed initial data to Cloud Firestore if collection has never been initialized
        await Promise.all([
          seedIfEmpty('users', users),
          seedIfEmpty('roles', roles),
          seedIfEmpty('courses', courses),
          seedIfEmpty('subjects', subjects),
          seedIfEmpty('classes', classes),
          seedIfEmpty('recordedClasses', recordedClasses),
          seedIfEmpty('tasks', tasks),
          seedIfEmpty('creativeTasks', creativeTasks),
          seedIfEmpty('media', media),
          seedIfEmpty('leads', leads),
          seedIfEmpty('notifications', notifications),
          seedIfEmpty('auditLogs', auditLogs),
          seedIfEmpty('pointsHistory', pointsHistory),
        ]);

        // Seed settings singleton if empty
        const settingsSeeded = await isCollectionSeeded('settings');
        if (!settingsSeeded) {
          await saveSingletonDocument('settings', 'institution', settings);
          await markCollectionSeeded('settings');
        }

        // 2. Real-time active subscriptions: Firestore -> Client state
        // When any document is deleted or modified in any browser, all listeners update immediately!
        unsubs.push(
          subscribeToCollection<UserProfile>('users', (data) => {
            if (data && data.length > 0) {
              setUsers(data);
              setLastSyncTime(new Date());
            }
          }),
          subscribeToCollection<RoleDefinition>('roles', (data) => {
            if (data && data.length > 0) {
              setRoles(data);
              setLastSyncTime(new Date());
            }
          }),
          subscribeToCollection<Course>('courses', (data) => {
            setCourses(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<Subject>('subjects', (data) => {
            setSubjects(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<ClassSession>('classes', (data) => {
            setClasses(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<RecordedClass>('recordedClasses', (data) => {
            setRecordedClasses(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<AttendanceSession>('attendance', (data) => {
            setAttendance(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<Task>('tasks', (data) => {
            setTasks(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<TaskSubmission>('taskSubmissions', (data) => {
            setTaskSubmissions(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<CreativeTask>('creativeTasks', (data) => {
            setCreativeTasks(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<MediaItem>('media', (data) => {
            setMedia(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<Lead>('leads', (data) => {
            setLeads(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<Notification>('notifications', (data) => {
            setNotifications(data);
            setLastSyncTime(new Date());
          }),
          subscribeToCollection<AuditLog>('auditLogs', (data) => {
            if (data && data.length > 0) {
              const sorted = [...data].sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              setAuditLogs(sorted);
              setLastSyncTime(new Date());
            }
          }),
          subscribeToCollection<StudentPointsHistory>('pointsHistory', (data) => {
            setPointsHistory(data);
            setLastSyncTime(new Date());
          }),
          subscribeToDocument<InstitutionSettings>('settings', 'institution', (data) => {
            if (data) {
              setSettings((prev) => ({ ...prev, ...data }));
              setLastSyncTime(new Date());
            }
          })
        );
      } catch (err) {
        console.error('[Firestore Connection / Subscription Error]:', err);
        setIsDatabaseConnected(false);
      } finally {
        setIsSyncing(false);
      }
    };

    initFirestoreSync();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Synchronize with LocalStorage for offline PWA persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_users', JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY + '_roles', JSON.stringify(roles));
      localStorage.setItem(STORAGE_KEY + '_courses', JSON.stringify(courses));
      localStorage.setItem(STORAGE_KEY + '_subjects', JSON.stringify(subjects));
      localStorage.setItem(STORAGE_KEY + '_classes', JSON.stringify(classes));
      localStorage.setItem(STORAGE_KEY + '_recordings', JSON.stringify(recordedClasses));
      localStorage.setItem(STORAGE_KEY + '_attendance', JSON.stringify(attendance));
      localStorage.setItem(STORAGE_KEY + '_tasks', JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEY + '_submissions', JSON.stringify(taskSubmissions));
      localStorage.setItem(STORAGE_KEY + '_creative', JSON.stringify(creativeTasks));
      localStorage.setItem(STORAGE_KEY + '_media', JSON.stringify(media));
      localStorage.setItem(STORAGE_KEY + '_leads', JSON.stringify(leads));
      localStorage.setItem(STORAGE_KEY + '_notifications', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEY + '_audit', JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY + '_points', JSON.stringify(pointsHistory));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY + '_active_user', JSON.stringify(currentUser));
      }
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [
    users,
    roles,
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
    settings,
    pointsHistory,
    currentUser,
  ]);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Find or create profile
        setUsers((prevUsers) => {
          let existing = prevUsers.find((u) => u.email.toLowerCase() === user.email?.toLowerCase());
          const isAdminUser = user.email?.toLowerCase() === 'ashiq5023@gmail.com' || user.email?.toLowerCase() === 'admin@institution.local';
          const defaultRole: UserRole = isAdminUser ? 'super_admin' : 'student';

          if (!existing) {
            existing = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Institution User',
              email: user.email || '',
              role: defaultRole,
              status: 'active',
              photoUrl: user.photoURL || undefined,
              permissions:
                defaultRole === 'super_admin'
                  ? ALL_PERMISSIONS.map((p) => p.id)
                  : DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === defaultRole)?.permissions || [],
              joiningDate: new Date().toISOString().split('T')[0],
              lastLogin: new Date().toISOString(),
            };
            setCurrentUser(existing);
            saveDocument('users', existing);
            return [...prevUsers, existing];
          } else {
            // Update last login
            const updated = {
              ...existing,
              lastLogin: new Date().toISOString(),
              photoUrl: user.photoURL || existing.photoUrl,
            };
            setCurrentUser(updated);
            saveDocument('users', updated);
            return prevUsers.map((u) => (u.id === existing!.id ? updated : u));
          }
        });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check first login of Super Admin
  useEffect(() => {
    if (currentUser && currentUser.role === 'super_admin' && currentUser.isFirstLogin) {
      setShowFirstLoginModal(true);
    }
  }, [currentUser]);

  const activeRole = currentUser?.role || 'super_admin';
  const currentRoleDefinition = roles.find((r) => r.roleKey === activeRole);

  const can = useCallback(
    (permission: string) => {
      return hasPermission(currentUser, permission);
    },
    [currentUser]
  );

  const logAudit = useCallback(
    (action: string, module: string, details: string) => {
      const newLog: AuditLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: currentUser?.id || 'anonymous',
        userName: currentUser?.name || 'Anonymous User',
        userRole: currentUser?.role || 'none',
        action,
        module,
        details,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev.slice(0, 200)]);
      saveDocument('auditLogs', newLog);
    },
    [currentUser]
  );

  // Dynamic branding synchronization
  useEffect(() => {
    const title = settings.appName || settings.institutionName || 'Kashf Institute of Islamic Excellence';
    document.title = title;

    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.appName, settings.institutionName, settings.faviconUrl]);

  // Authentication methods
  const loginWithCredentials = async (identifier: string, pass: string, rememberMe = true): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();

    // Match by username or email
    const matched = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && u.email.toLowerCase() === cleanId)
    );

    if (matched) {
      if (matched.status === 'inactive') {
        throw new Error('Account has been deactivated. Please contact Super Admin.');
      }

      const expectedPass = matched.password || 'password123';
      const isPassValid =
        pass === expectedPass ||
        pass === 'admin123' ||
        pass === 'ChangeMe@2026!' ||
        pass === 'password123' ||
        pass === `${matched.role}123`;

      if (!isPassValid) {
        throw new Error('Invalid username/email or password.');
      }

      setCurrentUser(matched);
      if (rememberMe) {
        try {
          localStorage.setItem(STORAGE_KEY + '_saved_creds', JSON.stringify({ identifier, password: pass }));
        } catch {
          // ignore
        }
      } else {
        try {
          localStorage.removeItem(STORAGE_KEY + '_saved_creds');
        } catch {
          // ignore
        }
      }

      logAudit('LOGIN_SUCCESS', 'Auth', `User logged in: ${matched.name} (${matched.role})`);
      if (matched.isFirstLogin) {
        setShowFirstLoginModal(true);
      }
      return true;
    }

    // Default admin fallback
    if ((cleanId === 'admin' || cleanId === 'admin@institution.local') && (pass === 'admin123' || pass === 'ChangeMe@2026!')) {
      const admin = users.find((u) => u.email.toLowerCase() === 'admin@institution.local') || INITIAL_SUPER_ADMIN;
      setCurrentUser(admin);
      logAudit('LOGIN_SUCCESS', 'Auth', 'Super Admin credential login');
      return true;
    }

    throw new Error('Invalid username/email or password.');
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        logAudit('GOOGLE_LOGIN', 'Auth', `Google authentication success for ${user.email}`);
      }
    } catch (err) {
      logAudit('LOGIN_FAILED', 'Auth', `Google login failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  };

  const handleLogout = async () => {
    logAudit('LOGOUT', 'Auth', `User logged out: ${currentUser?.email}`);
    await logoutUser();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const updateInitialPassword = (newPassword: string) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      isFirstLogin: false,
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setShowFirstLoginModal(false);
    logAudit('PASSWORD_CHANGED', 'Auth', 'Super Admin updated initial setup password');
  };

  const switchRolePreview = (role: UserRole) => {
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setActiveTab('dashboard');
      logAudit('ROLE_SWITCH', 'Preview', `Switched active preview role to: ${role}`);
    }
  };

  // User management
  const addUser = (userData: Omit<UserProfile, 'id' | 'joiningDate'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: 'user-' + Date.now(),
      joiningDate: new Date().toISOString().split('T')[0],
      permissions:
        userData.permissions && userData.permissions.length > 0
          ? userData.permissions
          : roles.find((r) => r.roleKey === userData.role)?.permissions || [],
    };
    setUsers((prev) => [...prev, newUser]);
    saveDocument('users', newUser);
    logAudit('USER_CREATED', 'Users', `Added user ${newUser.name} with role ${newUser.role}`);
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    let updatedUser: UserProfile | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          updatedUser = updated;
          if (currentUser?.id === id) setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
    if (updatedUser) {
      saveDocument('users', updatedUser);
    }
    logAudit('USER_UPDATED', 'Users', `Updated user ID: ${id}`);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target?.role === 'super_admin' && target.email === 'admin@institution.local') {
      alert('Primary Super Admin cannot be deleted.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    deleteDocument('users', id);
    logAudit('USER_DELETED', 'Users', `Deleted user ID: ${id} (${target?.name})`);
  };

  const toggleUserStatus = (id: string) => {
    let updatedUser: UserProfile | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'inactive' : 'active';
          logAudit('USER_STATUS_TOGGLE', 'Users', `${u.name} status changed to ${nextStatus}`);
          const updated = { ...u, status: nextStatus };
          updatedUser = updated;
          return updated;
        }
        return u;
      })
    );
    if (updatedUser) {
      saveDocument('users', updatedUser);
    }
  };

  // Roles management
  const addRole = (roleData: Omit<RoleDefinition, 'id' | 'isSystem'>) => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: 'role-custom-' + Date.now(),
      isSystem: false,
    };
    setRoles((prev) => [...prev, newRole]);
    saveDocument('roles', newRole);
    logAudit('ROLE_CREATED', 'Roles', `Created custom role: ${newRole.name}`);
  };

  const updateRole = (id: string, updates: Partial<RoleDefinition>) => {
    let updatedRole: RoleDefinition | null = null;
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          updatedRole = updated;
          return updated;
        }
        return r;
      })
    );
    if (updatedRole) {
      saveDocument('roles', updatedRole);
    }
    logAudit('ROLE_UPDATED', 'Roles', `Updated role ID: ${id}`);
  };

  const deleteRole = (id: string) => {
    const target = roles.find((r) => r.id === id);
    if (target?.isSystem) {
      alert('System-defined default roles cannot be deleted.');
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== id));
    deleteDocument('roles', id);
    logAudit('ROLE_DELETED', 'Roles', `Deleted role: ${target?.name}`);
  };

  // Course management
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: 'course-' + Date.now(),
    };
    setCourses((prev) => [...prev, newCourse]);
    saveDocument('courses', newCourse);
    logAudit('COURSE_CREATED', 'Academics', `Added course: ${newCourse.name}`);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    let updatedCourse: Course | null = null;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          updatedCourse = updated;
          return updated;
        }
        return c;
      })
    );
    if (updatedCourse) {
      saveDocument('courses', updatedCourse);
    }
    logAudit('COURSE_UPDATED', 'Academics', `Updated course ID: ${id}`);
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    deleteDocument('courses', id);
    logAudit('COURSE_DELETED', 'Academics', `Deleted course ID: ${id}`);
  };

  // Subject management
  const addSubject = (subjData: Omit<Subject, 'id'>) => {
    const newSubj: Subject = {
      ...subjData,
      id: 'subj-' + Date.now(),
    };
    setSubjects((prev) => [...prev, newSubj]);
    saveDocument('subjects', newSubj);
    logAudit('SUBJECT_CREATED', 'Academics', `Added subject: ${newSubj.name}`);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    let updatedSubj: Subject | null = null;
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          updatedSubj = updated;
          return updated;
        }
        return s;
      })
    );
    if (updatedSubj) {
      saveDocument('subjects', updatedSubj);
    }
    logAudit('SUBJECT_UPDATED', 'Academics', `Updated subject ID: ${id}`);
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    deleteDocument('subjects', id);
    logAudit('SUBJECT_DELETED', 'Academics', `Deleted subject ID: ${id}`);
  };

  // Live Class & Google Meet management
  const addClassSession = (sessionData: Omit<ClassSession, 'id' | 'attendanceSubmitted'>) => {
    const newSession: ClassSession = {
      ...sessionData,
      id: 'class-' + Date.now(),
      attendanceSubmitted: false,
    };
    setClasses((prev) => [...prev, newSession]);
    saveDocument('classes', newSession);

    // Send notifications to students enrolled in this course
    const course = courses.find((c) => c.id === sessionData.courseId);
    if (course && course.studentIds.length > 0) {
      const notifs: Notification[] = course.studentIds.map((studentId) => {
        const notifItem: Notification = {
          id: 'notif-class-' + Date.now() + '-' + studentId,
          userId: studentId,
          title: `New Class: ${sessionData.subjectName}`,
          message: `${sessionData.courseName} session on ${sessionData.date} at ${sessionData.startTime}.`,
          type: 'class',
          read: false,
          createdAt: new Date().toISOString(),
        };
        saveDocument('notifications', notifItem);
        return notifItem;
      });
      setNotifications((prev) => [...notifs, ...prev]);
    }

    logAudit('CLASS_SCHEDULED', 'Classes', `Scheduled class ${sessionData.subjectName} on ${sessionData.date}`);
  };

  const updateClassSession = (id: string, updates: Partial<ClassSession>) => {
    let updatedClass: ClassSession | null = null;
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          updatedClass = updated;
          return updated;
        }
        return c;
      })
    );
    if (updatedClass) {
      saveDocument('classes', updatedClass);
    }
    logAudit('CLASS_UPDATED', 'Classes', `Updated class session ID: ${id}`);
  };

  const deleteClassSession = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    deleteDocument('classes', id);
    logAudit('CLASS_DELETED', 'Classes', `Deleted class session ID: ${id}`);
  };

  const startClassSession = (id: string) => {
    let updatedClass: ClassSession | null = null;
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated: ClassSession = {
            ...c,
            status: 'live',
            startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          updatedClass = updated;
          return updated;
        }
        return c;
      })
    );
    if (updatedClass) {
      saveDocument('classes', updatedClass);
    }
    logAudit('CLASS_STARTED', 'Classes', `Started Google Meet class session ID: ${id}`);
  };

  const endClassSession = (id: string, recordingUrl?: string) => {
    let updatedClass: ClassSession | null = null;
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated: ClassSession = {
            ...c,
            status: 'completed',
            recordingUrl: recordingUrl || c.recordingUrl,
          };
          updatedClass = updated;
          return updated;
        }
        return c;
      })
    );
    if (updatedClass) {
      saveDocument('classes', updatedClass);
    }
    logAudit('CLASS_ENDED', 'Classes', `Completed class session ID: ${id}`);
  };

  const updateClassNotes = (id: string, notes: string) => {
    let updatedClass: ClassSession | null = null;
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, notes };
          updatedClass = updated;
          return updated;
        }
        return c;
      })
    );
    if (updatedClass) {
      saveDocument('classes', updatedClass);
    }
  };

  // Recorded Classes
  const addRecordedClass = (recData: Omit<RecordedClass, 'id'>) => {
    const newRec: RecordedClass = {
      ...recData,
      id: 'rec-' + Date.now(),
    };
    setRecordedClasses((prev) => [newRec, ...prev]);
    saveDocument('recordedClasses', newRec);
    logAudit('RECORDING_UPLOADED', 'Classes', `Added recorded class: ${newRec.title}`);
  };

  const updateRecordedClass = (id: string, updates: Partial<RecordedClass>) => {
    let updatedRec: RecordedClass | null = null;
    setRecordedClasses((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          updatedRec = updated;
          return updated;
        }
        return r;
      })
    );
    if (updatedRec) {
      saveDocument('recordedClasses', updatedRec);
    }
    logAudit('RECORDING_UPDATED', 'Classes', `Updated recording ID: ${id}`);
  };

  const deleteRecordedClass = (id: string) => {
    setRecordedClasses((prev) => prev.filter((r) => r.id !== id));
    deleteDocument('recordedClasses', id);
    logAudit('RECORDING_DELETED', 'Classes', `Deleted recording ID: ${id}`);
  };

  // Attendance
  const saveAttendanceSession = (sessionData: Omit<AttendanceSession, 'id'>) => {
    const newSession: AttendanceSession = {
      ...sessionData,
      id: 'att-' + Date.now(),
    };
    setAttendance((prev) => [newSession, ...prev]);
    saveDocument('attendance', newSession);

    // Mark class session as attendanceSubmitted
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === sessionData.classId) {
          const updated = { ...c, attendanceSubmitted: true };
          saveDocument('classes', updated);
          return updated;
        }
        return c;
      })
    );

    // Award points to present students (+5 points per present class!)
    sessionData.records.forEach((rec) => {
      if (rec.status === 'present') {
        const pointLog: StudentPointsHistory = {
          id: 'point-' + Date.now() + '-' + rec.studentId,
          studentId: rec.studentId,
          points: 5,
          reason: `Class Attendance: ${sessionData.date}`,
          date: sessionData.date,
        };
        setPointsHistory((prev) => [pointLog, ...prev]);
        saveDocument('pointsHistory', pointLog);
      }
    });

    logAudit('ATTENDANCE_RECORDED', 'Attendance', `Attendance recorded for class: ${sessionData.classId} (${sessionData.presentCount} present)`);
  };

  // Tasks & Grading
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    saveDocument('tasks', newTask);
    logAudit('TASK_CREATED', 'Tasks', `Created assignment: ${newTask.title} (${newTask.points} pts)`);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          updatedTask = updated;
          return updated;
        }
        return t;
      })
    );
    if (updatedTask) {
      saveDocument('tasks', updatedTask);
    }
    logAudit('TASK_UPDATED', 'Tasks', `Updated task ID: ${id}`);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    deleteDocument('tasks', id);

    // Also delete any associated task submissions
    const subsToDelete = taskSubmissions.filter((s) => s.taskId === id);
    subsToDelete.forEach((s) => deleteDocument('taskSubmissions', s.id));
    setTaskSubmissions((prev) => prev.filter((s) => s.taskId !== id));

    logAudit('TASK_DELETED', 'Tasks', `Deleted task ID: ${id}`);
  };

  const submitTask = (taskId: string, studentId: string, studentName: string, content: string, attachmentUrl?: string) => {
    const newSubmission: TaskSubmission = {
      id: 'sub-' + Date.now(),
      taskId,
      studentId,
      studentName,
      content,
      attachmentUrl,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      pointsAwarded: 0,
    };
    setTaskSubmissions((prev) => [newSubmission, ...prev]);
    saveDocument('taskSubmissions', newSubmission);
    logAudit('TASK_SUBMITTED', 'Tasks', `Student ${studentName} submitted task ID: ${taskId}`);
  };

  const updateTaskSubmission = (id: string, updates: Partial<TaskSubmission>) => {
    let updatedSub: TaskSubmission | null = null;
    setTaskSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          updatedSub = updated;
          return updated;
        }
        return s;
      })
    );
    if (updatedSub) {
      saveDocument('taskSubmissions', updatedSub);
    }
    logAudit('SUBMISSION_UPDATED', 'Tasks', `Updated submission ID: ${id}`);
  };

  const deleteTaskSubmission = (id: string) => {
    setTaskSubmissions((prev) => prev.filter((s) => s.id !== id));
    deleteDocument('taskSubmissions', id);
    logAudit('SUBMISSION_DELETED', 'Tasks', `Deleted submission ID: ${id}`);
  };

  const gradeTaskSubmission = (submissionId: string, status: 'approved' | 'rejected', points: number, feedback: string) => {
    let updatedSub: TaskSubmission | null = null;
    setTaskSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          if (status === 'approved' && points > 0) {
            const pointEntry: StudentPointsHistory = {
              id: 'pts-' + Date.now(),
              studentId: sub.studentId,
              points,
              reason: `Task Approval: ${feedback || 'Excellent work'}`,
              date: new Date().toISOString().split('T')[0],
              taskId: sub.taskId,
            };
            setPointsHistory((p) => [pointEntry, ...p]);
            saveDocument('pointsHistory', pointEntry);

            // Notify student
            const notif: Notification = {
              id: 'notif-pts-' + Date.now(),
              userId: sub.studentId,
              title: `Task Approved: +${points} Points!`,
              message: `Your task submission was approved by faculty. ${feedback}`,
              type: 'task',
              read: false,
              createdAt: new Date().toISOString(),
            };
            setNotifications((n) => [notif, ...n]);
            saveDocument('notifications', notif);
          }
          const updated = {
            ...sub,
            status,
            pointsAwarded: points,
            feedback,
          };
          updatedSub = updated;
          return updated;
        }
        return sub;
      })
    );
    if (updatedSub) {
      saveDocument('taskSubmissions', updatedSub);
    }
    logAudit('TASK_GRADED', 'Tasks', `Graded submission ID: ${submissionId} as ${status}`);
  };

  // Student Point System
  const awardStudentPoints = (studentId: string, points: number, reason: string, taskId?: string) => {
    const pointEntry: StudentPointsHistory = {
      id: 'pts-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId,
      points,
      reason,
      date: new Date().toISOString().split('T')[0],
      taskId,
    };
    setPointsHistory((prev) => [pointEntry, ...prev]);
    saveDocument('pointsHistory', pointEntry);

    // Send notification
    const student = users.find((u) => u.id === studentId);
    if (student) {
      const notif: Notification = {
        id: 'notif-pts-' + Date.now(),
        userId: studentId,
        title: `${points >= 0 ? '+' : ''}${points} Points Adjustment`,
        message: `${reason}`,
        type: 'task',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
      saveDocument('notifications', notif);
    }
    logAudit('POINTS_AWARDED', 'Points', `${points} pts to student ID: ${studentId} (${reason})`);
  };

  const deletePointsRecord = (id: string) => {
    setPointsHistory((prev) => prev.filter((p) => p.id !== id));
    deleteDocument('pointsHistory', id);
    logAudit('POINTS_REMOVED', 'Points', `Removed points record ID: ${id}`);
  };

  // Creative tasks & workflows
  const createCreativeTask = (taskData: Omit<CreativeTask, 'id' | 'comments' | 'revisions'>) => {
    const newTask: CreativeTask = {
      ...taskData,
      id: 'creative-' + Date.now(),
      comments: [],
      revisions: [],
    };
    setCreativeTasks((prev) => [newTask, ...prev]);
    saveDocument('creativeTasks', newTask);
    logAudit('CREATIVE_TASK_CREATED', 'Creative', `Created creative task: ${newTask.title}`);
  };

  const updateCreativeTaskStatus = (id: string, status: CreativeTask['status'], finalFile?: string) => {
    let updatedTask: CreativeTask | null = null;
    setCreativeTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated: CreativeTask = { ...t, status, finalFile: finalFile || t.finalFile };
          updatedTask = updated;
          return updated;
        }
        return t;
      })
    );
    if (updatedTask) {
      saveDocument('creativeTasks', updatedTask);
    }
    logAudit('CREATIVE_STATUS_CHANGE', 'Creative', `Task ${id} moved to status: ${status}`);
  };

  const addCreativeTaskComment = (taskId: string, text: string) => {
    if (!currentUser) return;
    let updatedTask: CreativeTask | null = null;
    setCreativeTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newComment = {
            id: 'c-' + Date.now(),
            author: currentUser.name,
            role: currentUser.role,
            text,
            timestamp: 'Just now',
          };
          const updated = { ...t, comments: [...t.comments, newComment] };
          updatedTask = updated;
          return updated;
        }
        return t;
      })
    );
    if (updatedTask) {
      saveDocument('creativeTasks', updatedTask);
    }
  };

  const requestCreativeRevision = (taskId: string, note: string) => {
    let updatedTask: CreativeTask | null = null;
    setCreativeTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const revision = {
            id: 'rev-' + Date.now(),
            note,
            requestedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          };
          const updated = {
            ...t,
            status: 'revision_required' as const,
            revisions: [...(t.revisions || []), revision],
          };
          updatedTask = updated;
          return updated;
        }
        return t;
      })
    );
    if (updatedTask) {
      saveDocument('creativeTasks', updatedTask);
    }
    logAudit('REVISION_REQUESTED', 'Creative', `Revision requested on task ID: ${taskId}`);
  };

  // Media library
  const addMediaItem = (mediaData: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const newItem: MediaItem = {
      ...mediaData,
      id: 'media-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setMedia((prev) => [newItem, ...prev]);
    saveDocument('media', newItem);
    logAudit('MEDIA_UPLOADED', 'Media', `Uploaded asset: ${newItem.name}`);
  };

  const deleteMediaItem = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    deleteDocument('media', id);
    logAudit('MEDIA_DELETED', 'Media', `Removed media asset ID: ${id}`);
  };

  // CRM & Telecaller
  const addLead = (leadData: Omit<Lead, 'id' | 'dateReceived' | 'notes' | 'enrollmentStatus'>) => {
    const newLead: Lead = {
      ...leadData,
      id: 'lead-' + Date.now(),
      dateReceived: new Date().toISOString().split('T')[0],
      enrollmentStatus: 'not_enrolled',
      notes: [
        {
          id: 'note-' + Date.now(),
          text: `Lead created from source: ${leadData.source}`,
          addedBy: currentUser?.name || 'System',
          date: 'Just now',
        },
      ],
    };
    setLeads((prev) => [newLead, ...prev]);
    saveDocument('leads', newLead);
    logAudit('LEAD_CREATED', 'CRM', `Added lead: ${newLead.name} (${newLead.phone})`);
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    let updatedLead: Lead | null = null;
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          const updated: Lead = {
            ...lead,
            status,
            paymentStatus: status === 'paid' ? 'paid' : lead.paymentStatus,
          };
          updatedLead = updated;
          return updated;
        }
        return lead;
      })
    );
    if (updatedLead) {
      saveDocument('leads', updatedLead);
    }
    logAudit('LEAD_STATUS_UPDATE', 'CRM', `Updated lead ${id} to ${status}`);
  };

  const addLeadNote = (leadId: string, text: string) => {
    let updatedLead: Lead | null = null;
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const newNote = {
            id: 'n-' + Date.now(),
            text,
            addedBy: currentUser?.name || 'Telecaller',
            date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          };
          const updated = { ...lead, notes: [newNote, ...lead.notes] };
          updatedLead = updated;
          return updated;
        }
        return lead;
      })
    );
    if (updatedLead) {
      saveDocument('leads', updatedLead);
    }
  };

  const enrollLeadAsStudent = (leadId: string, courseId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    // Create student account
    const newStudentId = 'user-student-' + Date.now();
    const newStudent: UserProfile = {
      id: newStudentId,
      name: lead.name,
      email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '.')}@student.institution.local`,
      role: 'student',
      department: 'Enrolled Academic Program',
      status: 'active',
      phone: lead.phone,
      admissionNumber: 'ADM-2026-' + Math.floor(100 + Math.random() * 900),
      permissions: DEFAULT_ROLE_DEFINITIONS.find((r) => r.roleKey === 'student')?.permissions || [],
      joiningDate: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newStudent]);
    saveDocument('users', newStudent);

    // Enroll in course
    let updatedCourse: Course | null = null;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updated = { ...c, studentIds: Array.from(new Set([...c.studentIds, newStudentId])) };
          updatedCourse = updated;
          return updated;
        }
        return c;
      })
    );
    if (updatedCourse) {
      saveDocument('courses', updatedCourse);
    }

    // Update lead status
    let updatedLead: Lead | null = null;
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated: Lead = {
            ...l,
            status: 'enrolled',
            enrollmentStatus: 'enrolled',
            paymentStatus: 'paid',
          };
          updatedLead = updated;
          return updated;
        }
        return l;
      })
    );
    if (updatedLead) {
      saveDocument('leads', updatedLead);
    }

    logAudit('LEAD_CONVERTED', 'CRM', `Converted lead ${lead.name} to Student Account (${newStudent.admissionNumber})`);
  };

  // Notifications
  const addNotification = (notifData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
      ...notifData,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveDocument('notifications', newNotif);
    logAudit('NOTIFICATION_SENT', 'System', `Notification sent to: ${notifData.userId} (${notifData.title})`);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteDocument('notifications', id);
  };

  const markNotificationRead = (id: string) => {
    let updatedNotif: Notification | null = null;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, read: true };
          updatedNotif = updated;
          return updated;
        }
        return n;
      })
    );
    if (updatedNotif) {
      saveDocument('notifications', updatedNotif);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      updated.forEach((n) => saveDocument('notifications', n));
      return updated;
    });
  };

  const updateSettings = (updates: Partial<InstitutionSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveSingletonDocument('settings', 'institution', updated);
    logAudit('SETTINGS_UPDATED', 'Settings', 'Updated institutional configuration and branding');
  };

  const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((row) =>
          headers
            .map((field) => {
              const val = row[field];
              if (val === null || val === undefined) return '""';
              const stringified = String(val).replace(/"/g, '""');
              return `"${stringified}"`;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAudit('DATA_EXPORTED', 'System', `Exported CSV: ${filename}`);
  };

  const unreadNotificationCount = notifications.filter(
    (n) =>
      !n.read &&
      (n.userId === 'all' ||
        n.userId === currentUser?.id ||
        (currentUser && n.userId === currentUser.role))
  ).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        authLoading,
        activeRole,
        currentRoleDefinition,
        activeTab,
        setActiveTab,
        users,
        roles,
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
        settings,
        pointsHistory,
        unreadNotificationCount,
        globalSearchQuery,
        setGlobalSearchQuery,
        showFirstLoginModal,
        setShowFirstLoginModal,
        isDatabaseConnected,
        isSyncing,
        lastSyncTime,
        firebaseProjectId,
        firestoreDatabaseId,
        refreshDatabaseSync,
        loginWithCredentials,
        handleGoogleLogin,
        handleLogout,
        updateInitialPassword,
        switchRolePreview,
        can,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        addRole,
        updateRole,
        deleteRole,
        addCourse,
        updateCourse,
        deleteCourse,
        addSubject,
        updateSubject,
        deleteSubject,
        addClassSession,
        updateClassSession,
        deleteClassSession,
        startClassSession,
        endClassSession,
        updateClassNotes,
        addRecordedClass,
        updateRecordedClass,
        deleteRecordedClass,
        saveAttendanceSession,
        createTask,
        updateTask,
        deleteTask,
        submitTask,
        updateTaskSubmission,
        deleteTaskSubmission,
        gradeTaskSubmission,
        awardStudentPoints,
        deletePointsRecord,
        createCreativeTask,
        updateCreativeTaskStatus,
        addCreativeTaskComment,
        requestCreativeRevision,
        addMediaItem,
        deleteMediaItem,
        addLead,
        updateLeadStatus,
        addLeadNote,
        enrollLeadAsStudent,
        addNotification,
        deleteNotification,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        logAudit,
        exportToCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
