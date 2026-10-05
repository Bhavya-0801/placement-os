'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { SectionHeader, Modal, StatusBadge } from '@/components/ui';
import { cn, generateId } from '@/lib/utils';
import {
  Calendar as CalendarIcon, Clock, Plus, CheckCircle2, Circle, Trash2,
  ChevronLeft, ChevronRight, Briefcase, AlertCircle, FileText, Download,
  Filter, Bell, Sparkles
} from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';

type EventType = 'all' | 'interview' | 'oa' | 'deadline' | 'follow-up' | 'task';

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  interview: { label: 'Interview', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  oa: { label: 'Online Assessment', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  deadline: { label: 'Application Deadline', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'follow-up': { label: 'Follow Up', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  task: { label: 'Prep Task', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  other: { label: 'Other', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

export default function CalendarPage() {
  const { state, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<EventType>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('10:00');
  const [type, setType] = useState<CalendarEvent['type']>('interview');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');

  // Combine calendar events + application events
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [...state.calendarEvents];
    
    // Also include application deadlines if not already present
    state.applications.forEach(app => {
      if (app.deadline) {
        const deadlineDate = app.deadline.split('T')[0];
        const exists = list.some(e => e.applicationId === app.id && e.type === 'deadline');
        if (!exists) {
          list.push({
            id: `app-deadline-${app.id}`,
            title: `${app.company} Deadline: ${app.role}`,
            date: deadlineDate,
            type: 'deadline',
            company: app.company,
            applicationId: app.id,
            completed: app.status !== 'saved',
            description: `Application deadline for ${app.role} at ${app.company}`,
          });
        }
      }
    });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [state.calendarEvents, state.applications]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      return true;
    });
  }, [allEvents, filterType]);

  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter(e => e.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  // Calendar month generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    addCalendarEvent({
      title,
      date,
      time,
      type,
      company: company || undefined,
      description: description || undefined,
      completed: false,
    });

    setAddModalOpen(false);
    setTitle('');
    setCompany('');
    setDescription('');
  };

  const exportIcal = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PlacementOS//Student Placement Calendar//EN',
      'CALSCALE:GREGORIAN',
    ];

    allEvents.forEach(evt => {
      const cleanDate = evt.date.replace(/-/g, '');
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${evt.id}@placementos.app`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART;VALUE=DATE:${cleanDate}`);
      icsContent.push(`SUMMARY:${evt.title}`);
      if (evt.description) icsContent.push(`DESCRIPTION:${evt.description}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'placement-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const interviewsCount = allEvents.filter(e => e.type === 'interview').length;
  const oaCount = allEvents.filter(e => e.type === 'oa').length;
  const pendingTasks = allEvents.filter(e => !e.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Placement Schedule & Deadlines"
        subtitle="Track upcoming interviews, online assessments (OA), deadline cut-offs, and prep tasks."
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={exportIcal}
              className="btn btn-secondary text-xs flex items-center gap-2"
              title="Download iCal file for Google Calendar / Apple Calendar"
            >
              <Download size={14} />
              Export .ics
            </button>
            <button
              onClick={() => {
                setDate(selectedDate);
                setAddModalOpen(true);
              }}
              className="btn btn-primary text-xs flex items-center gap-2"
            >
              <Plus size={14} />
              Add Event
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Interviews</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Briefcase size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{interviewsCount}</div>
          <div className="text-xs text-slate-400 mt-1">Scheduled rounds & technical meets</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Assessments (OA)</span>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CalendarIcon size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{oaCount}</div>
          <div className="text-xs text-slate-400 mt-1">Online tests & coding challenges</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Active Reminders</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Bell size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{pendingTasks}</div>
          <div className="text-xs text-slate-400 mt-1">Pending actions and deadlines</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-card rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['all', 'interview', 'oa', 'deadline', 'task', 'follow-up'] as EventType[]).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-colors capitalize whitespace-nowrap',
                filterType === t
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {t === 'all' ? 'All Events' : t === 'oa' ? 'OA Tests' : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 rounded-lg border border-white/10"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-white px-2 min-w-[110px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid + Side Schedule View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] p-1 rounded-xl bg-white/[0.01] opacity-20" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'min-h-[85px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left group',
                    isSelected
                      ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
                    isToday && !isSelected && 'border-cyan-500/50 bg-cyan-500/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center',
                        isToday
                          ? 'bg-cyan-500 text-black font-bold'
                          : isSelected
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-300'
                      )}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(evt => {
                      const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.other;
                      return (
                        <div
                          key={evt.id}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded truncate font-medium border',
                            cfg.bg,
                            cfg.color,
                            cfg.border
                          )}
                          title={evt.title}
                        >
                          {evt.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-500 font-medium pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>
            <button
              onClick={() => {
                setDate(selectedDate);
                setAddModalOpen(true);
              }}
              className="p-1.5 text-violet-400 hover:text-white hover:bg-violet-600/20 rounded-lg transition-colors"
              title="Add event for this day"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 mt-4 space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CalendarIcon size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No events for this date</p>
                <p className="text-xs text-slate-600 mt-1">Click &quot;Add Event&quot; to schedule interview rounds or prep tasks.</p>
              </div>
            ) : (
              selectedDateEvents.map(evt => {
                const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.other;
                const isCustomEvent = !evt.id.startsWith('app-deadline-');

                return (
                  <div
                    key={evt.id}
                    className={cn(
                      'p-3 rounded-xl border transition-all',
                      evt.completed ? 'opacity-50 bg-white/[0.01]' : 'bg-white/[0.03]',
                      cfg.border
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        {isCustomEvent && (
                          <button
                            onClick={() => updateCalendarEvent(evt.id, { completed: !evt.completed })}
                            className="mt-0.5 text-slate-400 hover:text-violet-400 transition-colors"
                          >
                            {evt.completed ? (
                              <CheckCircle2 size={16} className="text-green-400" />
                            ) : (
                              <Circle size={16} />
                            )}
                          </button>
                        )}
                        <div>
                          <p className={cn('text-sm font-semibold text-white', evt.completed && 'line-through text-slate-400')}>
                            {evt.title}
                          </p>
                          {evt.company && (
                            <span className="text-xs text-violet-300 font-medium">{evt.company}</span>
                          )}
                        </div>
                      </div>

                      {isCustomEvent && (
                        <button
                          onClick={() => deleteCalendarEvent(evt.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {evt.time && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                        <Clock size={12} />
                        <span>{evt.time}</span>
                      </div>
                    )}

                    {evt.description && (
                      <p className="text-xs text-slate-400 mt-2 bg-white/5 p-2 rounded-lg">
                        {evt.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium border', cfg.bg, cfg.color, cfg.border)}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Schedule Calendar Event"
        size="md"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amazon Round 2 Technical Interview"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Event Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as CalendarEvent['type'])}
                className="w-full bg-[#111128] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="interview">Interview</option>
                <option value="oa">Online Assessment</option>
                <option value="deadline">Deadline</option>
                <option value="follow-up">Follow-up</option>
                <option value="task">Prep Task</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Google, Microsoft"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Topics: Binary Trees, System Design. Interviewer: Senior SDE 2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs px-5 py-2"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
