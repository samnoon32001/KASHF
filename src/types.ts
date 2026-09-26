export type UserRole =
  | 'super_admin'
  | 'director'
  | 'academic_coordinator'
  | 'creative_head'
  | 'faculty'
  | 'telecaller'
  | 'student';

export type RoleType = UserRole;

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type MediaCategory =
  | 'Posters'
  | 'Videos'
  | 'Reels'
  | 'Photos'
  | 'Documents'
  | 'Logos'
  | 'Certificates'
  | 'Social Media'
  | 'Website Assets';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status: 'active' | 'inactive';
  phone?: string;
  photoUrl?: string;
  permissions: string[];
  joiningDate: string;
  lastLogin?: string;
  isFirstLogin?: boolean;
  admissionNumber?: string; // for students
}

export interface RoleDefinition {
  id: string;
  roleKey: UserRole | string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  status: 'active' | 'upcoming' | 'completed' | 'archived';
  image?: string;
  facultyIds: string[];
  studentIds: string[];
  startDate: string;
  endDate?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  courseId: string;
  courseName?: string;
  facultyId: string;
  facultyName?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface ClassSession {
  id: string;
  courseId: string;
  subjectId: string;
  facultyId: string;
  courseName: string;
  subjectName: string;
  facultyName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetUrl: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  attendanceSubmitted: boolean;
  recordingUrl?: string;
  notes?: string;
  startedAt?: string;
}

export interface RecordedClass {
  id: string;
  courseId: string;
  subjectId: string;
  facultyId: string;
  courseName: string;
  subjectName: string;
  facultyName: string;
  classDate: string;
  title: string;
  description: string;
  driveUrl: string;
  thumbnail?: string;
  duration: string;
  status: 'published' | 'draft';
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  courseId: string;
  subjectId: string;
  facultyId: string;
  date: string;
  records: AttendanceRecord[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  courseId: string;
  subjectId: string;
  courseName: string;
  subjectName: string;
  assignedTo: string[] | 'all';
  dueDate: string;
  points: number;
  attachmentUrl?: string;
  status: 'active' | 'closed';
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachmentUrl?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  pointsAwarded: number;
  feedback?: string;
}

export interface StudentPointsHistory {
  id: string;
  studentId: string;
  points: number;
  reason: string;
  date: string;
  taskId?: string;
}

export type CreativeTaskType =
  | 'poster'
  | 'social_post'
  | 'reel'
  | 'video_edit'
  | 'event_banner'
  | 'certificate'
  | 'presentation'
  | 'website_update'
  | 'landing_page'
  | 'campaign'
  | 'thumbnail';

export type CreativeTaskStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'review'
  | 'revision_required'
  | 'approved'
  | 'completed';

export interface CreativeTask {
  id: string;
  title: string;
  description: string;
  type: CreativeTaskType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedName?: string;
  deadline: string;
  brief?: string;
  referenceFiles?: string[];
  status: CreativeTaskStatus;
  finalFile?: string;
  comments: {
    id: string;
    author: string;
    role: string;
    text: string;
    timestamp: string;
  }[];
  revisions?: {
    id: string;
    note: string;
    requestedAt: string;
    completedAt?: string;
  }[];
}

export interface MediaItem {
  id: string;
  name: string;
  category:
    | 'Posters'
    | 'Videos'
    | 'Reels'
    | 'Photos'
    | 'Documents'
    | 'Logos'
    | 'Certificates'
    | 'Social Media'
    | 'Website Assets';
  url: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
  tags: string[];
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'follow_up'
  | 'confirmed'
  | 'payment_pending'
  | 'paid'
  | 'enrolled'
  | 'not_interested'
  | 'lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  courseInterested: string;
  source: 'Meta Lead Ads' | 'Instagram Ad' | 'Website' | 'Referral' | 'Walk-in' | 'Google Search' | 'Other';
  campaign: string;
  adName?: string;
  status: LeadStatus;
  assignedTo: string;
  assignedName?: string;
  dateReceived: string;
  followUpDate?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  enrollmentStatus: 'not_enrolled' | 'enrolled';
  notes: {
    id: string;
    text: string;
    addedBy: string;
    date: string;
  }[];
}

export interface Notification {
  id: string;
  userId: string; // specific user ID or 'all' or role string
  title: string;
  message: string;
  type: 'class' | 'task' | 'attendance' | 'creative' | 'lead' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface InstitutionSettings {
  institutionName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  googleMeetEnabled: boolean;
  metaLeadAdsConnected: boolean;
  metaAdAccountId?: string;
  setupChecklistCompleted: boolean;
}
