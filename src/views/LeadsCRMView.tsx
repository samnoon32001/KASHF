import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MessageSquare,
  Sparkles,
  DollarSign,
  GraduationCap,
  Download,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus } from '../types';

export const LeadsCRMView: React.FC = () => {
  const {
    leads,
    courses,
    users,
    addLead,
    updateLeadStatus,
    addLeadNote,
    enrollLeadAsStudent,
    currentUser,
    exportToCSV,
    globalSearchQuery,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
      const match = leads.find(
        (l) =>
          l.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          l.phone.includes(globalSearchQuery) ||
          (l.email && l.email.toLowerCase().includes(globalSearchQuery.toLowerCase()))
      );
      if (match) setSelectedLead(match);
    }
  }, [globalSearchQuery, leads]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');

  // New Lead Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCourse, setFormCourse] = useState('Full-Stack Software Engineering');
  const [formSource, setFormSource] = useState('Meta Lead Ads');
  const [formCampaign, setFormCampaign] = useState('Fall Tech Careers Campaign 2026');

  const telecallers = users.filter((u) => u.role === 'telecaller');

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.courseInterested.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    addLead({
      name: formName,
      phone: formPhone,
      email: formEmail,
      courseInterested: formCourse,
      source: formSource,
      campaign: formCampaign,
      status: 'new',
      assignedTo: telecallers[0]?.id || currentUser?.id || 'telecaller-1',
      assignedName: telecallers[0]?.name || currentUser?.name || 'Elena Rostova',
      followUpDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'pending',
    });

    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setShowAddModal(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText || !selectedLead) return;
    addLeadNote(selectedLead.id, newNoteText);
    setNewNoteText('');
  };

  const handleEnrollStudent = (lead: Lead) => {
    const targetCourse = courses[0];
    if (!targetCourse) return;
    enrollLeadAsStudent(lead.id, targetCourse.id);
    alert(`Prospect ${lead.name} successfully converted and enrolled into ${targetCourse.name}! Student ID generated.`);
  };

  const pipelineStages: { label: string; status: LeadStatus; color: string }[] = [
    { label: 'New Inquiries', status: 'new', color: 'bg-blue-100 text-blue-800' },
    { label: 'Contacted', status: 'contacted', color: 'bg-cyan-100 text-cyan-800' },
    { label: 'Interested', status: 'interested', color: 'bg-amber-100 text-amber-800' },
    { label: 'Confirmed / Paid', status: 'confirmed', color: 'bg-teal-100 text-teal-800' },
    { label: 'Enrolled Students', status: 'enrolled', color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Admissions CRM & Meta Lead Ads Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time lead capture, call logs, automated assignment, and student enrollment conversions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              exportToCSV(
                'crm_leads',
                leads.map((l) => ({
                  ID: l.id,
                  Name: l.name,
                  Phone: l.phone,
                  Email: l.email || 'N/A',
                  Course: l.courseInterested,
                  Source: l.source,
                  Status: l.status,
                  Payment: l.paymentStatus,
                  AssignedTo: l.assignedName,
                  DateReceived: l.dateReceived,
                }))
              );
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Leads</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Lead</span>
          </button>
        </div>
      </div>

      {/* Meta Webhook Live Status Bar */}
      <div className="rounded-2xl bg-[#117B78]/10 border border-[#117B78]/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Meta Lead Ads Integration Active (Ad Account: act_948271049182)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Syncing Facebook & Instagram instant forms with automatic round-robin telecaller allocation.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            // Simulate Meta incoming webhook
            const fakeLead = {
              name: 'Taylor Brooks',
              phone: '+1 (555) 203-8849',
              email: 'taylor.b@example.com',
              courseInterested: 'Full-Stack Software Engineering',
              source: 'Meta Lead Ads',
              campaign: 'Fall Tech Careers Campaign 2026',
              adName: 'Build High-Income Software Careers',
              status: 'new' as const,
              assignedTo: telecallers[0]?.id || 'telecaller-1',
              assignedName: telecallers[0]?.name || 'Elena Rostova',
              followUpDate: new Date().toISOString().split('T')[0],
              paymentStatus: 'pending' as const,
            };
            addLead(fakeLead);
          }}
          className="rounded-xl bg-white border border-[#117B78]/30 px-3 py-1.5 text-xs font-bold text-[#117B78] hover:bg-[#117B78]/10 transition cursor-pointer self-start sm:self-auto"
        >
          Simulate Meta Ad Lead Webhook
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search prospect by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#117B78] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              viewMode === 'pipeline'
                ? 'bg-[#117B78] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#117B78] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Main Content: Pipeline + Inspector */}
      {viewMode === 'pipeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Pipeline Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pipelineStages.slice(0, 3).map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.status === stage.status);
              return (
                <div key={stage.status} className="rounded-3xl bg-slate-50/75 border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {stage.label}
                    </h4>
                    <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stageLeads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`rounded-2xl p-4 bg-white border transition cursor-pointer ${
                            isSelected
                              ? 'border-[#117B78] shadow-md ring-2 ring-[#117B78]/15'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[9px] font-bold text-[#117B78]">
                              {lead.source}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {lead.dateReceived}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-slate-900 mt-2">{lead.name}</h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">{lead.courseInterested}</p>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{lead.phone}</span>
                            </a>
                            <span className="text-slate-400">{lead.assignedName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lead Detail & Conversion Drawer */}
          {selectedLead ? (
            <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#117B78]/10 px-2 py-0.5 text-[10px] font-bold text-[#117B78]">
                    Source: {selectedLead.source}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 capitalize">
                    {selectedLead.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedLead.courseInterested}</p>

                <div className="mt-3 flex flex-col gap-1 text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedLead.phone}</span>
                  </span>
                  {selectedLead.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedLead.email}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Update Lead Stage
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(['contacted', 'interested', 'confirmed', 'paid'] as LeadStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      className={`rounded-xl py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
                        selectedLead.status === status
                          ? 'bg-[#117B78] text-white'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Convert to Enrolled Student Action (#29) */}
              <div className="pt-2 border-t border-slate-100">
                {selectedLead.enrollmentStatus === 'enrolled' ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enrolled as Registered Student Account</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnrollStudent(selectedLead)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Convert to Enrolled Student</span>
                  </button>
                )}
              </div>

              {/* Follow-up Notes Log */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-900">Call Log & Follow-up Notes</h5>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {selectedLead.notes.map((note) => (
                    <div key={note.id} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">{note.addedBy}</span>
                        <span>{note.date}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{note.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log prospect discussion..."
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
              Select a lead to review call notes and pipeline actions.
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Prospect</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{lead.name}</td>
                  <td className="py-3.5 px-4">{lead.phone}</td>
                  <td className="py-3.5 px-4">{lead.courseInterested}</td>
                  <td className="py-3.5 px-4 text-slate-500">{lead.source}</td>
                  <td className="py-3.5 px-4 capitalize">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setViewMode('pipeline');
                      }}
                      className="text-xs font-bold text-[#117B78] hover:underline cursor-pointer"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Add Admission Lead</h3>
            <p className="text-xs text-slate-500 mt-1">
              Manually register prospective student inquiry.
            </p>

            <form onSubmit={handleCreateLead} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prospect Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Jordan Mitchell"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interested Program</label>
                <select
                  value={formCourse}
                  onChange={(e) => setFormCourse(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-[#117B78]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. Walk-in / Phone"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign</label>
                  <input
                    type="text"
                    value={formCampaign}
                    onChange={(e) => setFormCampaign(e.target.value)}
                    placeholder="Admissions 2026"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                  />
                </div>
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
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
