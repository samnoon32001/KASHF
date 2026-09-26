import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Play,
  CheckCircle,
  ExternalLink,
  Users,
  ClipboardCheck,
  FileText,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassSession } from '../types';

export const ClassesView: React.FC = () => {
  const {
    classes,
    courses,
    subjects,
    users,
    addClassSession,
    startClassSession,
    endClassSession,
    currentUser,
    activeRole,
    can,
    setActiveTab,
  } = useApp();

  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedClassForNotes, setSelectedClassForNotes] = useState<ClassSession | null>(null);

  // Schedule Class Form
  const [formCourseId, setFormCourseId] = useState(courses[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formFacultyId, setFormFacultyId] = useState(users.find((u) => u.role === 'faculty')?.id || '');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('10:00 AM');
  const [formEndTime, setFormEndTime] = useState('11:30 AM');
  const [formMeetUrl, setFormMeetUrl] = useState('https://meet.google.com/abc-educ-ore');
  const [formNotes, setFormNotes] = useState('');

  const isFaculty = activeRole === 'faculty';
  const isStudent = activeRole === 'student';
  const canSchedule = can('courses.edit') || currentUser?.role === 'super_admin' || isFaculty;

  const filteredClasses = classes.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesDate =
      dateFilter === 'all' ||
      (dateFilter === 'today' && c.date === new Date().toISOString().split('T')[0]);
    return matchesStatus && matchesDate;
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === formCourseId);
    const subject = subjects.find((s) => s.id === formSubjectId);
    const faculty = users.find((u) => u.id === formFacultyId);

    addClassSession({
      courseId: formCourseId,
      subjectId: formSubjectId,
      facultyId: formFacultyId,
      courseName: course?.name || 'Full-Stack Software Engineering',
      subjectName: subject?.name || 'Advanced TypeScript & React Architecture',
      facultyName: faculty?.name || 'Dr. Sarah Jenkins',
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      meetUrl: formMeetUrl,
      status: 'scheduled',
      notes: formNotes,
    });

    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Live Classes & Google Meet Sessions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time interactive classrooms with synchronized Google Meet links and attendance rosters.
          </p>
        </div>

        {canSchedule && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Class</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateFilter('all')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-[#117B78] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-[#117B78] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Today Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live Now</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredClasses.map((session) => {
          const isLive = session.status === 'live';
          const isCompleted = session.status === 'completed';

          return (
            <div
              key={session.id}
              className={`rounded-3xl border bg-white p-5 sm:p-6 transition shadow-xs ${
                isLive
                  ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#117B78] bg-[#117B78]/10 px-2.5 py-0.5 rounded-lg">
                      {session.courseName}
                    </span>

                    {isLive ? (
                      <span className="flex items-center gap-1.5 rounded-lg bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-rose-600" />
                        LIVE CLASS IN SESSION
                      </span>
                    ) : isCompleted ? (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="rounded-lg bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
                        SCHEDULED
                      </span>
                    )}

                    {session.attendanceSubmitted ? (
                      <span className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Attendance Recorded
                      </span>
                    ) : (
                      <span className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                        Pending Attendance
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {session.subjectName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{session.date}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>
                        {session.startTime} - {session.endTime}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Faculty: {session.facultyName}</span>
                    </span>
                  </div>

                  {session.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">Notes:</span> {session.notes}
                    </p>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Faculty Start Class / Student Join Class */}
                  {isStudent ? (
                    <a
                      href={session.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0D9C88] transition cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Class (Google Meet)</span>
                    </a>
                  ) : (
                    <>
                      {session.status !== 'completed' && (
                        <button
                          onClick={() => {
                            startClassSession(session.id);
                            window.open(session.meetUrl, '_blank');
                          }}
                          className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0D9C88] transition cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>{isLive ? 'Re-open Meet' : 'Start Class (Meet)'}</span>
                        </button>
                      )}

                      {isLive && (
                        <button
                          onClick={() => endClassSession(session.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition cursor-pointer"
                        >
                          <span>End Class</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveTab('attendance')}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                        <span>Take Attendance</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Schedule Live Class Session</h3>
            <p className="text-xs text-slate-500 mt-1">
              Creates a synchronized Google Meet classroom and notifies enrolled students.
            </p>

            <form onSubmit={handleScheduleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Program</label>
                <select
                  value={formCourseId}
                  onChange={(e) => {
                    setFormCourseId(e.target.value);
                    const firstSubj = subjects.find((s) => s.courseId === e.target.value);
                    if (firstSubj) setFormSubjectId(firstSubj.id);
                  }}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Module</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  {subjects
                    .filter((s) => !formCourseId || s.courseId === formCourseId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Faculty</label>
                  <select
                    value={formFacultyId}
                    onChange={(e) => setFormFacultyId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    {users
                      .filter((u) => u.role === 'faculty')
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Meet Link
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={formMeetUrl}
                    onChange={(e) => setFormMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preparation Notes / Agenda
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Instructions for students to prepare before class..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Schedule & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
