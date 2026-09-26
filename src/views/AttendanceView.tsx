import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  Search,
  Filter,
  Users,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Printer,
  Bell,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord, AttendanceStatus, AttendanceSession } from '../types';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    users,
    courses,
    subjects,
    attendance,
    saveAttendanceSession,
    addNotification,
    currentUser,
    activeRole,
    can,
    exportToCSV,
  } = useApp();

  const isStudent = activeRole === 'student';
  const students = users.filter((u) => u.role === 'student');

  const [activeTab, setActiveTab] = useState<'mark' | 'reports'>('mark');

  // Selected class for taking attendance
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Roster state for the selected class
  const [roster, setRoster] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach((s) => {
      initial[s.id] = { status: 'present', remarks: '' };
    });
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [noticeSentMessage, setNoticeSentMessage] = useState('');

  // Report filter states
  const [reportSearch, setReportSearch] = useState('');
  const [reportCourseFilter, setReportCourseFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'at_risk' | 'good'>('all');

  // Update status for student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRoster((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClass) return;

    const records: AttendanceRecord[] = students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      status: roster[s.id]?.status || 'present',
      remarks: roster[s.id]?.remarks,
    }));

    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const lateCount = records.filter((r) => r.status === 'late').length;

    saveAttendanceSession({
      classId: selectedClass.id,
      courseId: selectedClass.courseId,
      subjectId: selectedClass.subjectId,
      courseName: selectedClass.courseName,
      subjectName: selectedClass.subjectName,
      facultyName: selectedClass.facultyName,
      date: selectedClass.date,
      takenBy: currentUser?.id || 'faculty-1',
      takenByName: currentUser?.name || 'Faculty',
      totalStudents: students.length,
      presentCount,
      absentCount,
      lateCount,
      records,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Compute student-by-student attendance stats across all recorded sessions
  const studentReports = students.map((student) => {
    let totalSessions = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    attendance.forEach((session) => {
      const rec = session.records.find((r) => r.studentId === student.id);
      if (rec) {
        totalSessions += 1;
        if (rec.status === 'present') presentCount += 1;
        else if (rec.status === 'absent') absentCount += 1;
        else if (rec.status === 'late') lateCount += 1;
      }
    });

    // Provide baseline representative data if no sessions taken yet
    if (totalSessions === 0) {
      totalSessions = 12;
      presentCount = student.id === 'student-1' ? 11 : student.id === 'student-2' ? 8 : 10;
      absentCount = totalSessions - presentCount;
    }

    const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;
    const isAtRisk = percentage < 75;

    return {
      student,
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      percentage,
      isAtRisk,
    };
  });

  const filteredStudentReports = studentReports.filter((item) => {
    const matchesSearch =
      item.student.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
      item.student.email.toLowerCase().includes(reportSearch.toLowerCase()) ||
      (item.student.admissionNumber &&
        item.student.admissionNumber.toLowerCase().includes(reportSearch.toLowerCase()));

    const matchesStatus =
      reportStatusFilter === 'all' ||
      (reportStatusFilter === 'at_risk' && item.isAtRisk) ||
      (reportStatusFilter === 'good' && !item.isAtRisk);

    return matchesSearch && matchesStatus;
  });

  const atRiskCount = studentReports.filter((s) => s.isAtRisk).length;
  const averageRate =
    studentReports.length > 0
      ? Math.round(studentReports.reduce((sum, s) => sum + s.percentage, 0) / studentReports.length)
      : 88;

  const handleSendWarning = (studentName: string) => {
    addNotification({
      title: `Low Attendance Alert: ${studentName}`,
      message: `Student ${studentName} is below the 75% attendance threshold. Please review academic status.`,
      type: 'warning',
    });
    setNoticeSentMessage(`Low attendance warning notice dispatched for ${studentName}!`);
    setTimeout(() => setNoticeSentMessage(''), 3000);
  };

  const handleExportReportCSV = () => {
    const rows = studentReports.map((r) => ({
      StudentID: r.student.id,
      StudentName: r.student.name,
      AdmissionNumber: r.student.admissionNumber || 'N/A',
      Email: r.student.email,
      TotalSessions: r.totalSessions,
      PresentCount: r.presentCount,
      AbsentCount: r.absentCount,
      AttendanceRate: `${r.percentage}%`,
      Status: r.isAtRisk ? 'At Risk (<75%)' : 'Good Standing',
    }));
    exportToCSV('attendance_analytics_report', rows);
  };

  // Student specific view
  if (isStudent) {
    const mySessions = attendance.flatMap((session) =>
      session.records
        .filter((r) => r.studentId === currentUser?.id)
        .map((r) => ({
          ...r,
          date: session.date,
          classId: session.classId,
          courseId: session.courseId,
          courseName: session.courseName,
          subjectName: session.subjectName,
        }))
    );

    const totalMyClasses = mySessions.length > 0 ? mySessions.length : 12;
    const totalPresent = mySessions.length > 0 ? mySessions.filter((s) => s.status === 'present').length : 11;
    const attendancePercentage = Math.round((totalPresent / totalMyClasses) * 100);
    const isLow = attendancePercentage < 75;

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Student Header */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#117B78] uppercase tracking-wider">
                Student Attendance Records
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Your Academic Attendance
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Minimum required institutional rate is 75% for examination qualification.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-center min-w-[140px]">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Current Rate</p>
                <p className={`text-3xl font-black mt-0.5 ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {attendancePercentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>Attendance Progress</span>
              <span>{attendancePercentage}% Attendance Score</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLow ? 'bg-rose-500' : 'bg-[#117B78]'
                }`}
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>

          {isLow && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-800 font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Alert: Your attendance is currently below 75%. Please contact your Academic Coordinator.
              </span>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Class-by-Class Attendance History</h3>
          <div className="space-y-3">
            {mySessions.length > 0 ? (
              mySessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {session.subjectName || 'Lecture Session'} • {session.date}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {session.courseName || 'Full-Stack Software Engineering'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      session.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : session.status === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Attendance records are synchronizing with your faculty's submissions.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Faculty / Coordinator / Admin Roster & Reports view
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Attendance Management & Comprehensive Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mark daily class attendance, analyze institutional rates, and export attendance audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Reports CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('mark')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'mark'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Mark Class Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Attendance Reports & Analytics</span>
        </button>
      </div>

      {noticeSentMessage && (
        <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs font-bold text-teal-800 flex items-center gap-2 animate-in fade-in">
          <Bell className="w-4 h-4 text-[#117B78]" />
          <span>{noticeSentMessage}</span>
        </div>
      )}

      {/* 1. MARK ATTENDANCE TAB */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Class Selector Bar */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Select Class Session to Mark Attendance
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full sm:max-w-md h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-bold text-slate-800 outline-none focus:border-[#117B78]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.date} • {c.subjectName} ({c.startTime}) - {c.facultyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAttendance}
                className="flex items-center gap-2 rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit & Save Attendance</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Attendance recorded successfully! Present students earned +5 attendance points.</span>
            </div>
          )}

          {/* Students Roster Table */}
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Attendance Roster ({students.length} Enrolled)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mark status: Present, Absent, Late, or Excused for each student.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const markAll: Record<string, { status: AttendanceStatus; remarks: string }> = {};
                    students.forEach((s) => (markAll[s.id] = { status: 'present', remarks: '' }));
                    setRoster(markAll);
                  }}
                  className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
                >
                  Mark All Present
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-4">Admission ID</th>
                    <th className="py-3 px-6 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {students.map((student) => {
                    const currentStatus = roster[student.id]?.status || 'present';
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-[#117B78]/10 text-[#117B78] flex items-center justify-center font-bold text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-[11px] text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          {student.admissionNumber || 'ADM-2026'}
                        </td>

                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-1.5">
                            {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => {
                              const isSelected = currentStatus === status;
                              return (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(student.id, status)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                                    isSelected
                                      ? status === 'present'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : status === 'absent'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : status === 'late'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-cyan-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Average Attendance</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{averageRate}%</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">Institutional standard: 75%</p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Total Classes Conducted</span>
                <Calendar className="w-4 h-4 text-[#117B78]" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{attendance.length || classes.length}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Live recorded sessions</p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Students In Good Standing</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                {studentReports.length - atRiskCount} / {studentReports.length}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Attendance rate &gt;= 75%</p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">At-Risk Students (&lt;75%)</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <p className={`text-2xl font-black mt-2 ${atRiskCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {atRiskCount} Students
              </p>
              <p className="text-[11px] text-rose-600 font-medium mt-1">Requires coordinator check-in</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search report by student name or admission ID..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium outline-none focus:border-[#117B78]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value as any)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
              >
                <option value="all">All Attendance Rates</option>
                <option value="at_risk">At Risk (&lt;75%) Only</option>
                <option value="good">Good Standing (&gt;=75%)</option>
              </select>
            </div>
          </div>

          {/* Student Report Table */}
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Attendance Performance Report</h3>
                <p className="text-xs text-slate-500">Aggregate session tracking and status breakdown</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Student Details</th>
                    <th className="px-5 py-3.5">Admission No</th>
                    <th className="px-5 py-3.5 text-center">Sessions Held</th>
                    <th className="px-5 py-3.5 text-center">Present</th>
                    <th className="px-5 py-3.5 text-center">Absent</th>
                    <th className="px-5 py-3.5 text-center">Rate %</th>
                    <th className="px-5 py-3.5 text-center">Standing</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredStudentReports.map((r) => (
                    <tr key={r.student.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{r.student.name}</p>
                          <p className="text-[11px] text-slate-400">{r.student.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-600">
                        {r.student.admissionNumber || 'ADM-2026'}
                      </td>
                      <td className="px-5 py-4 text-center font-bold">{r.totalSessions}</td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-600">{r.presentCount}</td>
                      <td className="px-5 py-4 text-center font-bold text-rose-600">{r.absentCount}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-md ${
                            r.isAtRisk
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {r.isAtRisk ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>At Risk</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Good</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {r.isAtRisk && (
                          <button
                            onClick={() => handleSendWarning(r.student.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                          >
                            <Bell className="w-3 h-3" />
                            <span>Notify Warning</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredStudentReports.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No students match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
