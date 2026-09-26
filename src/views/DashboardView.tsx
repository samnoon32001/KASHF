import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CheckSquare,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Play,
  Video,
  Plus,
  Filter,
  ExternalLink,
  DollarSign,
  PhoneCall,
  UserCheck,
  AlertCircle,
  Palette,
  Eye,
  CheckCircle2,
  Database,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    activeRole,
    users,
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
    pointsHistory,
    setActiveTab,
    startClassSession,
    isDatabaseConnected,
    lastSyncTime,
    firestoreDatabaseId,
    refreshDatabaseSync,
    isSyncing,
  } = useApp();

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const activeStudents = users.filter((u) => u.role === 'student' && u.status === 'active').length;
  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.status === 'active').length;
  const totalFaculties = users.filter((u) => u.role === 'faculty').length;
  const activeFaculties = users.filter((u) => u.role === 'faculty' && u.status === 'active').length;
  const totalStaff = users.filter((u) => u.role !== 'student').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayClasses = classes.filter((c) => c.date === todayStr);
  const pendingTasks = tasks.filter((t) => t.status === 'active');
  const pendingCreativeTasks = creativeTasks.filter((ct) => ct.status !== 'completed');

  // Student points
  const studentTotalPoints = pointsHistory
    .filter((p) => p.studentId === currentUser?.id)
    .reduce((sum, item) => sum + item.points, 0);

  // Student attendance calculation
  const myAttendanceRecords = attendance.flatMap((session) =>
    session.records.filter((rec) => rec.studentId === currentUser?.id)
  );
  const myTotalClasses = myAttendanceRecords.length;
  const myPresentClasses = myAttendanceRecords.filter((rec) => rec.status === 'present').length;
  const myAttendanceRate = myTotalClasses > 0 ? Math.round((myPresentClasses / myTotalClasses) * 100) : 100;

  // 1. STUDENT DASHBOARD (#18: Simple & user-friendly, My Courses, Today's Class, Attendance, Pending Tasks, Points, Today's Schedule, Recent Recordings)
  if (activeRole === 'student') {
    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Welcome Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#117B78] to-[#0D9C88] p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Learning Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {currentUser?.name}!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-lg">
                Admission ID: <span className="font-mono font-bold text-white">{currentUser?.admissionNumber || 'ADM-2026'}</span> • Computer Science Program
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 backdrop-blur-md px-4 py-3 text-center border border-white/20">
                <p className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Total Points</p>
                <p className="text-2xl font-black text-amber-300">{studentTotalPoints} pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Main Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('courses')}
            className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">My Courses</span>
              <div className="h-8 w-8 rounded-xl bg-[#117B78]/10 text-[#117B78] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{courses.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active enrollment</p>
          </div>

          <div
            onClick={() => setActiveTab('classes')}
            className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Today's Class</span>
              <div className="h-8 w-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{todayClasses.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {todayClasses.length > 0 ? 'Starts at 10:00 AM' : 'No classes today'}
            </p>
          </div>

          <div
            onClick={() => setActiveTab('attendance')}
            className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Attendance</span>
              <div className="h-8 w-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{myAttendanceRate}%</p>
            {/* Visual attendance progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#117B78] h-1.5 rounded-full"
                style={{ width: `${myAttendanceRate}%` }}
              />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('tasks')}
            className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Pending Tasks</span>
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{pendingTasks.length}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Due this week</p>
          </div>
        </div>

        {/* Today's Schedule with Google Meet Join Class */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Class Schedule</h3>
              <p className="text-xs text-slate-500">Live online lectures via Google Meet</p>
            </div>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-xs font-bold text-[#117B78] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todayClasses.length > 0 ? (
              todayClasses.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#117B78]/10 text-[#117B78] font-bold text-xs">
                      {session.startTime.split(' ')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[10px] font-bold text-[#117B78]">
                          {session.courseName}
                        </span>
                        {session.status === 'live' && (
                          <span className="flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{session.subjectName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Faculty: {session.facultyName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={session.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Class</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No classes scheduled for today.</p>
                <p className="text-[11px] text-slate-400">Check upcoming schedules in the classes tab.</p>
              </div>
            )}
          </div>
        </div>

        {/* Two-Column: Recent Recordings & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Recordings */}
          <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Class Recordings</h3>
              <button
                onClick={() => setActiveTab('recordings')}
                className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
              >
                View all ({recordedClasses.length})
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recordedClasses.slice(0, 2).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="relative h-16 w-24 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img src={rec.thumbnail} alt={rec.title} className="h-full w-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center text-slate-900 shadow-xs">
                        <Play className="w-3 h-3 fill-slate-900 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#117B78]">{rec.subjectName}</span>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{rec.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{rec.duration}</span>
                      <span>•</span>
                      <span>{rec.facultyName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks & Submissions */}
          <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Pending Assignments</h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
              >
                View all ({tasks.length})
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {pendingTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      +{task.points} Points
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Due: {task.dueDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">{task.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="mt-3 w-full rounded-xl bg-slate-100 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#117B78] hover:text-white transition cursor-pointer"
                  >
                    Submit Assignment
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Activity Timeline (#16) */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Your Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Attended Mathematics & React Class</p>
                <p className="text-[11px] text-slate-500">Today at 10:00 AM • Verified attendance logged</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Earned +25 Points for Assignment Submission</p>
                <p className="text-[11px] text-slate-500">Yesterday at 4:20 PM • Reviewed by Dr. Sarah Jenkins</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                <Play className="w-4 h-4 fill-cyan-700 ml-0.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Watched Recorded Class: Distributed Databases</p>
                <p className="text-[11px] text-slate-500">2 days ago • Completed full 1 hr 18 min lecture</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. FACULTY DASHBOARD (Classes today, Start Google Meet session, submit attendance, review student submissions)
  if (activeRole === 'faculty') {
    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Faculty Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#117B78] to-[#0D9C88] p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Faculty Academic Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {currentUser?.name}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                Department of Computer Science • 2 Active Courses Assigned
              </p>
            </div>
            <button
              onClick={() => setActiveTab('classes')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#117B78] shadow-md hover:bg-emerald-50 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Live Class</span>
            </button>
          </div>
        </div>

        {/* Faculty Workload Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Today's Sessions</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{todayClasses.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Ready to launch</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Total Students</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{totalStudents}</p>
            <p className="text-[11px] text-slate-500 mt-1">Enrolled across cohorts</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Pending Grading</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{taskSubmissions.filter((s) => s.status === 'pending').length}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Submissions to review</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Recordings Uploaded</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{recordedClasses.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Video lectures available</p>
          </div>
        </div>

        {/* Live Classes Action Card (#12 & #13: Start Class -> Open Google Meet -> Mark Attendance) */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Teaching Schedule</h3>
              <p className="text-xs text-slate-500">Start Google Meet and take live attendance</p>
            </div>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-xs font-bold text-[#117B78] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage all classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todayClasses.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[10px] font-bold text-[#117B78]">
                      {session.startTime} - {session.endTime}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{session.courseName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{session.subjectName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Meet Link: {session.meetUrl}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      startClassSession(session.id);
                      window.open(session.meetUrl, '_blank');
                    }}
                    className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Class (Meet)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                    <span>Take Attendance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. TELECALLER DASHBOARD (CRM Leads, Conversion Funnel, Follow-ups Due Today, Kanban)
  if (activeRole === 'telecaller') {
    const newLeadsCount = leads.filter((l) => l.status === 'new').length;
    const contactedCount = leads.filter((l) => l.status === 'contacted').length;
    const interestedCount = leads.filter((l) => l.status === 'interested').length;
    const confirmedCount = leads.filter((l) => l.status === 'confirmed').length;
    const enrolledCount = leads.filter((l) => l.status === 'enrolled').length;

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Telecaller Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#117B78] to-[#0D9C88] p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs mb-2">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Admissions CRM & Meta Lead Ads Pipeline</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Telecaller Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                Active Campaign: Fall Tech Careers Campaign 2026 • Meta Webhook Active
              </p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#117B78] shadow-md hover:bg-emerald-50 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Direct Lead</span>
            </button>
          </div>
        </div>

        {/* Conversion Funnel (#26) */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Lead Conversion Funnel
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-700 uppercase">New Leads</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{newLeadsCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-100">
              <span className="text-[11px] font-bold text-cyan-700 uppercase">Contacted</span>
              <p className="text-2xl font-black text-cyan-900 mt-1">{contactedCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Interested</span>
              <p className="text-2xl font-black text-amber-900 mt-1">{interestedCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
              <span className="text-[11px] font-bold text-teal-700 uppercase">Confirmed</span>
              <p className="text-2xl font-black text-teal-900 mt-1">{confirmedCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Enrolled</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{enrolledCount}</p>
            </div>
          </div>
        </div>

        {/* Follow-ups Due Today */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Follow-ups Scheduled for Today</h3>
              <p className="text-xs text-slate-500">Call prospects and log meeting notes</p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
            >
              Open CRM Pipeline →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {leads.slice(0, 3).map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                      {lead.source}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Course: {lead.courseInterested}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Phone: {lead.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. CREATIVE HEAD DASHBOARD (Section 21: Active tasks, urgent tasks, campaigns, pending approvals, recent designs/videos)
  if (activeRole === 'creative_head') {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="rounded-3xl bg-gradient-to-r from-[#117B78] to-[#0D9C88] p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs mb-2">
                <Palette className="w-3.5 h-3.5" />
                <span>Creative Studio & Media Management</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Creative Head Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                Branding, Campaigns, Social Media Assets, and Institutional PR
              </p>
            </div>
            <button
              onClick={() => setActiveTab('creative')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#117B78] shadow-md hover:bg-emerald-50 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Creative Brief</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Active Tasks</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{creativeTasks.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">In design pipeline</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Under Review</span>
            <p className="text-2xl font-black text-amber-600 mt-2">
              {creativeTasks.filter((t) => t.status === 'review').length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting Director check</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Media Library Assets</span>
            <p className="text-2xl font-black text-slate-900 mt-2">{media.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Posters, videos, vectors</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Urgent Deadlines</span>
            <p className="text-2xl font-black text-rose-600 mt-2">
              {creativeTasks.filter((t) => t.priority === 'urgent').length}
            </p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">Due within 48 hrs</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Current Design Tasks</h3>
            <button
              onClick={() => setActiveTab('creative')}
              className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
            >
              View Kanban Workflow →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {creativeTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        task.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{task.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Deadline: {task.deadline}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => setActiveTab('creative')}
                    className="rounded-xl bg-[#117B78] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0D9C88] transition cursor-pointer"
                  >
                    Open Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. SUPER ADMIN & DIRECTOR & ACADEMIC COORDINATOR DASHBOARDS (Sections 5, 7, 8)
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Executive Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#117B78] to-[#0D9C88] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Institutional Overview • Term 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeRole === 'super_admin'
                ? 'Super Administrator Dashboard'
                : activeRole === 'director'
                ? 'Director Executive Overview'
                : 'Academic Coordination Hub'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Real-time monitoring across admissions, academic cohorts, faculty schedules, live classrooms, and institutional growth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-[#117B78] shadow-md hover:bg-emerald-50 transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2.5 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Classes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Firestore Live Synchronized Database Card */}
      <div className="rounded-2xl bg-white p-4 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                Cloud Firestore Real-Time Database: {isDatabaseConnected ? 'Active & Live' : 'Connecting...'}
              </h4>
              <span className="hidden sm:inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                Multi-Browser Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live DB: <span className="font-mono text-slate-700 font-semibold">{firestoreDatabaseId}</span> • Deletions and additions sync instantly across all browser windows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[10px] text-slate-400 font-medium">
            {lastSyncTime ? `Synced: ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Syncing...'}
          </span>
          <button
            onClick={() => refreshDatabaseSync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Ping Firestore cloud connection"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#117B78]' : 'text-slate-500'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Ping'}</span>
          </button>
        </div>
      </div>

      {/* 8 Statistic Cards (#5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('students')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Students</span>
            <div className="h-8 w-8 rounded-xl bg-[#117B78]/10 text-[#117B78] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalStudents}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {activeStudents} currently active
          </p>
        </div>

        <div
          onClick={() => setActiveTab('courses')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Courses</span>
            <div className="h-8 w-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCourses}</p>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            {activeCourses} running cohorts
          </p>
        </div>

        <div
          onClick={() => setActiveTab('users')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Faculty Staff</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalFaculties}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeFaculties} teaching faculty
          </p>
        </div>

        <div
          onClick={() => setActiveTab('classes')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Today's Classes</span>
            <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{todayClasses.length}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Google Meet links ready</p>
        </div>

        <div
          onClick={() => setActiveTab('leads')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Admissions CRM</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{leads.length}</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            {leads.filter((l) => l.status === 'new').length} new inquiries
          </p>
        </div>

        <div
          onClick={() => setActiveTab('attendance')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Attendance Rate</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">94%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Healthy institutional rate</p>
        </div>

        <div
          onClick={() => setActiveTab('creative')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Approvals</span>
            <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-900 mt-2">{pendingCreativeTasks.length}</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Creative campaign tasks</p>
        </div>

        <div
          onClick={() => setActiveTab('reports')}
          className="rounded-2xl bg-white p-4 border border-slate-200 hover:border-[#117B78]/40 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Staff Members</span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalStaff}</p>
          <p className="text-[11px] text-slate-500 mt-1">Faculty, heads & telecallers</p>
        </div>
      </div>

      {/* Two Column Grid: Today's Classes & Lead Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Academic Sessions</h3>
              <p className="text-xs text-slate-500">Live lecture monitoring & Meet URLs</p>
            </div>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
            >
              View Schedule →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todayClasses.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#117B78]">{session.startTime} - {session.endTime}</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{session.subjectName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Faculty: {session.facultyName}</p>
                </div>
                <a
                  href={session.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-[#117B78] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0D9C88] transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Meet</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Lead CRM Funnel & Fast Actions */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">CRM Admissions Pipeline</h3>
              <p className="text-xs text-slate-500">Live prospect conversions</p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
            >
              Open Pipeline →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {leads.slice(0, 3).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase">
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {lead.courseInterested} • Assigned to: {lead.assignedName || 'Telecaller'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('leads')}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  View Lead
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
