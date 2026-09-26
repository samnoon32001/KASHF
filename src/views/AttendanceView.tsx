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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../types';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    users,
    courses,
    subjects,
    attendance,
    saveAttendanceSession,
    currentUser,
    activeRole,
    can,
    exportToCSV,
  } = useApp();

  const isStudent = activeRole === 'student';
  const students = users.filter((u) => u.role === 'student');

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
        }))
    );

    const totalMyClasses = mySessions.length;
    const totalPresent = mySessions.filter((s) => s.status === 'present').length;
    const attendancePercentage = totalMyClasses > 0 ? Math.round((totalPresent / totalMyClasses) * 100) : 92;
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
                      <p className="text-xs font-bold text-slate-900">Lecture Session {session.date}</p>
                      <p className="text-[11px] text-slate-500">Full-Stack Software Engineering</p>
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
                Attendance records will show here once your faculty submits the session roster.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Faculty / Coordinator / Admin Roster view
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Class Attendance Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record, audit, and export student attendance with instant point award logic.
          </p>
        </div>

        <button
          onClick={() => {
            const rows = students.map((s) => ({
              ID: s.id,
              Name: s.name,
              AdmissionNo: s.admissionNumber || 'N/A',
              Status: roster[s.id]?.status || 'present',
              Date: selectedClass?.date || new Date().toISOString().split('T')[0],
              Subject: selectedClass?.subjectName || 'N/A',
            }));
            exportToCSV('attendance_roster', rows);
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>Export Roster CSV</span>
        </button>
      </div>

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

      {/* Roster Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Student Attendance Roster ({students.length} Enrolled)
            </h3>
            <p className="text-[11px] text-slate-500">
              Select status: Present, Absent, Late, or Excused for each student.
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
  );
};
