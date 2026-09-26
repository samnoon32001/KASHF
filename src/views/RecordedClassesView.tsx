import React, { useState } from 'react';
import {
  Video,
  Play,
  Search,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  BookOpen,
  Sparkles,
  X,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecordedClass } from '../types';

export const RecordedClassesView: React.FC = () => {
  const {
    recordedClasses,
    courses,
    subjects,
    users,
    addRecordedClass,
    updateRecordedClass,
    deleteRecordedClass,
    can,
    currentUser,
    activeRole,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<RecordedClass | null>(null);
  const [editingRecording, setEditingRecording] = useState<RecordedClass | null>(null);
  const [recordingToDelete, setRecordingToDelete] = useState<RecordedClass | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCourseId, setFormCourseId] = useState(courses[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formDriveUrl, setFormDriveUrl] = useState('');
  const [formDuration, setFormDuration] = useState('1 hr 15 min');
  const [formClassDate, setFormClassDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editDriveUrl, setEditDriveUrl] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editClassDate, setEditClassDate] = useState('');

  const canManage = can('courses.edit') || currentUser?.role === 'super_admin' || activeRole === 'faculty';

  const handleOpenEdit = (rec: RecordedClass) => {
    setEditingRecording(rec);
    setEditTitle(rec.title);
    setEditDescription(rec.description);
    setEditCourseId(rec.courseId);
    setEditSubjectId(rec.subjectId);
    setEditDriveUrl(rec.driveUrl);
    setEditDuration(rec.duration);
    setEditClassDate(rec.classDate);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecording) return;

    const course = courses.find((c) => c.id === editCourseId);
    const subject = subjects.find((s) => s.id === editSubjectId);

    updateRecordedClass(editingRecording.id, {
      title: editTitle,
      description: editDescription,
      courseId: editCourseId,
      subjectId: editSubjectId,
      courseName: course?.name || editingRecording.courseName,
      subjectName: subject?.name || editingRecording.subjectName,
      driveUrl: editDriveUrl,
      duration: editDuration,
      classDate: editClassDate,
    });

    setEditingRecording(null);
  };

  const handleConfirmDelete = () => {
    if (!recordingToDelete) return;
    deleteRecordedClass(recordingToDelete.id);
    setRecordingToDelete(null);
  };

  const filteredRecordings = recordedClasses.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'all' || r.courseId === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === formCourseId);
    const subject = subjects.find((s) => s.id === formSubjectId);

    addRecordedClass({
      courseId: formCourseId,
      subjectId: formSubjectId,
      facultyId: currentUser?.id || 'faculty-1',
      courseName: course?.name || 'Full-Stack Software Engineering',
      subjectName: subject?.name || 'Advanced TypeScript & React Architecture',
      facultyName: currentUser?.name || 'Dr. Sarah Jenkins',
      classDate: formClassDate,
      title: formTitle,
      description: formDescription,
      driveUrl: formDriveUrl || 'https://drive.google.com/file/d/sample-recording/view',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      duration: formDuration,
      status: 'published',
    });

    setFormTitle('');
    setFormDescription('');
    setFormDriveUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Recorded Lecture Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Replay and review classroom lectures securely linked via Google Drive.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Recording</span>
          </button>
        )}
      </div>

      {/* Search & Course Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search lectures by topic, subject or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#117B78] outline-none"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
        >
          <option value="all">All Programs</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecordings.map((rec) => (
          <div
            key={rec.id}
            className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <img
                  src={rec.thumbnail}
                  alt={rec.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                      {rec.duration}
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(rec);
                          }}
                          className="h-7 w-7 rounded-lg bg-black/60 text-white hover:text-[#117B78] hover:bg-white flex items-center justify-center transition cursor-pointer"
                          title="Edit Recording"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecordingToDelete(rec);
                          }}
                          className="h-7 w-7 rounded-lg bg-black/60 text-white hover:text-rose-400 hover:bg-white flex items-center justify-center transition cursor-pointer"
                          title="Delete Recording"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveVideoModal(rec)}
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#117B78] text-white shadow-lg group-hover:scale-110 transition cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-white/90">
                    <span className="font-mono text-emerald-300 font-bold">{rec.classDate}</span>
                    <span>{rec.facultyName}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-[11px] font-bold text-[#117B78] block truncate">
                  {rec.subjectName}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => setActiveVideoModal(rec)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#117B78]" />
                <span>Watch Online</span>
              </button>

              <a
                href={rec.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900"
              >
                <span>Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white overflow-hidden shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-[#117B78] uppercase">
                  {activeVideoModal.subjectName}
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Simulation / Embed */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-6 text-white space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#117B78] text-white shadow-xl animate-pulse">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <h4 className="text-base font-bold">Google Drive Secured Stream</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Stream high-definition lecture recording with closed captions and institutional access permissions.
                </p>
                <div className="pt-2">
                  <a
                    href={activeVideoModal.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100"
                  >
                    <span>Open in Google Drive Player</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Duration: {activeVideoModal.duration}</span>
                <span>Date: {activeVideoModal.classDate}</span>
                <span>Instructor: {activeVideoModal.facultyName}</span>
              </div>
              <p className="text-xs text-slate-700">{activeVideoModal.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Recording Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Publish Class Recording</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a Google Drive lecture link for student self-paced study.
            </p>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Lecture 3: Micro-frontend Architecture"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Program</label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Drive URL</label>
                <input
                  type="url"
                  required
                  value={formDriveUrl}
                  onChange={(e) => setFormDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formClassDate}
                    onChange={(e) => setFormClassDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="1 hr 20 min"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summary of topics discussed..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Publish Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recording Modal */}
      {editingRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Lecture Recording</h3>
              <button
                onClick={() => setEditingRecording(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Program</label>
                  <select
                    value={editCourseId}
                    onChange={(e) => {
                      setEditCourseId(e.target.value);
                      const firstSubj = subjects.find((s) => s.courseId === e.target.value);
                      if (firstSubj) setEditSubjectId(firstSubj.id);
                    }}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
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
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#117B78]"
                  >
                    {subjects
                      .filter((s) => !editCourseId || s.courseId === editCourseId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Drive Link</label>
                <input
                  type="url"
                  required
                  value={editDriveUrl}
                  onChange={(e) => setEditDriveUrl(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editClassDate}
                    onChange={(e) => setEditClassDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecording(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Save Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Recording Confirmation Modal */}
      {recordingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Lecture Recording?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">{recordingToDelete.title}</span>? Students will no longer be able to watch this replay.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordingToDelete(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
