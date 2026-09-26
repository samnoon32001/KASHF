import React, { useState, useEffect } from 'react';
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
  Search,
  Trash2,
  Edit2,
  AlertTriangle,
  X,
  Star,
  Coins,
  History,
  TrendingUp,
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
    updateTask,
    deleteTask,
    submitTask,
    updateTaskSubmission,
    deleteTaskSubmission,
    gradeTaskSubmission,
    awardStudentPoints,
    deletePointsRecord,
    currentUser,
    activeRole,
    can,
    pointsHistory,
    globalSearchQuery,
  } = useApp();

  const isStudent = activeRole === 'student';
  const isFacultyOrAdmin = !isStudent || currentUser?.role === 'super_admin';

  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'submissions' | 'point_system' | 'leaderboard'>('tasks');
  const [taskSearchQuery, setTaskSearchQuery] = useState(globalSearchQuery || '');

  useEffect(() => {
    if (globalSearchQuery) {
      setTaskSearchQuery(globalSearchQuery);
      setActiveSubTab('tasks');
    }
  }, [globalSearchQuery]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<Task | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<TaskSubmission | null>(null);
  const [submissionToDelete, setSubmissionToDelete] = useState<TaskSubmission | null>(null);

  // Award Points Modal
  const [showAwardPointsModal, setShowAwardPointsModal] = useState(false);
  const [awardStudentId, setAwardStudentId] = useState('');
  const [awardAmount, setAwardAmount] = useState(25);
  const [awardReason, setAwardReason] = useState('Outstanding Classroom Contribution');

  // Task Creation & Edit Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCourseId, setTaskCourseId] = useState(courses[0]?.id || '');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [taskPoints, setTaskPoints] = useState(50);

  // Edit Task State
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskPoints, setEditTaskPoints] = useState(50);
  const [editTaskCourseId, setEditTaskCourseId] = useState('');
  const [editTaskSubjectId, setEditTaskSubjectId] = useState('');

  // Student Submission Form
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  // Edit Submission Form
  const [editSubContent, setEditSubContent] = useState('');
  const [editSubUrl, setEditSubUrl] = useState('');

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
      points: Number(taskPoints),
      createdBy: currentUser?.id || 'faculty-1',
      createdByName: currentUser?.name || 'Faculty',
    });

    setTaskTitle('');
    setTaskDescription('');
    setShowCreateModal(false);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description);
    setEditTaskDueDate(task.dueDate);
    setEditTaskPoints(task.points);
    setEditTaskCourseId(task.courseId);
    setEditTaskSubjectId(task.subjectId);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const course = courses.find((c) => c.id === editTaskCourseId);
    const subject = subjects.find((s) => s.id === editTaskSubjectId);

    updateTask(editingTask.id, {
      title: editTaskTitle,
      description: editTaskDescription,
      dueDate: editTaskDueDate,
      points: Number(editTaskPoints),
      courseId: editTaskCourseId,
      subjectId: editTaskSubjectId,
      courseName: course?.name || editingTask.courseName,
      subjectName: subject?.name || editingTask.subjectName,
    });

    setEditingTask(null);
  };

  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    setTaskToDelete(null);
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

  const handleOpenEditSubmission = (sub: TaskSubmission) => {
    setEditingSubmission(sub);
    setEditSubContent(sub.content);
    setEditSubUrl(sub.attachmentUrl || '');
  };

  const handleSaveEditSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;

    updateTaskSubmission(editingSubmission.id, {
      content: editSubContent,
      attachmentUrl: editSubUrl,
    });

    setEditingSubmission(null);
  };

  const handleConfirmDeleteSubmission = () => {
    if (!submissionToDelete) return;
    deleteTaskSubmission(submissionToDelete.id);
    setSubmissionToDelete(null);
  };

  const handleAwardPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardStudentId) return;

    awardStudentPoints(awardStudentId, Number(awardAmount), awardReason);
    setShowAwardPointsModal(false);
    setAwardStudentId('');
    setAwardAmount(25);
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

  const getTierBadge = (points: number) => {
    if (points >= 150) return { label: 'Master Scholar', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (points >= 100) return { label: 'Gold Scholar', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (points >= 50) return { label: 'Silver Scholar', color: 'bg-slate-200 text-slate-800 border-slate-300' };
    return { label: 'Emerging Scholar', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const filteredTasks = tasks.filter((t) => {
    if (!taskSearchQuery.trim()) return true;
    const q = taskSearchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.courseName.toLowerCase().includes(q) ||
      t.subjectName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Tasks, Submissions & Points System
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage course deliverables, review submissions, grade student assignments, and award points.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isFacultyOrAdmin && (
            <>
              <button
                onClick={() => {
                  setAwardStudentId(studentsList[0]?.id || '');
                  setShowAwardPointsModal(true);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer shadow-xs"
              >
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Award Points</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'tasks'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Academic Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'submissions'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Submissions & Grading ({taskSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('point_system')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'point_system'
              ? 'bg-[#117B78] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Student Point System</span>
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
          <span>Leaderboard</span>
        </button>
      </div>

      {/* 1. TASKS TAB */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          {/* Tasks Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by title, course, or subject..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#117B78] outline-none"
              />
            </div>
            {taskSearchQuery && (
              <button
                onClick={() => setTaskSearchQuery('')}
                className="text-xs font-semibold text-[#117B78] hover:underline cursor-pointer self-start sm:self-center"
              >
                Clear filter ({filteredTasks.length} found)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const mySubmission = taskSubmissions.find(
                (s) => s.taskId === task.id && s.studentId === currentUser?.id
              );
              const taskSubCount = taskSubmissions.filter((s) => s.taskId === task.id).length;

              return (
                <div
                  key={task.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#117B78] bg-[#117B78]/10 px-2.5 py-0.5 rounded-md">
                          {task.courseName}
                        </span>
                        <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          +{task.points} Pts
                        </span>
                      </div>

                      {isFacultyOrAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditTask(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#117B78] hover:bg-slate-100 transition cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2.5">{task.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                      {task.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due: {task.dueDate}</span>
                      </span>
                      <span>•</span>
                      <span>By: {task.createdByName}</span>
                      <span>•</span>
                      <span>{taskSubCount} submissions</span>
                    </div>
                  </div>

                  {/* Student Submission Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {isStudent ? (
                      mySubmission ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
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
                                +{mySubmission.pointsAwarded} pts
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditSubmission(mySubmission)}
                              className="text-[11px] font-bold text-[#117B78] hover:underline cursor-pointer"
                            >
                              Edit Submission
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTaskForSubmission(task)}
                          className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0D9C88] transition cursor-pointer"
                        >
                          Submit Assignment
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => setActiveSubTab('submissions')}
                        className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
                      >
                        View & Grade Submissions ({taskSubCount}) →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {tasks.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No tasks created yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Faculty and coordinators can click "Create Task" to assign coursework.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. SUBMISSIONS & GRADING TAB */}
      {activeSubTab === 'submissions' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                All Student Submissions ({taskSubmissions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Review submitted assignments, edit submissions, provide qualitative feedback, and award points.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {taskSubmissions.map((sub) => {
              const task = tasks.find((t) => t.id === sub.taskId);
              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{sub.studentName}</p>
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
                        {sub.pointsAwarded > 0 && (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            +{sub.pointsAwarded} Points
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        Task: {task?.title || 'Coursework Assignment'} ({task?.courseName})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditSubmission(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#117B78] hover:bg-white border border-transparent hover:border-slate-200 transition cursor-pointer"
                        title="Edit Submission"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSubmissionToDelete(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-3.5 border border-slate-200 text-xs text-slate-700 space-y-2">
                    <p className="font-semibold text-slate-900">Student Response:</p>
                    <p className="whitespace-pre-wrap">{sub.content}</p>
                    {sub.attachmentUrl && (
                      <div className="pt-1">
                        <a
                          href={sub.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#117B78] hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Submitted Attachment / Drive Link</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {sub.feedback && (
                    <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100 text-xs text-emerald-900">
                      <p className="font-bold text-emerald-800">Faculty Feedback:</p>
                      <p className="mt-0.5">{sub.feedback}</p>
                    </div>
                  )}

                  {isFacultyOrAdmin && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          gradeTaskSubmission(sub.id, 'approved', task?.points || 50, 'Outstanding work!');
                        }}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve (+{task?.points || 50} pts)</span>
                      </button>

                      <button
                        onClick={() => {
                          gradeTaskSubmission(sub.id, 'rejected', 0, 'Revisions required.');
                        }}
                        className="flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {taskSubmissions.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-500">
                No submissions submitted yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. STUDENT POINT SYSTEM TAB */}
      {activeSubTab === 'point_system' && (
        <div className="space-y-6">
          {/* Points Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Points Distributed</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {pointsHistory.reduce((s, p) => s + p.points, 0)} pts
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Across all coursework & attendance</p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase">Top Scholar Leader</p>
              <p className="text-2xl font-black text-[#117B78] mt-1">
                {leaderboard[0]?.name || 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {leaderboard[0]?.totalPoints || 0} pts accumulated
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase">Points Events Recorded</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {pointsHistory.length} logs
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Audited ledger with deletion controls</p>
            </div>
          </div>

          {/* Points Audit Ledger */}
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Points Audit History & Log</h3>
                <p className="text-xs text-slate-500">Every rewarded or deducted point record</p>
              </div>

              {isFacultyOrAdmin && (
                <button
                  onClick={() => {
                    setAwardStudentId(studentsList[0]?.id || '');
                    setShowAwardPointsModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Award / Deduct Points</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Points</th>
                    <th className="px-5 py-3.5">Reason / Activity</th>
                    <th className="px-5 py-3.5">Date</th>
                    {isFacultyOrAdmin && <th className="px-5 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {pointsHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4 font-bold text-slate-900">{item.studentName}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-md ${
                            item.points >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.points >= 0 ? `+${item.points}` : item.points} pts
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{item.reason}</td>
                      <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{item.date}</td>
                      {isFacultyOrAdmin && (
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => deletePointsRecord(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete point log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {pointsHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No points history recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. LEADERBOARD TAB */}
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
            {leaderboard.map((student, rank) => {
              const tier = getTierBadge(student.totalPoints);
              return (
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
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{rank + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tier.color}`}>
                          {tier.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        {student.admissionNumber || student.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-black text-amber-600">
                      {student.totalPoints} pts
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Academic Task</h3>
                <p className="text-xs text-slate-500">Assign coursework to students</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Build Redux State Management Pipeline"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Brief</label>
                <textarea
                  required
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Specify task requirements, instructions, and submission requirements..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Associated Course</label>
                  <select
                    value={taskCourseId}
                    onChange={(e) => setTaskCourseId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={taskSubjectId}
                    onChange={(e) => setTaskSubjectId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reward Points</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={200}
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0D9C88] transition cursor-pointer shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Academic Task</h3>
                <p className="text-xs text-slate-500">Update task details and criteria</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course</label>
                  <select
                    value={editTaskCourseId}
                    onChange={(e) => setEditTaskCourseId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={editTaskSubjectId}
                    onChange={(e) => setEditTaskSubjectId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reward Points</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={200}
                    value={editTaskPoints}
                    onChange={(e) => setEditTaskPoints(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0D9C88] transition cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TASK CONFIRM MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete Academic Task</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">{taskToDelete.title}</strong>? Any student submissions tied to this task will remain in the database archive.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTask}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT SUBMISSION MODAL */}
      {selectedTaskForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Assignment</h3>
                <p className="text-xs text-slate-500">{selectedTaskForSubmission.title}</p>
              </div>
              <button
                onClick={() => setSelectedTaskForSubmission(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Notes / Code Response
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Paste your solution, response, or summary here..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attachment / GitHub / Google Drive URL (Optional)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/... or https://drive.google.com/..."
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForSubmission(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0D9C88] transition cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit to Faculty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUBMISSION MODAL */}
      {editingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Submission</h3>
                <p className="text-xs text-slate-500">Update submission response or attachments</p>
              </div>
              <button
                onClick={() => setEditingSubmission(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={editSubContent}
                  onChange={(e) => setEditSubContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attachment / Link URL
                </label>
                <input
                  type="url"
                  value={editSubUrl}
                  onChange={(e) => setEditSubUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubmission(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0D9C88] transition cursor-pointer shadow-sm"
                >
                  Save Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SUBMISSION CONFIRM MODAL */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete Submission</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove this submission from{' '}
              <strong className="text-slate-900">{submissionToDelete.studentName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSubmissionToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSubmission}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Delete Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AWARD POINTS MODAL */}
      {showAwardPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Award Student Points</h3>
                  <p className="text-xs text-slate-500">Reward academic excellence</p>
                </div>
              </div>
              <button
                onClick={() => setShowAwardPointsModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAwardPointsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  required
                  value={awardStudentId}
                  onChange={(e) => setAwardStudentId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  {studentsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNumber || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Point Amount (+/-)
                </label>
                <input
                  type="number"
                  required
                  value={awardAmount}
                  onChange={(e) => setAwardAmount(Number(e.target.value))}
                  placeholder="e.g. 25 (or -10 for penalty)"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Activity
                </label>
                <input
                  type="text"
                  required
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  placeholder="e.g. Top Quiz Scorer, Attendance Bonus, Project Demo"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAwardPointsModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition cursor-pointer shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>Grant Points</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
