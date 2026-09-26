import React, { useState } from 'react';
import {
  Palette,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileEdit,
  ArrowRight,
  Filter,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CreativeTask, CreativeTaskType } from '../types';

export const CreativeTasksView: React.FC = () => {
  const {
    creativeTasks,
    users,
    createCreativeTask,
    updateCreativeTaskStatus,
    addCreativeTaskComment,
    requestCreativeRevision,
    currentUser,
    activeRole,
  } = useApp();

  const [selectedTask, setSelectedTask] = useState<CreativeTask | null>(creativeTasks[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<CreativeTaskType>('social_post');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [taskDeadline, setTaskDeadline] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [taskBrief, setTaskBrief] = useState('');

  const creativeStaff = users.filter((u) => u.role === 'creative_head');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCreativeTask({
      title: taskTitle,
      description: taskDescription,
      type: taskType,
      priority: taskPriority,
      assignedTo: creativeStaff[0]?.id || 'creative-1',
      assignedName: creativeStaff[0]?.name || 'Marcus Vance',
      deadline: taskDeadline,
      brief: taskBrief,
      status: 'new',
    });

    setTaskTitle('');
    setTaskDescription('');
    setTaskBrief('');
    setShowCreateModal(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !selectedTask) return;
    addCreativeTaskComment(selectedTask.id, commentText);
    setCommentText('');
  };

  const handleSendRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote || !selectedTask) return;
    requestCreativeRevision(selectedTask.id, revisionNote);
    setRevisionNote('');
    setShowRevisionModal(false);
  };

  // Pipeline columns
  const columns: { label: string; status: CreativeTask['status'] }[] = [
    { label: 'New Briefs', status: 'new' },
    { label: 'In Progress', status: 'in_progress' },
    { label: 'In Review', status: 'review' },
    { label: 'Revision Required', status: 'revision_required' },
    { label: 'Approved & Completed', status: 'completed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Creative Studio & Campaigns Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Produce marketing creatives, event banners, social posts, and institutional branding.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Creative Task</span>
        </button>
      </div>

      {/* Main Grid: Kanban Overview on Left, Task Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kanban Board */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {columns.slice(0, 3).map((col) => {
            const tasksInCol = creativeTasks.filter(
              (t) =>
                t.status === col.status ||
                (col.status === 'completed' && t.status === 'approved')
            );
            return (
              <div key={col.status} className="rounded-3xl bg-slate-50/75 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {col.label}
                  </h4>
                  <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    {tasksInCol.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tasksInCol.map((task) => {
                    const isSelected = selectedTask?.id === task.id;
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`rounded-2xl p-4 bg-white border transition cursor-pointer ${
                          isSelected
                            ? 'border-[#117B78] shadow-md ring-2 ring-[#117B78]/15'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${
                              task.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {task.deadline}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                          {task.title}
                        </h5>

                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                          <span className="text-[#117B78] font-semibold">{task.assignedName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Task Details & Revision Workflow Drawer */}
        {selectedTask ? (
          <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[10px] font-bold text-[#117B78] uppercase">
                  {selectedTask.type.replace('_', ' ')}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 capitalize">
                  {selectedTask.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{selectedTask.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{selectedTask.description}</p>
            </div>

            {/* Brief Box */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
              <h5 className="font-bold text-slate-800 mb-1">Creative Brief / Requirements:</h5>
              <p className="text-slate-600 leading-relaxed">{selectedTask.brief}</p>
            </div>

            {/* Workflow status actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Update Status / Approvals
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateCreativeTaskStatus(selectedTask.id, 'in_progress')}
                  className="rounded-xl border border-slate-200 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => updateCreativeTaskStatus(selectedTask.id, 'review')}
                  className="rounded-xl border border-slate-200 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Send for Review
                </button>
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="rounded-xl bg-amber-50 border border-amber-200 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                >
                  Request Revision
                </button>
                <button
                  onClick={() => updateCreativeTaskStatus(selectedTask.id, 'completed')}
                  className="rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Approve & Finalize
                </button>
              </div>
            </div>

            {/* Revisions History */}
            {selectedTask.revisions && selectedTask.revisions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  Revision Requests ({selectedTask.revisions.length})
                </p>
                {selectedTask.revisions.map((rev) => (
                  <div key={rev.id} className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-900">
                    <p className="font-semibold">{rev.note}</p>
                    <span className="text-[10px] text-rose-500 mt-1 block">{rev.requestedAt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-900">Task Comments & Feedback</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedTask.comments.map((c) => (
                  <div key={c.id} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700">{c.author}</span>
                      <span>{c.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type note or feedback..."
                  className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#117B78]"
                />
                <button
                  type="submit"
                  className="h-9 w-9 rounded-xl bg-[#117B78] text-white flex items-center justify-center hover:bg-[#0D9C88] cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-400">
            Select a task to review brief, workflow and comments.
          </div>
        )}
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Request Revision</h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide actionable guidance on what adjustments are required for {selectedTask.title}.
            </p>

            <form onSubmit={handleSendRevision} className="mt-4 space-y-3">
              <textarea
                rows={3}
                required
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="e.g. Please update the logo to the high-contrast white vector variant and adjust margins..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#117B78]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer"
                >
                  Submit Revision Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Creative Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">New Creative Brief</h3>
            <p className="text-xs text-slate-500 mt-1">Assign visual design or multimedia asset.</p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Admissions 2026 Social Post Carousel"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asset Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as CreativeTaskType)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-[#117B78]"
                  >
                    <option value="social_post">Social Media Post</option>
                    <option value="poster">Poster</option>
                    <option value="event_banner">Event Banner</option>
                    <option value="video">Promotional Video</option>
                    <option value="reel">Instagram Reel</option>
                    <option value="brochure">Brochure</option>
                    <option value="flyer">Flyer</option>
                    <option value="certificate">Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-[#117B78]"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brief & Specs</label>
                <textarea
                  rows={3}
                  value={taskBrief}
                  onChange={(e) => setTaskBrief(e.target.value)}
                  placeholder="Dimensions, text copy, branding palette instructions..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#117B78]"
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
                  Create Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
