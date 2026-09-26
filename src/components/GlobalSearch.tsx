import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Users,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  Award,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, Course, Task, Lead } from '../types';

interface GlobalSearchProps {
  isMobileModal?: boolean;
  onCloseMobileModal?: () => void;
}

type SearchCategory = 'all' | 'students' | 'courses' | 'tasks' | 'leads';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isMobileModal = false,
  onCloseMobileModal,
}) => {
  const {
    users,
    courses,
    tasks,
    leads,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState(globalSearchQuery || '');
  const [isOpen, setIsOpen] = useState(isMobileModal);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external search query
  useEffect(() => {
    if (globalSearchQuery !== undefined && globalSearchQuery !== query) {
      setQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        onCloseMobileModal?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseMobileModal]);

  // Close when clicking outside (desktop)
  useEffect(() => {
    if (isMobileModal) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileModal]);

  // Students filtering
  const matchingStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users.filter((u) => {
      const isStudent = u.role === 'student';
      if (!isStudent) return false;
      const nameMatch = u.name.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const usernameMatch = u.username?.toLowerCase().includes(q);
      const admMatch = u.admissionNumber?.toLowerCase().includes(q);
      const deptMatch = u.department?.toLowerCase().includes(q);
      return nameMatch || emailMatch || usernameMatch || admMatch || deptMatch;
    });
  }, [users, query]);

  // Courses filtering
  const matchingCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return courses.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const codeMatch = c.code.toLowerCase().includes(q);
      const descMatch = c.description.toLowerCase().includes(q);
      const catMatch = c.category.toLowerCase().includes(q);
      return nameMatch || codeMatch || descMatch || catMatch;
    });
  }, [courses, query]);

  // Tasks filtering
  const matchingTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tasks.filter((t) => {
      const titleMatch = t.title.toLowerCase().includes(q);
      const descMatch = t.description.toLowerCase().includes(q);
      const courseMatch = t.courseName.toLowerCase().includes(q);
      const subjectMatch = t.subjectName.toLowerCase().includes(q);
      return titleMatch || descMatch || courseMatch || subjectMatch;
    });
  }, [tasks, query]);

  // CRM Leads filtering
  const matchingLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return leads.filter((l) => {
      const nameMatch = l.name.toLowerCase().includes(q);
      const phoneMatch = l.phone.includes(q);
      const emailMatch = l.email?.toLowerCase().includes(q);
      const courseMatch = l.courseInterested.toLowerCase().includes(q);
      const statusMatch = l.status.toLowerCase().includes(q);
      const sourceMatch = l.source.toLowerCase().includes(q);
      return nameMatch || phoneMatch || emailMatch || courseMatch || statusMatch || sourceMatch;
    });
  }, [leads, query]);

  // Consolidated items based on activeCategory
  const combinedResults = useMemo(() => {
    const items: Array<{
      type: 'student' | 'course' | 'task' | 'lead';
      id: string;
      data: any;
    }> = [];

    if (activeCategory === 'all' || activeCategory === 'students') {
      matchingStudents.forEach((s) => items.push({ type: 'student', id: s.id, data: s }));
    }
    if (activeCategory === 'all' || activeCategory === 'courses') {
      matchingCourses.forEach((c) => items.push({ type: 'course', id: c.id, data: c }));
    }
    if (activeCategory === 'all' || activeCategory === 'tasks') {
      matchingTasks.forEach((t) => items.push({ type: 'task', id: t.id, data: t }));
    }
    if (activeCategory === 'all' || activeCategory === 'leads') {
      matchingLeads.forEach((l) => items.push({ type: 'lead', id: l.id, data: l }));
    }

    return items;
  }, [activeCategory, matchingStudents, matchingCourses, matchingTasks, matchingLeads]);

  // Reset selected index on query or category change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const handleSelectStudent = (student: UserProfile) => {
    setGlobalSearchQuery(student.name);
    setActiveTab('students');
    setIsOpen(false);
    onCloseMobileModal?.();
  };

  const handleSelectCourse = (course: Course) => {
    setGlobalSearchQuery(course.name);
    setActiveTab('courses');
    setIsOpen(false);
    onCloseMobileModal?.();
  };

  const handleSelectTask = (task: Task) => {
    setGlobalSearchQuery(task.title);
    setActiveTab('tasks');
    setIsOpen(false);
    onCloseMobileModal?.();
  };

  const handleSelectLead = (lead: Lead) => {
    setGlobalSearchQuery(lead.name);
    setActiveTab('leads');
    setIsOpen(false);
    onCloseMobileModal?.();
  };

  const handleItemClick = (item: (typeof combinedResults)[0]) => {
    switch (item.type) {
      case 'student':
        handleSelectStudent(item.data);
        break;
      case 'course':
        handleSelectCourse(item.data);
        break;
      case 'task':
        handleSelectTask(item.data);
        break;
      case 'lead':
        handleSelectLead(item.data);
        break;
    }
  };

  // Keyboard navigation for results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (combinedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % combinedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedResults.length) % combinedResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = combinedResults[selectedIndex];
      if (current) {
        handleItemClick(current);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setGlobalSearchQuery('');
    inputRef.current?.focus();
  };

  const totalResultsCount =
    matchingStudents.length + matchingCourses.length + matchingTasks.length + matchingLeads.length;

  const hasSearchQuery = query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isMobileModal ? 'max-w-none' : 'max-w-md'}`}
    >
      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setGlobalSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search students, courses, tasks, or CRM leads..."
          className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/90 pl-10 pr-20 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#117B78] focus:outline-none focus:ring-2 focus:ring-[#117B78]/15 transition"
        />

        {/* Action icons on right: Clear Button & Keyboard Shortcut Badge */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {hasSearchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {!isMobileModal && (
            <div className="hidden sm:flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Instant Search Results Dropdown / Modal Overlay */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-2 w-full rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 ${
            isMobileModal ? 'static mt-3 max-h-[75vh]' : 'max-h-[520px]'
          } flex flex-col`}
        >
          {/* Categories Tab Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/60 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            {[
              { id: 'all', label: 'All Results', count: totalResultsCount },
              { id: 'students', label: 'Students', count: matchingStudents.length },
              { id: 'courses', label: 'Courses', count: matchingCourses.length },
              { id: 'tasks', label: 'Tasks', count: matchingTasks.length },
              { id: 'leads', label: 'CRM Leads', count: matchingLeads.length },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as SearchCategory)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#117B78] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                {hasSearchQuery && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                      activeCategory === cat.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {hasSearchQuery ? (
              combinedResults.length > 0 ? (
                combinedResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;

                  if (item.type === 'student') {
                    const student = item.data as UserProfile;
                    return (
                      <div
                        key={`student-${student.id}`}
                        onClick={() => handleSelectStudent(student)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#117B78]/10 text-slate-900 border border-[#117B78]/30'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {student.name}
                              </p>
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                                Student
                              </span>
                              {student.admissionNumber && (
                                <span className="font-mono text-[10px] text-slate-500 font-bold">
                                  {student.admissionNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {student.email} • {student.department || 'Academic'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#117B78] shrink-0 pl-2">
                          <span className="text-[11px] font-bold hidden group-hover:inline">
                            View Student
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'course') {
                    const course = item.data as Course;
                    return (
                      <div
                        key={`course-${course.id}`}
                        onClick={() => handleSelectCourse(course)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#117B78]/10 text-slate-900 border border-[#117B78]/30'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-[#117B78] shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {course.name}
                              </p>
                              <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-800 border border-teal-200">
                                {course.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {course.category} • {course.duration}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#117B78] shrink-0 pl-2">
                          <span className="text-[11px] font-bold hidden group-hover:inline">
                            Open Course
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'task') {
                    const task = item.data as Task;
                    return (
                      <div
                        key={`task-${task.id}`}
                        onClick={() => handleSelectTask(task)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#117B78]/10 text-slate-900 border border-[#117B78]/30'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shrink-0">
                            <CheckSquare className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {task.title}
                              </p>
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200">
                                +{task.points} Pts
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {task.courseName} • Due: {task.dueDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#117B78] shrink-0 pl-2">
                          <span className="text-[11px] font-bold hidden group-hover:inline">
                            View Task
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'lead') {
                    const lead = item.data as Lead;
                    return (
                      <div
                        key={`lead-${lead.id}`}
                        onClick={() => handleSelectLead(lead)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#117B78]/10 text-slate-900 border border-[#117B78]/30'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {lead.name}
                              </p>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold capitalize ${
                                  lead.status === 'enrolled'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : lead.status === 'interested'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                }`}
                              >
                                {lead.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {lead.phone} • {lead.courseInterested}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#117B78] shrink-0 pl-2">
                          <span className="text-[11px] font-bold hidden group-hover:inline">
                            CRM Lead
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  }

                  return null;
                })
              ) : (
                <div className="py-8 text-center px-4">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    No results found for "{query}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try searching for a student name, admission number, course title, task, or CRM lead contact.
                  </p>
                </div>
              )
            ) : (
              /* Quick Navigation when search is open but empty */
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Navigation Shortcuts
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('students');
                        setIsOpen(false);
                        onCloseMobileModal?.();
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#117B78] hover:shadow-2xs text-left transition cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Students</p>
                        <p className="text-[10px] text-slate-400">View student directory</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('courses');
                        setIsOpen(false);
                        onCloseMobileModal?.();
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#117B78] hover:shadow-2xs text-left transition cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#117B78]" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Courses</p>
                        <p className="text-[10px] text-slate-400">Curricula & subjects</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('tasks');
                        setIsOpen(false);
                        onCloseMobileModal?.();
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#117B78] hover:shadow-2xs text-left transition cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Academic Tasks</p>
                        <p className="text-[10px] text-slate-400">Assignments & grading</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('leads');
                        setIsOpen(false);
                        onCloseMobileModal?.();
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#117B78] hover:shadow-2xs text-left transition cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">CRM Leads</p>
                        <p className="text-[10px] text-slate-400">Inquiries pipeline</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Example Searches:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Software Engineering', 'Zayd', 'Redux', 'Admission', 'New Lead'].map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setQuery(tag);
                            setGlobalSearchQuery(tag);
                          }}
                          className="rounded-lg bg-slate-100 hover:bg-[#117B78]/10 hover:text-[#117B78] px-2 py-1 text-[11px] font-medium text-slate-600 transition cursor-pointer"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation Hints */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">↑↓</span> to navigate
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">Enter</span> to select
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">Esc</span> to dismiss
              </span>
            </div>
            {hasSearchQuery && (
              <span className="font-semibold text-slate-600">
                {combinedResults.length} match{combinedResults.length === 1 ? '' : 'es'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
