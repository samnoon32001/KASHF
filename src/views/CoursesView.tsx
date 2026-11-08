'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Calendar,
  Clock,
  Video,
  ChevronRight,
  GraduationCap,
  Sparkles,
  FileText,
  CheckCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Edit,
  AlertTriangle,
  X,
  UserPlus,
  UserMinus,
  TrendingUp,
  Award,
  CheckSquare,
  Square,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course, Subject, UserProfile } from '../types';
import { StudentProgressModal } from '../components/StudentProgressModal';

export const CoursesView: React.FC = () => {
  const {
    courses,
    subjects,
    users,
    addCourse,
    updateCourse,
    deleteCourse,
    addSubject,
    updateSubject,
    deleteSubject,
    addUser,
    enrollStudentsInCourse,
    removeStudentFromCourse,
    attendance,
    tasks,
    taskSubmissions,
    pointsHistory,
    exportToCSV,
    can,
    currentUser,
    setActiveTab,
    globalSearchQuery,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
      const match = courses.find(
        (c) =>
          c.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(globalSearchQuery.toLowerCase())
      );
      if (match) setSelectedCourse(match);
    }
  }, [globalSearchQuery, courses]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // New Course Form State
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCategory, setCourseCategory] = useState('Computer Science');
  const [courseDuration, setCourseDuration] = useState('6 Months');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseImage, setCourseImage] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80');

  // Edit Course Form State
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState('');
  const [editCourseDuration, setEditCourseDuration] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCourseImage, setEditCourseImage] = useState('');
  const [editCourseStatus, setEditCourseStatus] = useState<Course['status']>('active');

  // New Subject Form State
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectFacultyId, setSubjectFacultyId] = useState('');

  // Edit Subject Form State
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editSubjectFacultyId, setEditSubjectFacultyId] = useState('');
  const [editSubjectDescription, setEditSubjectDescription] = useState('');
  const [editSubjectStatus, setEditSubjectStatus] = useState<Subject['status']>('active');

  const canEdit = can('courses.edit') || currentUser?.role === 'super_admin';
  const canEnrollStudents = can('courses.enroll') || currentUser?.role === 'super_admin';
  const canReviewProgress = can('students.progress') || currentUser?.role === 'super_admin';
  const facultyMembers = users.filter((u) => u.role === 'faculty');
  const studentsList = users.filter((u) => u.role === 'student');

  // Enroll Students Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedEnrollIds, setSelectedEnrollIds] = useState<string[]>([]);
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollTab, setEnrollTab] = useState<'existing' | 'new'>('existing');
  const [quickStudentName, setQuickStudentName] = useState('');
  const [quickStudentEmail, setQuickStudentEmail] = useState('');
  const [quickStudentPassword, setQuickStudentPassword] = useState('Student@2026#Secure');
  const [quickStudentAdmission, setQuickStudentAdmission] = useState('');
  const [enrollFeedback, setEnrollFeedback] = useState('');

  // Unenroll Confirmation State
  const [studentToUnenroll, setStudentToUnenroll] = useState<UserProfile | null>(null);

  // Student Progress Modal State
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState<UserProfile | null>(null);

  // Cohort Progress Overview Modal State
  const [showCohortProgressModal, setShowCohortProgressModal] = useState(false);
  const [cohortSearch, setCohortSearch] = useState('');

  // Helper function to calculate student quick stats in a course
  const getStudentCourseStats = (studentId: string, courseId: string) => {
    const courseSessions = attendance.filter((a) => a.courseId === courseId);
    let present = 0;
    let totalSessions = 0;
    courseSessions.forEach((sess) => {
      const rec = sess.records?.find((r) => r.studentId === studentId);
      if (rec) {
        totalSessions++;
        if (rec.status === 'present' || rec.status === 'late') present++;
      }
    });
    const attnRate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 100;

    const courseTasks = tasks.filter((t) => t.courseId === courseId);
    const submissions = taskSubmissions.filter(
      (sub) => sub.studentId === studentId && courseTasks.some((t) => t.id === sub.taskId)
    );
    const taskRate = courseTasks.length > 0 ? Math.round((submissions.length / courseTasks.length) * 100) : 100;

    const pts = pointsHistory
      .filter((p) => p.studentId === studentId)
      .reduce((sum, p) => sum + (p.points || 0), 0);

    return {
      attnRate,
      taskRate,
      pts,
      submittedTasks: submissions.length,
      totalTasks: courseTasks.length,
      totalSessions,
    };
  };

  const handleOpenEnrollModal = () => {
    if (!selectedCourse) return;
    setSelectedEnrollIds([...selectedCourse.studentIds]);
    setEnrollSearch('');
    setEnrollTab('existing');
    setQuickStudentAdmission('ADM-2026-' + Math.floor(100 + Math.random() * 900));
    setEnrollFeedback('');
    setShowEnrollModal(true);
  };

  const handleToggleEnrollId = (studentId: string) => {
    setSelectedEnrollIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveEnrollments = () => {
    if (!selectedCourse) return;
    enrollStudentsInCourse(selectedCourse.id, selectedEnrollIds);
    setSelectedCourse({ ...selectedCourse, studentIds: selectedEnrollIds });
    setEnrollFeedback(`Successfully updated course enrollment (${selectedEnrollIds.length} students).`);
    setTimeout(() => {
      setEnrollFeedback('');
      setShowEnrollModal(false);
    }, 1200);
  };

  const handleQuickAddAndEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !quickStudentName.trim() || !quickStudentEmail.trim()) return;

    const newId = 'user-student-' + Date.now();
    const newStudent: UserProfile = {
      id: newId,
      name: quickStudentName.trim(),
      email: quickStudentEmail.trim().toLowerCase(),
      username: quickStudentEmail.trim().toLowerCase().split('@')[0],
      password: quickStudentPassword,
      role: 'student',
      status: 'active',
      department: selectedCourse.name,
      admissionNumber: quickStudentAdmission.trim() || 'ADM-' + Date.now().toString().slice(-4),
      joiningDate: new Date().toISOString().split('T')[0],
      permissions: ['courses.view', 'attendance.view', 'tasks.view'],
    };

    addUser(newStudent);

    const updatedStudentIds = Array.from(new Set([...selectedCourse.studentIds, newId]));
    enrollStudentsInCourse(selectedCourse.id, updatedStudentIds);
    setSelectedCourse({ ...selectedCourse, studentIds: updatedStudentIds });

    setEnrollFeedback(`Student ${newStudent.name} created and enrolled into ${selectedCourse.code}!`);
    setQuickStudentName('');
    setQuickStudentEmail('');
    setTimeout(() => {
      setEnrollFeedback('');
      setShowEnrollModal(false);
    }, 1500);
  };

  const handleConfirmUnenroll = () => {
    if (!selectedCourse || !studentToUnenroll) return;
    removeStudentFromCourse(selectedCourse.id, studentToUnenroll.id);
    const updatedIds = selectedCourse.studentIds.filter((id) => id !== studentToUnenroll.id);
    setSelectedCourse({ ...selectedCourse, studentIds: updatedIds });
    setStudentToUnenroll(null);
  };

  const handleExportCohortCSV = () => {
    if (!selectedCourse) return;
    const rows = enrolledStudents.map((s) => {
      const stats = getStudentCourseStats(s.id, selectedCourse.id);
      return {
        'Student Name': s.name,
        'Admission Number': s.admissionNumber || 'N/A',
        'Email': s.email,
        'Phone': s.phone || 'N/A',
        'Attendance Rate (%)': stats.attnRate,
        'Sessions Attended': `${stats.attnRate}% (${stats.totalSessions} sessions)`,
        'Tasks Completed': `${stats.submittedTasks} / ${stats.totalTasks}`,
        'Honor Points': stats.pts,
        'Enrolled Course': `${selectedCourse.name} (${selectedCourse.code})`,
      };
    });
    exportToCSV(`${selectedCourse.code}_cohort_progress_report.csv`, rows);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const courseSubjects = subjects.filter((s) => s.courseId === selectedCourse?.id);
  const enrolledStudents = studentsList.filter((s) => selectedCourse?.studentIds.includes(s.id));

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditCourseName(course.name);
    setEditCourseCode(course.code);
    setEditCourseCategory(course.category);
    setEditCourseDuration(course.duration);
    setEditCourseDescription(course.description);
    setEditCourseImage(course.image || '');
    setEditCourseStatus(course.status);
  };

  const handleSaveEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    updateCourse(editingCourse.id, {
      name: editCourseName,
      code: editCourseCode,
      category: editCourseCategory,
      duration: editCourseDuration,
      description: editCourseDescription,
      image: editCourseImage,
      status: editCourseStatus,
    });

    if (selectedCourse?.id === editingCourse.id) {
      setSelectedCourse({
        ...selectedCourse,
        name: editCourseName,
        code: editCourseCode,
        category: editCourseCategory,
        duration: editCourseDuration,
        description: editCourseDescription,
        image: editCourseImage,
        status: editCourseStatus,
      });
    }

    setEditingCourse(null);
  };

  const handleOpenEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setEditSubjectName(subj.name);
    setEditSubjectCode(subj.code);
    setEditSubjectFacultyId(subj.facultyId);
    setEditSubjectDescription(subj.description || '');
    setEditSubjectStatus(subj.status);
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const faculty = facultyMembers.find((f) => f.id === editSubjectFacultyId);

    updateSubject(editingSubject.id, {
      name: editSubjectName,
      code: editSubjectCode,
      facultyId: editSubjectFacultyId,
      facultyName: faculty?.name || editingSubject.facultyName,
      description: editSubjectDescription,
      status: editSubjectStatus,
    });

    setEditingSubject(null);
  };

  const handleConfirmDeleteCourse = () => {
    if (!courseToDelete) return;
    deleteCourse(courseToDelete.id);
    if (selectedCourse?.id === courseToDelete.id) {
      setSelectedCourse(courses.find((c) => c.id !== courseToDelete.id) || null);
    }
    setCourseToDelete(null);
  };

  const handleConfirmDeleteSubject = () => {
    if (!subjectToDelete) return;
    deleteSubject(subjectToDelete.id);
    setSubjectToDelete(null);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !courseCode) return;

    addCourse({
      name: courseName,
      code: courseCode,
      category: courseCategory,
      duration: courseDuration,
      description: courseDescription,
      status: 'active',
      image: courseImage,
      facultyIds: facultyMembers.slice(0, 1).map((f) => f.id),
      studentIds: studentsList.map((s) => s.id),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    });

    setCourseName('');
    setCourseCode('');
    setCourseDescription('');
    setShowAddCourseModal(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !subjectName || !subjectCode) return;

    const faculty = facultyMembers.find((f) => f.id === subjectFacultyId) || facultyMembers[0];

    addSubject({
      name: subjectName,
      code: subjectCode,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      facultyId: faculty?.id || 'unassigned',
      facultyName: faculty?.name || 'Unassigned Faculty',
      description: subjectDescription,
      status: 'active',
    });

    setSubjectName('');
    setSubjectCode('');
    setSubjectDescription('');
    setShowAddSubjectModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Programs & Subjects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curriculum management, faculty assignments, and enrolled student cohorts.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {/* Course Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search programs by title or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#117B78] outline-none"
        />
      </div>

      {/* Main Grid: Course Cards on Left, Course Detail Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Course Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Active Cohorts ({filteredCourses.length})
          </h3>

          {filteredCourses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;
            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`group rounded-3xl p-5 border transition cursor-pointer ${
                  isSelected
                    ? 'border-[#117B78] bg-white shadow-md ring-2 ring-[#117B78]/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#117B78]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#117B78]">
                        {course.code}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {course.duration}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-[#117B78] transition">
                      {course.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 transition shrink-0 mt-2 ${
                      isSelected ? 'text-[#117B78] translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>{course.studentIds.length} Students</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>
                      {subjects.filter((s) => s.courseId === course.id).length} Subjects
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Course Deep-Dive Detail View */}
        {selectedCourse ? (
          <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Header with image */}
            <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 group">
              <img
                src={selectedCourse.image}
                alt={selectedCourse.name}
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <span className="inline-block font-mono text-xs font-bold text-emerald-300">
                    {selectedCourse.code} • {selectedCourse.category}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    {selectedCourse.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedCourse.name}
                </h3>
              </div>

              {canEdit && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditCourse(selectedCourse)}
                    className="flex items-center gap-1.5 rounded-xl bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md hover:bg-white transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#117B78]" />
                    <span>Edit Course</span>
                  </button>
                  <button
                    onClick={() => setCourseToDelete(selectedCourse)}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Syllabus & Objectives
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            {/* Assigned Faculty Section */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Assigned Faculties ({facultyMembers.filter((f) => selectedCourse.facultyIds.includes(f.id)).length || 1})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Educators responsible for lectures, attendance, and grading
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
                  >
                    Manage Faculties →
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(facultyMembers.filter((f) => selectedCourse.facultyIds.includes(f.id)).length > 0
                  ? facultyMembers.filter((f) => selectedCourse.facultyIds.includes(f.id))
                  : facultyMembers.slice(0, 2)
                ).map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/70"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#117B78] text-white font-bold text-xs shrink-0">
                      {f.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{f.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{f.department || 'Academic Faculty'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects Section */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Course Subjects & Modules ({courseSubjects.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Assigned faculty, syllabus breakdown, and lectures
                  </p>
                </div>

                {canEdit && (
                  <button
                    onClick={() => setShowAddSubjectModal(true)}
                    className="flex items-center gap-1 rounded-xl bg-[#117B78]/10 px-3 py-1.5 text-xs font-bold text-[#117B78] hover:bg-[#117B78]/20 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2.5">
                {courseSubjects.map((subj) => (
                  <div
                    key={subj.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#117B78] bg-[#117B78]/10 px-1.5 py-0.5 rounded">
                          {subj.code}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 truncate">{subj.name}</h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Instructor: <span className="font-semibold text-slate-700">{subj.facultyName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setActiveTab('classes')}
                        className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Classes
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleOpenEditSubject(subj)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSubjectToDelete(subj)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrolled Students Roster */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Enrolled Students ({enrolledStudents.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Active cohort learners, attendance compliance, and task grades
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {canReviewProgress && enrolledStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCohortProgressModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cohort Progress</span>
                    </button>
                  )}

                  {canEnrollStudents && (
                    <button
                      type="button"
                      onClick={handleOpenEnrollModal}
                      className="flex items-center gap-1.5 rounded-xl bg-[#117B78] hover:bg-[#0D9C88] px-3.5 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Enroll Students</span>
                    </button>
                  )}
                </div>
              </div>

              {enrolledStudents.length > 0 ? (
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {enrolledStudents.map((s) => {
                    const stats = getStudentCourseStats(s.id, selectedCourse.id);
                    return (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col justify-between gap-3 shadow-2xs group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-[#117B78]/10 text-[#117B78] flex items-center justify-center font-bold text-xs shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                {s.admissionNumber || s.email}
                              </p>
                            </div>
                          </div>

                          {canEnrollStudents && (
                            <button
                              type="button"
                              onClick={() => setStudentToUnenroll(s)}
                              title="Unenroll student from this course"
                              className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Metric pills */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] py-1 border-t border-b border-slate-100">
                          <div className="bg-slate-50 p-1.5 rounded-xl">
                            <span className="text-slate-400 block text-[9px] font-bold">Attendance</span>
                            <span
                              className={`font-bold ${
                                stats.attnRate >= 80 ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {stats.attnRate}%
                            </span>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-xl">
                            <span className="text-slate-400 block text-[9px] font-bold">Tasks</span>
                            <span className="font-bold text-blue-700">
                              {stats.submittedTasks}/{stats.totalTasks}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-xl">
                            <span className="text-slate-400 block text-[9px] font-bold">Points</span>
                            <span className="font-bold text-amber-700">{stats.pts}</span>
                          </div>
                        </div>

                        {/* Review Progress Action */}
                        {canReviewProgress && (
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForProgress(s)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 text-xs font-bold transition cursor-pointer"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Review Progress</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                  <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No students enrolled in this course yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add registered students to this cohort to track attendance and assignments.
                  </p>
                  {canEnrollStudents && (
                    <button
                      type="button"
                      onClick={handleOpenEnrollModal}
                      className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#117B78] hover:bg-[#0D9C88] px-4 py-2 text-xs font-bold text-white transition cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Enroll Students Now</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Select a course to view details</p>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Create Academic Program</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new course curriculum with duration and category.
            </p>

            <form onSubmit={handleCreateCourse} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. AI-2026"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="e.g. 6 Months"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Program overview and learning outcomes..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Add Subject to {selectedCourse.code}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create a module and assign a faculty member.
            </p>

            <form onSubmit={handleCreateSubject} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Distributed Cloud Computing"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. CS-301"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Faculty</label>
                <select
                  value={subjectFacultyId}
                  onChange={(e) => setSubjectFacultyId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  <option value="">Select an educator...</option>
                  {facultyMembers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.department || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Syllabus / Overview</label>
                <textarea
                  rows={3}
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  placeholder="Key topics and deliverables covered in this subject..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Academic Program</h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={editCourseName}
                  onChange={(e) => setEditCourseName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={editCourseCode}
                    onChange={(e) => setEditCourseCode(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={editCourseDuration}
                    onChange={(e) => setEditCourseDuration(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editCourseCategory}
                    onChange={(e) => setEditCourseCategory(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editCourseStatus}
                    onChange={(e) => setEditCourseStatus(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editCourseImage}
                  onChange={(e) => setEditCourseImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Syllabus</label>
                <textarea
                  rows={3}
                  value={editCourseDescription}
                  onChange={(e) => setEditCourseDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Subject: {editingSubject.code}</h3>
              <button
                onClick={() => setEditingSubject(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={editSubjectCode}
                    onChange={(e) => setEditSubjectCode(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editSubjectStatus}
                    onChange={(e) => setEditSubjectStatus(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Faculty Member</label>
                <select
                  value={editSubjectFacultyId}
                  onChange={(e) => setEditSubjectFacultyId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  <option value="">Unassigned</option>
                  {facultyMembers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.department || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Syllabus / Details</label>
                <textarea
                  rows={3}
                  value={editSubjectDescription}
                  onChange={(e) => setEditSubjectDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Course Program?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">{courseToDelete.name}</span> ({courseToDelete.code})? This will also remove its associated subjects.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Subject Module?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Delete subject <span className="font-bold text-slate-800">{subjectToDelete.name}</span> ({subjectToDelete.code})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubject}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. ENROLL STUDENTS MODAL */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#117B78] bg-[#117B78]/10 px-2 py-0.5 rounded">
                    {selectedCourse.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Manage Course Enrollment</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedCourse.name}</p>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Feedback */}
            {enrollFeedback && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{enrollFeedback}</span>
              </div>
            )}

            {/* Toggle Tabs: Select Existing vs Quick Create */}
            <div className="flex items-center rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setEnrollTab('existing')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  enrollTab === 'existing'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Select Registered Students ({studentsList.length})
              </button>
              <button
                type="button"
                onClick={() => setEnrollTab('new')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  enrollTab === 'new'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                + Quick Add & Enroll
              </button>
            </div>

            {/* TAB A: SELECT EXISTING STUDENTS */}
            {enrollTab === 'existing' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search students by name, email, or admission #..."
                      value={enrollSearch}
                      onChange={(e) => setEnrollSearch(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#117B78]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedEnrollIds(studentsList.map((s) => s.id))}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEnrollIds([])}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Students Checklist */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                  {studentsList
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(enrollSearch.toLowerCase()) ||
                        s.email.toLowerCase().includes(enrollSearch.toLowerCase()) ||
                        (s.admissionNumber &&
                          s.admissionNumber.toLowerCase().includes(enrollSearch.toLowerCase()))
                    )
                    .map((s) => {
                      const isChecked = selectedEnrollIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleToggleEnrollId(s.id)}
                          className={`flex items-center justify-between p-3 hover:bg-slate-50 transition cursor-pointer select-none ${
                            isChecked ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-[#117B78]">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-[#117B78]" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{s.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {s.admissionNumber || s.email}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isChecked
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {isChecked ? 'Enrolled' : 'Not Enrolled'}
                          </span>
                        </div>
                      );
                    })}

                  {studentsList.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No students currently registered in directory. Use the "Quick Add" tab above to create one.
                    </div>
                  )}
                </div>

                {/* Footer Save Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-medium">
                    <strong className="text-slate-900">{selectedEnrollIds.length}</strong> student(s) selected
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEnrollModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEnrollments}
                      className="px-5 py-2 rounded-xl bg-[#117B78] hover:bg-[#0D9C88] text-xs font-bold text-white transition cursor-pointer shadow-xs"
                    >
                      Save Enrollments
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B: QUICK CREATE & ENROLL */}
            {enrollTab === 'new' && (
              <form onSubmit={handleQuickAddAndEnroll} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Student Name</label>
                  <input
                    type="text"
                    required
                    value={quickStudentName}
                    onChange={(e) => setQuickStudentName(e.target.value)}
                    placeholder="e.g. Zaid bin Haritha"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Email Address</label>
                  <input
                    type="email"
                    required
                    value={quickStudentEmail}
                    onChange={(e) => setQuickStudentEmail(e.target.value)}
                    placeholder="student@institution.local"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admission Number</label>
                    <input
                      type="text"
                      value={quickStudentAdmission}
                      onChange={(e) => setQuickStudentAdmission(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-mono text-slate-900 outline-none focus:border-[#117B78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                    <input
                      type="text"
                      value={quickStudentPassword}
                      onChange={(e) => setQuickStudentPassword(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-mono text-slate-900 outline-none focus:border-[#117B78]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed">
                  The new student profile will be registered with role <strong className="font-bold">Student</strong> and automatically enrolled into <strong className="font-bold">{selectedCourse.name}</strong>.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#117B78] hover:bg-[#0D9C88] text-xs font-bold text-white transition cursor-pointer shadow-xs"
                  >
                    Create & Enroll Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. UNENROLL STUDENT CONFIRMATION MODAL */}
      {studentToUnenroll && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <UserMinus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Unenroll Student?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Remove <span className="font-bold text-slate-800">{studentToUnenroll.name}</span> from{' '}
                <span className="font-bold text-slate-800">{selectedCourse.name}</span>?
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                The student account will remain in the directory and their past records will be preserved.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToUnenroll(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnenroll}
                className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 cursor-pointer"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. COHORT PROGRESS OVERVIEW MODAL */}
      {showCohortProgressModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-[#117B78] text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                    {selectedCourse.code}
                  </span>
                  <h3 className="text-lg font-bold text-white">Cohort Academic Progress Matrix</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedCourse.name} • {enrolledStudents.length} enrolled students
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCohortCSV}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCohortProgressModal(false)}
                  className="p-1.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter cohort members..."
                  value={cohortSearch}
                  onChange={(e) => setCohortSearch(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Cohort Size: <strong className="text-slate-900">{enrolledStudents.length}</strong> learners
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Attendance Rate</th>
                      <th className="py-3 px-4">Assignments</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4">Academic Standing</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrolledStudents
                      .filter(
                        (s) =>
                          s.name.toLowerCase().includes(cohortSearch.toLowerCase()) ||
                          s.email.toLowerCase().includes(cohortSearch.toLowerCase())
                      )
                      .map((s) => {
                        const stats = getStudentCourseStats(s.id, selectedCourse.id);
                        const isHigh = stats.attnRate >= 80 && stats.taskRate >= 75;
                        const isMid = stats.attnRate >= 60;
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-[#117B78]/10 text-[#117B78] flex items-center justify-center font-bold text-xs shrink-0">
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{s.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {s.admissionNumber || s.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold ${
                                    stats.attnRate >= 80
                                      ? 'text-emerald-700'
                                      : stats.attnRate >= 60
                                      ? 'text-amber-700'
                                      : 'text-rose-600'
                                  }`}
                                >
                                  {stats.attnRate}%
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ({stats.totalSessions} sessions)
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-blue-700">
                                {stats.submittedTasks} / {stats.totalTasks}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">({stats.taskRate}%)</span>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                              {stats.pts} pts
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isHigh
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : isMid
                                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {isHigh ? 'Outstanding' : isMid ? 'Consistent' : 'Needs Review'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentForProgress(s);
                                  setShowCohortProgressModal(false);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#117B78] hover:text-white text-xs font-bold text-slate-700 transition cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Review</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. INDIVIDUAL STUDENT PROGRESS MODAL */}
      {selectedStudentForProgress && (
        <StudentProgressModal
          student={selectedStudentForProgress}
          initialCourseId={selectedCourse?.id}
          onClose={() => setSelectedStudentForProgress(null)}
        />
      )}
    </div>
  );
};
