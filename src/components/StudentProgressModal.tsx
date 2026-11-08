'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Award,
  TrendingUp,
  BookOpen,
  FileText,
  Sparkles,
  Download,
  Plus,
  Send,
  User,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, Course, Task, TaskSubmission, AttendanceSession, StudentPointsHistory } from '../types';

interface StudentProgressModalProps {
  student: UserProfile;
  initialCourseId?: string;
  onClose: () => void;
}

export const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  student,
  initialCourseId,
  onClose,
}) => {
  const {
    courses,
    subjects,
    classes,
    attendance,
    tasks,
    taskSubmissions,
    pointsHistory,
    awardStudentPoints,
    settings,
    currentUser,
    can,
  } = useApp();

  // Find all courses the student is enrolled in
  const enrolledCourses = useMemo(() => {
    return courses.filter((c) => c.studentIds.includes(student.id));
  }, [courses, student.id]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    if (initialCourseId && enrolledCourses.some((c) => c.id === initialCourseId)) {
      return initialCourseId;
    }
    return enrolledCourses[0]?.id || courses[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'tasks' | 'points'>('overview');

  // Bonus Points Form State
  const [showAwardPointsForm, setShowAwardPointsForm] = useState(false);
  const [pointsAmount, setPointsAmount] = useState<number>(10);
  const [pointsReason, setPointsReason] = useState<string>('Outstanding academic participation');
  const [pointsAwardSuccess, setPointsAwardSuccess] = useState(false);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  // 1. Calculate Attendance Metrics for this course
  const attendanceData = useMemo(() => {
    const relevantSessions = attendance.filter((a) => {
      if (selectedCourseId) return a.courseId === selectedCourseId;
      return true;
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let recordedSessionCount = 0;

    const studentRecords: {
      session: AttendanceSession;
      status: 'present' | 'absent' | 'late' | 'excused';
      note?: string;
    }[] = [];

    relevantSessions.forEach((sess) => {
      const rec = sess.records?.find((r) => r.studentId === student.id);
      if (rec) {
        recordedSessionCount++;
        if (rec.status === 'present') present++;
        else if (rec.status === 'late') late++;
        else if (rec.status === 'absent') absent++;
        else if (rec.status === 'excused') excused++;

        studentRecords.push({
          session: sess,
          status: rec.status,
          note: rec.note,
        });
      }
    });

    // Attendance Rate: (present + 0.8 * late) / total
    const total = recordedSessionCount;
    const rate = total > 0 ? Math.round(((present + late * 0.8) / total) * 100) : 100;

    return {
      total,
      present,
      absent,
      late,
      excused,
      rate,
      records: studentRecords.sort(
        (a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime()
      ),
    };
  }, [attendance, selectedCourseId, student.id]);

  // 2. Calculate Task / Assignment Metrics for this course
  const taskData = useMemo(() => {
    const courseTasks = tasks.filter((t) => {
      if (selectedCourseId && t.courseId !== selectedCourseId) return false;
      if (t.assignedTo === 'all') return true;
      return Array.isArray(t.assignedTo) && t.assignedTo.includes(student.id);
    });

    const studentSubmissions = taskSubmissions.filter((s) => s.studentId === student.id);

    let submittedCount = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let totalScoreAwarded = 0;
    let totalMaxPossible = 0;

    const taskBreakdown = courseTasks.map((task) => {
      const sub = studentSubmissions.find((s) => s.taskId === task.id);
      totalMaxPossible += task.points;

      if (sub) {
        submittedCount++;
        totalScoreAwarded += sub.pointsAwarded || 0;
        if (sub.status === 'approved') approvedCount++;
        else if (sub.status === 'pending') pendingCount++;
        else if (sub.status === 'rejected') rejectedCount++;
      }

      return {
        task,
        submission: sub || null,
        isSubmitted: !!sub,
        isOverdue: !sub && new Date(task.dueDate) < new Date(),
      };
    });

    const completionRate =
      courseTasks.length > 0 ? Math.round((submittedCount / courseTasks.length) * 100) : 100;

    return {
      totalTasks: courseTasks.length,
      submittedCount,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalScoreAwarded,
      totalMaxPossible,
      completionRate,
      tasks: taskBreakdown,
    };
  }, [tasks, taskSubmissions, selectedCourseId, student.id]);

  // 3. Calculate Gamification Points
  const studentPointsRecords = useMemo(() => {
    return pointsHistory
      .filter((p) => p.studentId === student.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pointsHistory, student.id]);

  const totalPoints = useMemo(() => {
    return studentPointsRecords.reduce((sum, p) => sum + (p.points || 0), 0);
  }, [studentPointsRecords]);

  // 4. Overall Academic Standing & Grade Calculation
  const academicStanding = useMemo(() => {
    const combined = Math.round(attendanceData.rate * 0.4 + taskData.completionRate * 0.6);
    if (combined >= 90) return { label: 'Outstanding (Grade A+)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', score: combined };
    if (combined >= 80) return { label: 'Good Standing (Grade A)', color: 'text-teal-700 bg-teal-50 border-teal-200', score: combined };
    if (combined >= 70) return { label: 'Satisfactory (Grade B)', color: 'text-blue-700 bg-blue-50 border-blue-200', score: combined };
    if (combined >= 60) return { label: 'Passing (Grade C)', color: 'text-amber-700 bg-amber-50 border-amber-200', score: combined };
    return { label: 'Academic Alert (Grade D/F)', color: 'text-rose-700 bg-rose-50 border-rose-200', score: combined };
  }, [attendanceData.rate, taskData.completionRate]);

  const handleAwardBonusPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointsAmount || !pointsReason.trim()) return;

    awardStudentPoints(student.id, pointsAmount, pointsReason.trim());
    setPointsAwardSuccess(true);
    setTimeout(() => {
      setPointsAwardSuccess(false);
      setShowAwardPointsForm(false);
    }, 1800);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-[#117B78] text-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/10 text-white font-black text-lg sm:text-xl border border-white/20 shrink-0">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.name} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                student.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{student.name}</h3>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Student Record
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{student.email}</span>
                {student.admissionNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-emerald-300">{student.admissionNumber}</span>
                  </>
                )}
                {student.phone && (
                  <>
                    <span>•</span>
                    <span>{student.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer"
              title="Print progress report"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Export</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-300 hover:bg-white/20 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Course Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200/80">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Program:
            </span>
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCourseId === c.id
                      ? 'bg-[#117B78] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {c.code} • {c.name}
                </button>
              ))
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Not enrolled in any specific cohort
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${academicStanding.color}`}>
              {academicStanding.label}
            </span>
          </div>
        </div>

        {/* Quick KPI Summary Cards */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border-b border-slate-100">
          {/* Attendance KPI */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Attendance Rate</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">{attendanceData.rate}%</span>
                <span className="text-[11px] text-slate-400">
                  ({attendanceData.present}/{attendanceData.total} sessions)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    attendanceData.rate >= 80 ? 'bg-emerald-500' : attendanceData.rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, attendanceData.rate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Assignments KPI */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Assignments</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">{taskData.completionRate}%</span>
                <span className="text-[11px] text-slate-400">
                  ({taskData.submittedCount}/{taskData.totalTasks} tasks)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, taskData.completionRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Points & Gamification KPI */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Honor Points</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-600">{totalPoints}</span>
                <span className="text-[11px] text-slate-400">pts</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {studentPointsRecords.length} milestones awarded
              </p>
            </div>
          </div>

          {/* Task Score Points */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Assignment Score</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">{taskData.totalScoreAwarded}</span>
                <span className="text-[11px] text-slate-400">/ {taskData.totalMaxPossible} max</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {taskData.approvedCount} approved submissions
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#117B78] text-[#117B78]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Standing
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attendance'
                ? 'border-[#117B78] text-[#117B78]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Attendance Logs</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
              {attendanceData.records.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-[#117B78] text-[#117B78]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Assignments & Grades</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
              {taskData.tasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'points'
                ? 'border-[#117B78] text-[#117B78]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Points History</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
              {studentPointsRecords.length}
            </span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Analysis Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Academic Progress Evaluation</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-700">
                    Weighted Index: {academicStanding.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {student.name} is enrolled in{' '}
                  <strong className="text-slate-900">{activeCourse?.name || 'Academic Course'}</strong>.
                  Attendance compliance is at{' '}
                  <strong className={attendanceData.rate >= 80 ? 'text-emerald-700' : 'text-rose-600'}>
                    {attendanceData.rate}%
                  </strong>{' '}
                  with {attendanceData.present} on-time attendances and {attendanceData.absent} absences.
                  Assignment completion rate stands at{' '}
                  <strong className="text-slate-900">{taskData.completionRate}%</strong> ({taskData.submittedCount} of {taskData.totalTasks} coursework tasks).
                </p>

                {/* Progress breakdown indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Present Days</p>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">{attendanceData.present}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Late / Excused</p>
                    <p className="text-lg font-black text-amber-600 mt-0.5">{attendanceData.late + attendanceData.excused}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Unexcused Absences</p>
                    <p className="text-lg font-black text-rose-600 mt-0.5">{attendanceData.absent}</p>
                  </div>
                </div>
              </div>

              {/* Award Bonus Honor Points Accordion / Box */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Award Honor & Gamification Points</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Grant student bonus points for recitation, diligence, or character excellence.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAwardPointsForm(!showAwardPointsForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 border border-amber-200 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAwardPointsForm ? 'Cancel' : 'Award Points'}</span>
                  </button>
                </div>

                {showAwardPointsForm && (
                  <form onSubmit={handleAwardBonusPoints} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    {pointsAwardSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Successfully awarded {pointsAmount} honor points to {student.name}!</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Points to Award</label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={pointsAmount}
                          onChange={(e) => setPointsAmount(Number(e.target.value))}
                          className="w-full mt-1 h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#117B78]"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Reason / Milestone Description</label>
                        <input
                          type="text"
                          value={pointsReason}
                          onChange={(e) => setPointsReason(e.target.value)}
                          placeholder="e.g. Excellent presentation, streak achievement"
                          className="w-full mt-1 h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-[#117B78]"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#117B78] hover:bg-[#0D9C88] text-xs font-bold text-white transition cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Award Points</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE LOG */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Class Session Attendance Records ({attendanceData.records.length})
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present: {attendanceData.present}
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Late: {attendanceData.late}
                  </span>
                  <span className="flex items-center gap-1 text-rose-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent: {attendanceData.absent}
                  </span>
                </div>
              </div>

              {attendanceData.records.length > 0 ? (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  {attendanceData.records.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            item.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'excused'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status === 'present' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : item.status === 'late' ? (
                            <Clock className="w-4 h-4" />
                          ) : item.status === 'excused' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {item.session.subjectName || 'Class Lecture Session'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Date: {item.session.date} • Instructor: {item.session.facultyName || 'Faculty'}
                            {item.note && ` • Note: ${item.note}`}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`capitalize px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.status === 'present'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'late'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : item.status === 'excused'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border border-slate-100 bg-slate-50">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No attendance records yet for this course</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TASKS & ASSIGNMENTS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Course Tasks & Submissions ({taskData.tasks.length})
                </h4>
                <span className="text-xs font-bold text-[#117B78]">
                  Score: {taskData.totalScoreAwarded} / {taskData.totalMaxPossible} pts
                </span>
              </div>

              {taskData.tasks.length > 0 ? (
                <div className="space-y-3">
                  {taskData.tasks.map(({ task, submission, isSubmitted, isOverdue }) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900">{task.title}</h5>
                            <span className="font-mono text-[10px] font-bold bg-[#117B78]/10 text-[#117B78] px-2 py-0.5 rounded">
                              {task.points} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                        </div>

                        <span
                          className={`capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                            submission?.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : submission?.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {submission?.status === 'approved'
                            ? `Approved (+${submission.pointsAwarded} pts)`
                            : submission?.status === 'pending'
                            ? 'Submitted (Pending Review)'
                            : isOverdue
                            ? 'Missing (Overdue)'
                            : 'Not Submitted'}
                        </span>
                      </div>

                      {/* Submission Details if submitted */}
                      {submission && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                          <p className="text-[11px] font-semibold text-slate-900">
                            Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          <p className="text-[11px] text-slate-600 italic">"{submission.content}"</p>
                          {submission.feedback && (
                            <p className="text-[11px] text-emerald-800 mt-1 font-medium bg-emerald-50/80 p-1.5 rounded border border-emerald-200">
                              Instructor Feedback: {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border border-slate-100 bg-slate-50">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No tasks assigned to this course yet</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: POINTS HISTORY */}
          {activeTab === 'points' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Points Timeline & Milestones ({studentPointsRecords.length})
                </h4>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  Total Points: {totalPoints}
                </span>
              </div>

              {studentPointsRecords.length > 0 ? (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  {studentPointsRecords.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          +{item.points}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.reason}</p>
                          <p className="text-[11px] text-slate-400">Awarded on: {item.date}</p>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        +{item.points} Pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border border-slate-100 bg-slate-50">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No points awarded to this student yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

