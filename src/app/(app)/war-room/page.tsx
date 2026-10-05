'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import {
  Plus, Search, Filter, LayoutGrid, Table, Calendar,
  ChevronDown, X, Edit2, Trash2, ExternalLink, Clock,
  CheckCircle, MapPin, DollarSign, Users, AlertCircle, ChevronRight,
} from 'lucide-react';
import { StatusBadge, EmptyState, Modal, TabBar } from '@/components/ui';
import {
  cn, formatDate, formatDateShort, daysAgo, daysUntil,
  getStatusLabel, getSourceLabel, generateId,
} from '@/lib/utils';
import type { Application, ApplicationStatus, ApplicationSource, JobType } from '@/lib/types';

const KANBAN_STATUSES: ApplicationStatus[] = [
  'saved', 'applied', 'assessment', 'oa-cleared', 'interview', 'hr', 'offer', 'rejected', 'ghosted'
];

const STATUS_COLORS: Record<string, string> = {
  saved: '#64748b', applied: '#3b82f6', assessment: '#f59e0b',
  'oa-cleared': '#06b6d4', interview: '#8b5cf6', hr: '#ec4899',
  offer: '#10b981', rejected: '#ef4444', ghosted: '#6b7280',
};

const COMPANY_COLORS = [
  '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#2563eb', '#7c3aed', '#16a34a', '#9333ea',
];

function getCompanyColor(name: string) {
  const idx = name.charCodeAt(0) % COMPANY_COLORS.length;
  return COMPANY_COLORS[idx];
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

// ---- Add Application Form ----
function AddApplicationForm({ onClose }: { onClose: () => void }) {
  const { addApplication, state } = useApp();
  const [form, setForm] = useState({
    company: '', role: '', jobType: 'full-time' as JobType,
    location: '', remote: false, salary: '', stipend: '',
    status: 'applied' as ApplicationStatus, source: 'linkedin' as ApplicationSource,
    applicationDate: new Date().toISOString().split('T')[0],
    deadline: '', resumeId: '', referral: false, referralContact: '',
    applicationUrl: '', skillsRequired: '', notes: '', nextAction: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.role) return;
    addApplication({
      ...form,
      companyInitials: form.company.slice(0, 3).toUpperCase(),
      companyColor: getCompanyColor(form.company),
      skillsRequired: form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      resumeId: form.resumeId || undefined,
      resumeName: state.resumes.find(r => r.id === form.resumeId)?.name,
      deadline: form.deadline || undefined,
      referralContact: form.referralContact || undefined,
      applicationUrl: form.applicationUrl || undefined,
      notes: form.notes || undefined,
      nextAction: form.nextAction || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Company *">
          <input className="input" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="e.g. Google" required />
        </FormField>
        <FormField label="Role *">
          <input className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Software Engineer" required />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Job Type">
          <select className="input" value={form.jobType} onChange={e => setForm(p => ({ ...p, jobType: e.target.value as JobType }))}>
            <option value="full-time">Full Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="part-time">Part Time</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ApplicationStatus }))}>
            {KANBAN_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Location">
          <input className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Bangalore" />
        </FormField>
        <FormField label="Salary / Stipend">
          <input className="input"
            value={form.jobType === 'internship' ? form.stipend : form.salary}
            onChange={e => form.jobType === 'internship'
              ? setForm(p => ({ ...p, stipend: e.target.value }))
              : setForm(p => ({ ...p, salary: e.target.value }))}
            placeholder={form.jobType === 'internship' ? '60,000/month' : '20 LPA'}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Source">
          <select className="input" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value as ApplicationSource }))}>
            <option value="linkedin">LinkedIn</option>
            <option value="company-career">Company Career</option>
            <option value="referral">Referral</option>
            <option value="internshala">Internshala</option>
            <option value="naukri">Naukri</option>
            <option value="campus">Campus</option>
            <option value="other">Other</option>
          </select>
        </FormField>
        <FormField label="Priority">
          <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as 'high' | 'medium' | 'low' }))}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Applied Date">
          <input className="input" type="date" value={form.applicationDate} onChange={e => setForm(p => ({ ...p, applicationDate: e.target.value }))} />
        </FormField>
        <FormField label="Deadline">
          <input className="input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
        </FormField>
      </div>

      <FormField label="Resume Version">
        <select className="input" value={form.resumeId} onChange={e => setForm(p => ({ ...p, resumeId: e.target.value }))}>
          <option value="">Select resume...</option>
          {state.resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </FormField>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.referral} onChange={e => setForm(p => ({ ...p, referral: e.target.checked }))}
            className="w-4 h-4 accent-violet-600" />
          <span className="text-sm text-slate-300">Referral</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.remote} onChange={e => setForm(p => ({ ...p, remote: e.target.checked }))}
            className="w-4 h-4 accent-violet-600" />
          <span className="text-sm text-slate-300">Remote</span>
        </label>
      </div>

      {form.referral && (
        <FormField label="Referral Contact">
          <input className="input" value={form.referralContact} onChange={e => setForm(p => ({ ...p, referralContact: e.target.value }))} placeholder="Name and role of referrer" />
        </FormField>
      )}

      <FormField label="Skills Required (comma separated)">
        <input className="input" value={form.skillsRequired} onChange={e => setForm(p => ({ ...p, skillsRequired: e.target.value }))} placeholder="React, Node.js, PostgreSQL" />
      </FormField>

      <FormField label="Application URL">
        <input className="input" value={form.applicationUrl} onChange={e => setForm(p => ({ ...p, applicationUrl: e.target.value }))} placeholder="https://..." />
      </FormField>

      <FormField label="Notes">
        <textarea className="input min-h-[80px] resize-none" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes about this application..." />
      </FormField>

      <FormField label="Next Action">
        <input className="input" value={form.nextAction} onChange={e => setForm(p => ({ ...p, nextAction: e.target.value }))} placeholder="What should you do next?" />
      </FormField>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1 justify-center">Add Application</button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

// ---- Application Detail Drawer ----
function ApplicationDrawer({ app, onClose, onUpdate }: {
  app: Application;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Application>) => void;
}) {
  const [tab, setTab] = useState('overview');
  const [editStatus, setEditStatus] = useState(false);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: app.companyColor + '33', border: `1px solid ${app.companyColor}44` }}
            >
              {app.companyInitials.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{app.company}</h2>
              <p className="text-sm text-slate-400">{app.role} • {app.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Status + quick info */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <StatusBadge status={app.status} />
          {app.referral && <span className="badge text-[10px] bg-green-400/10 text-green-400 border-green-400/20">Referral ✓</span>}
          {app.remote && <span className="badge text-[10px] bg-blue-400/10 text-blue-400 border-blue-400/20">Remote</span>}
          <span className="badge text-[10px] bg-slate-400/10 text-slate-400 border-slate-400/20">
            {app.jobType === 'internship' ? 'Internship' : 'Full Time'}
          </span>
          <span className={cn('badge text-[10px]', {
            'bg-red-400/10 text-red-400 border-red-400/20': app.priority === 'high',
            'bg-amber-400/10 text-amber-400 border-amber-400/20': app.priority === 'medium',
            'bg-slate-400/10 text-slate-400 border-slate-400/20': app.priority === 'low',
          })}>
            {app.priority.toUpperCase()} Priority
          </span>
        </div>

        {/* Key info row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(app.salary || app.stipend) && (
            <div className="bg-white/3 border border-white/5 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Package</p>
              <p className="text-sm font-semibold text-white">{app.salary || app.stipend}</p>
            </div>
          )}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Applied</p>
            <p className="text-sm font-semibold text-white">{formatDate(app.applicationDate)}</p>
          </div>
          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Source</p>
            <p className="text-sm font-semibold text-white">{getSourceLabel(app.source)}</p>
          </div>
          {app.deadline && (
            <div className="bg-white/3 border border-white/5 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Deadline</p>
              <p className={cn('text-sm font-semibold', daysUntil(app.deadline) <= 3 ? 'text-red-400' : 'text-white')}>
                {formatDate(app.deadline)}
              </p>
            </div>
          )}
        </div>

        {/* Update Status */}
        <div className="mb-5">
          <p className="input-label mb-2">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {KANBAN_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => onUpdate(app.id, { status: s })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  app.status === s
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-white/10 bg-white/3 text-slate-400 hover:bg-white/8'
                )}
              >
                {getStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        {app.skillsRequired.length > 0 && (
          <div className="mb-5">
            <p className="input-label mb-2">Skills Required</p>
            <div className="flex flex-wrap gap-2">
              {app.skillsRequired.map(skill => (
                <span key={skill} className="px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded text-xs text-violet-300">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {app.events.length > 0 && (
          <div className="mb-5">
            <p className="input-label mb-3">Timeline</p>
            <div className="relative pl-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-4">
                {app.events.map((event, i) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[17px] w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-[#111128] top-1" />
                    <p className="text-xs text-slate-400 mb-0.5">{formatDate(event.date)}</p>
                    <p className="text-sm font-medium text-white">{event.title}</p>
                    {event.description && <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {app.notes && (
          <div className="mb-5">
            <p className="input-label mb-2">Notes</p>
            <p className="text-sm text-slate-300 bg-white/3 border border-white/5 rounded-xl p-3">{app.notes}</p>
          </div>
        )}

        {/* Next Action */}
        {app.nextAction && (
          <div className="mb-5">
            <p className="input-label mb-2">Next Action</p>
            <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
              <ChevronRight size={14} className="text-violet-400" />
              <p className="text-sm text-violet-300">{app.nextAction}</p>
            </div>
          </div>
        )}

        {/* Referral */}
        {app.referral && app.referralContact && (
          <div className="mb-5">
            <p className="input-label mb-2">Referral</p>
            <p className="text-sm text-slate-300">{app.referralContact}</p>
          </div>
        )}

        {/* Application URL */}
        {app.applicationUrl && (
          <a href={app.applicationUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300">
            <ExternalLink size={14} />
            Open Job Listing
          </a>
        )}
      </div>
    </>
  );
}

// ---- Kanban View ----
function KanbanView({ applications, onSelect, onUpdate }: {
  applications: Application[];
  onSelect: (app: Application) => void;
  onUpdate: (id: string, updates: Partial<Application>) => void;
}) {
  const VISIBLE_STATUSES: ApplicationStatus[] = ['applied', 'assessment', 'oa-cleared', 'interview', 'hr', 'offer', 'rejected'];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {VISIBLE_STATUSES.map(status => {
        const apps = applications.filter(a => a.status === status);
        return (
          <div key={status} className="kanban-column flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                <span className="text-xs font-semibold text-slate-300">{getStatusLabel(status)}</span>
              </div>
              <span className="text-xs text-slate-500 bg-white/5 rounded-full px-2 py-0.5">{apps.length}</span>
            </div>
            <div className="space-y-2">
              {apps.map(app => (
                <div
                  key={app.id}
                  onClick={() => onSelect(app)}
                  className="p-3 bg-[#111128] border border-white/5 rounded-xl cursor-pointer hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: app.companyColor + '33' }}
                    >
                      {app.companyInitials.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{app.company}</p>
                      <p className="text-[10px] text-slate-400 truncate">{app.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-[9px] font-semibold', {
                      'text-red-400': app.priority === 'high',
                      'text-amber-400': app.priority === 'medium',
                      'text-slate-500': app.priority === 'low',
                    })}>
                      {app.priority.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-slate-500">{formatDateShort(app.applicationDate)}</span>
                  </div>
                  {app.referral && (
                    <div className="mt-1.5 text-[9px] text-green-400">🔗 Referral</div>
                  )}
                </div>
              ))}
              {apps.length === 0 && (
                <div className="text-center py-6 text-[10px] text-slate-600">No applications</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Table View ----
function TableView({ applications, onSelect }: {
  applications: Application[];
  onSelect: (app: Application) => void;
}) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<span>🗂️</span>}
        title="Your placement war room is suspiciously peaceful."
        description="Add your first application to start tracking your placement journey."
      />
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/5">
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th className="hidden md:table-cell">Status</th>
            <th className="hidden lg:table-cell">Source</th>
            <th className="hidden lg:table-cell">Applied</th>
            <th className="hidden md:table-cell">Package</th>
            <th className="hidden lg:table-cell">Priority</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id} onClick={() => onSelect(app)} className="cursor-pointer">
              <td>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: app.companyColor + '33', border: `1px solid ${app.companyColor}44` }}
                  >
                    {app.companyInitials.slice(0, 2)}
                  </div>
                  <span className="font-medium">{app.company}</span>
                  {app.referral && <span className="text-green-400 text-xs">🔗</span>}
                </div>
              </td>
              <td><span className="text-slate-300 text-sm">{app.role}</span></td>
              <td className="hidden md:table-cell"><StatusBadge status={app.status} /></td>
              <td className="hidden lg:table-cell text-slate-400 text-sm">{getSourceLabel(app.source)}</td>
              <td className="hidden lg:table-cell text-slate-400 text-sm">{formatDateShort(app.applicationDate)}</td>
              <td className="hidden md:table-cell text-slate-300 text-sm">{app.salary || app.stipend || '—'}</td>
              <td className="hidden lg:table-cell">
                <span className={cn('text-xs font-semibold', {
                  'text-red-400': app.priority === 'high',
                  'text-amber-400': app.priority === 'medium',
                  'text-slate-500': app.priority === 'low',
                })}>
                  {app.priority.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Main War Room Page ----
export default function WarRoomPage() {
  const { state, updateApplication, deleteApplication } = useApp();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const filtered = useMemo(() => {
    return state.applications.filter(a => {
      const matchSearch = !search ||
        a.company.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [state.applications, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: state.applications.length };
    KANBAN_STATUSES.forEach(s => {
      counts[s] = state.applications.filter(a => a.status === s).length;
    });
    return counts;
  }, [state.applications]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">War Room 🎯</h1>
          <p className="text-slate-400 text-sm mt-1">
            {state.applications.length} applications tracked
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'applied', label: 'Applied' },
          { key: 'assessment', label: 'OA' },
          { key: 'interview', label: 'Interview' },
          { key: 'offer', label: 'Offers' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'ghosted', label: 'Ghosted' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key as ApplicationStatus | 'all')}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
              statusFilter === item.key
                ? 'bg-violet-600 text-white border-violet-500'
                : 'bg-white/3 text-slate-400 border-white/5 hover:bg-white/8'
            )}
          >
            {item.label}
            <span className={cn('ml-1.5 text-xs', statusFilter === item.key ? 'text-violet-200' : 'text-slate-500')}>
              {statusCounts[item.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <TabBar
          tabs={[
            { id: 'kanban', label: 'Kanban', icon: <LayoutGrid size={14} /> },
            { id: 'table', label: 'Table', icon: <Table size={14} /> },
          ]}
          active={view}
          onChange={v => setView(v as 'kanban' | 'table')}
        />
      </div>

      {/* View */}
      <div>
        {view === 'kanban' ? (
          <KanbanView applications={filtered} onSelect={setSelectedApp} onUpdate={updateApplication} />
        ) : (
          <TableView applications={filtered} onSelect={setSelectedApp} />
        )}
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Application" size="lg">
        <AddApplicationForm onClose={() => setShowAdd(false)} />
      </Modal>

      {/* Detail Drawer */}
      {selectedApp && (
        <ApplicationDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={(id, updates) => {
            updateApplication(id, updates);
            setSelectedApp(prev => prev ? { ...prev, ...updates } : null);
          }}
        />
      )}
    </div>
  );
}
