import React, { useState } from 'react';
import {
  CheckSquare,
  Award,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  Send,
  Sparkles,
  Trophy,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskSubmission } from '../types';

export const TasksView: React.FC = () => {
  const {
    tasks,
    taskSubmissions,
    courses,
    subjects,
    users,
    createTask,
    submitTask,
    gradeTaskSubmission,
    currentUser,
    activeRole,
    can,
    pointsHistory,
  } = useApp();

  const isStudent = activeRole === 'student';
  const isFacultyOrAdmin = !isStudent;

  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'leaderboard' | 'points'>('tasks');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<Task | null>(null);

  // Task Creation Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCourseId, setTaskCourseId] = useState(courses[0]?.id || '');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [taskPoints, setTaskPoints] = useState(50);

  // Student Submission Form
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  // Faculty Grading Form
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingPoints, setGradingPoints] = useState(50);
  const [gradingFeedback, setGradingFeedback] = useState('Excellent solution!');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === taskCourseId);
    const subject = subjects.find((s) => s.id === taskSubjectId);

    createTask({
      title: taskTitle,
      description: taskDescription,
      courseId: taskCourseId,
      subjectId: taskSubjectId,
      courseName: course?.name || 'Full-Stack Software Engineering',
      subjectName: subject?.name || 'Advanced TypeScript & React Architecture',
      assignedTo: 'all',
      dueDate: taskDueDate,
      points: taskPoints,
      createdBy: currentUser?.id || 'faculty-1',
      createdByName: currentUser?.name || 'Faculty',
    });

    setTaskTitle('');
    setTaskDescription('');
    setShowCreateModal(false);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForSubmission || !currentUser) return;

    submitTask(
      selectedTaskForSubmission.id,
      currentUser.id,
      currentUser.name,
      submissionContent,
      submissionUrl
    );

    setSelectedTaskForSubmission(null);
    setSubmissionContent('');
    setSubmissionUrl('');
  };

  // Student points calculation
  const studentTotalPoints = pointsHistory
    .filter((p) => p.studentId === currentUser?.id)
    .reduce((sum, item) => sum + item.points, 0);

  // Leaderboard Calculation across all students
  const studentsList = users.filter((u) => u.role === 'student');
  const leaderboard = studentsList
    .map((student) => {
      const pts = pointsHistory
        .filter((p) => p.studentId === student.id)
        .reduce((sum, item) => sum + item.points, 0);
      return {
        ...student,
        totalPoints: pts,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Tasks, Submissions & Points
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Coursework deliverables, grading feedback, and student achievement reward leaderboards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFacultyOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'tasks'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Assignments ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'leaderboard'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Student Leaderboard</span>
        </button>

        {isStudent && (
          <button
            onClick={() => setActiveSubTab('points')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'points'
                ? 'bg-[#117B78] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>My Points History ({studentTotalPoints} pts)</span>
          </button>
        )}
      </div>

      {/* 1. TASKS TAB */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tasks List */}
          <div className="lg:col-span-7 space-y-4">
            {tasks.map((task) => {
              const mySubmission = taskSubmissions.find(
                (s) => s.taskId === task.id && s.studentId === currentUser?.id
              );

              return (
                <div
                  key={task.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#117B78] bg-[#117B78]/10 px-2 py-0.5 rounded">
                          {task.courseName}
                        </span>
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          +{task.points} Reward Points
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2">{task.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: {task.dueDate}</span>
                        </span>
                        <span>Instructor: {task.createdByName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Submission Status Bar */}
                  {isStudent && (
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {mySubmission ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                              mySubmission.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mySubmission.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Status: {mySubmission.status}
                          </span>
                          {mySubmission.pointsAwarded > 0 && (
                            <span className="text-xs font-bold text-amber-600">
                              +{mySubmission.pointsAwarded} pts awarded
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTaskForSubmission(task)}
                          className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
                        >
                          Submit Assignment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submissions & Grading Drawer for Faculty / Admin */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Student Submissions ({taskSubmissions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Review submissions, provide qualitative feedback, and award points.
              </p>
            </div>

            <div className="space-y-3">
              {taskSubmissions.length > 0 ? (
                taskSubmissions.map((sub) => {
                  const task = tasks.find((t) => t.id === sub.taskId);
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{sub.studentName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{task?.title}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="rounded-xl bg-white p-3 border border-slate-100 text-xs text-slate-700">
                        <p className="font-semibold text-slate-900 mb-1">Answer / Notes:</p>
                        <p>{sub.content}</p>
                        {sub.attachmentUrl && (
                          <a
                            href={sub.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-[11px] font-bold text-[#117B78] hover:underline"
                          >
                            View Submission Attachment →
                          </a>
                        )}
                      </div>

                      {isFacultyOrAdmin && sub.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              gradeTaskSubmission(sub.id, 'approved', task?.points || 50, 'Well done!');
                            }}
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve (+{task?.points || 50} pts)</span>
                          </button>
                          <button
                            onClick={() => {
                              gradeTaskSubmission(sub.id, 'rejected', 0, 'Please revise and resubmit.');
                            }}
                            className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No submissions pending review.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. LEADERBOARD TAB */}
      {activeSubTab === 'leaderboard' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Institutional Student Leaderboard</h3>
              <p className="text-xs text-slate-500">
                Points accrued through task completions, class attendance, and academic excellence.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {leaderboard.map((student, rank) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                      rank === 0
                        ? 'bg-amber-400 text-slate-900 shadow-sm'
                        : rank === 1
                        ? 'bg-slate-300 text-slate-800'
                        : rank === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{rank + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{student.name}</p>
                    <p className="text-[11px] text-slate-400">{student.admissionNumber || student.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#117B78]">{student.totalPoints}</span>
                  <span className="text-xs font-semibold text-slate-500 ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. POINTS TAB (Student View) */}
      {activeSubTab === 'points' && isStudent && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Point Accumulation History</h3>
            <span className="text-sm font-black text-[#117B78]">{studentTotalPoints} Total Points</span>
          </div>

          <div className="space-y-3">
            {pointsHistory
              .filter((p) => p.studentId === currentUser?.id)
              .map((point) => (
                <div
                  key={point.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{point.reason}</p>
                      <p className="text-[11px] text-slate-400">{point.date}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    +{point.points} pts
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Create Academic Assignment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Specify assignment details, points reward, and due date.
            </p>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Custom React Hook"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program</label>
                <select
                  value={taskCourseId}
                  onChange={(e) => setTaskCourseId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reward Points</label>
                  <input
                    type="number"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Detailed guidelines and evaluation criteria..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {selectedTaskForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Submit Assignment</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedTaskForSubmission.title}</p>

            <form onSubmit={handleStudentSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Solution / Answer</label>
                <textarea
                  rows={4}
                  required
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Explain your approach or write code/answers here..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GitHub / Google Drive Link (Optional)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/my-repo or Drive link"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForSubmission(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Submit Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
