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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course, Subject } from '../types';

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
  const facultyMembers = users.filter((u) => u.role === 'faculty');
  const studentsList = users.filter((u) => u.role === 'student');

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

            {/* Enrolled Students Roster preview */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Enrolled Students ({enrolledStudents.length})
                </h4>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
                >
                  Manage Students →
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {enrolledStudents.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-white"
                  >
                    <div className="h-7 w-7 rounded-lg bg-[#117B78]/10 text-[#117B78] flex items-center justify-center font-bold text-xs shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{s.admissionNumber || s.email}</p>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
};
