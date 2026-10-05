'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/lib/context';
import {
  Briefcase, Award, MessageSquare, Trophy, TrendingUp,
  AlertCircle, Calendar, ChevronRight, Zap, ArrowRight, Clock
} from 'lucide-react';
import { StatCard, ProgressRing, ScoreBar, InsightCard, AnimatedNumber } from '@/components/ui';
import { formatDateShort, daysUntil, getStatusLabel, cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import { calculateAllRoleScores } from '@/lib/placement-twin';

function ApplicationFunnel({ applications }: { applications: ReturnType<typeof useApp>['state']['applications'] }) {
  const statusOrder = ['applied', 'assessment', 'oa-cleared', 'interview', 'hr', 'offer'];
  const counts = {
    Applied: applications.filter(a => !['saved', 'rejected', 'ghosted'].includes(a.status)).length,
    'OA / Test': applications.filter(a => ['assessment', 'oa-cleared', 'interview', 'hr', 'offer'].includes(a.status)).length,
    Interview: applications.filter(a => ['interview', 'hr', 'offer'].includes(a.status)).length,
    Offer: applications.filter(a => a.status === 'offer').length,
  };

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  const max = data[0]?.value || 1;

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = Math.round((item.value / max) * 100);
        const convPct = i > 0 ? Math.round((item.value / (data[i - 1]?.value || 1)) * 100) : 100;
        return (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-slate-300 font-medium">{item.name}</span>
              <div className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-xs text-slate-500">{convPct}% conversion</span>
                )}
                <span className="text-sm font-bold text-white">{item.value}</span>
              </div>
            </div>
            <div className="h-8 bg-white/3 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center px-3"
                style={{
                  width: `${Math.max(pct, 8)}%`,
                  background: `linear-gradient(90deg, rgba(124,58,237,${0.7 - i * 0.15}), rgba(6,182,212,${0.5 - i * 0.1}))`,
                  transition: 'width 1s ease',
                }}
              >
                {item.value > 0 && (
                  <span className="text-xs font-semibold text-white/90">{item.value}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UpcomingEvents({ events }: { events: ReturnType<typeof useApp>['state']['calendarEvents'] }) {
  const upcoming = events
    .filter(e => !e.completed && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const typeColors: Record<string, string> = {
    oa: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    interview: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    deadline: 'bg-red-500/20 text-red-400 border-red-500/20',
    'follow-up': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    task: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
    other: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
  };

  const typeLabels: Record<string, string> = {
    oa: 'OA', interview: 'Interview', deadline: 'Deadline',
    'follow-up': 'Follow-up', task: 'Task', other: 'Event',
  };

  if (upcoming.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No upcoming events. Add some in Calendar!</p>;
  }

  return (
    <div className="space-y-2">
      {upcoming.map(event => {
        const days = daysUntil(event.date);
        return (
          <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors">
            <div className="flex-shrink-0 text-center min-w-[44px]">
              <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</p>
              <p className="text-lg font-bold text-white leading-tight">{new Date(event.date).getDate()}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn('badge text-[10px]', typeColors[event.type] || typeColors.other)}>
                  {typeLabels[event.type] || 'Event'}
                </span>
                {days <= 1 && (
                  <span className="text-[10px] text-red-400 font-semibold">
                    {days === 0 ? 'Today!' : 'Tomorrow!'}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-white truncate">{event.title}</p>
              {event.company && <p className="text-xs text-slate-400">{event.company}</p>}
              {event.time && <p className="text-xs text-slate-500">{event.time}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PriorityActions({ applications }: { applications: ReturnType<typeof useApp>['state']['applications'] }) {
  const high = applications.filter(a => a.priority === 'high' && !['rejected', 'ghosted', 'offer'].includes(a.status)).slice(0, 3);

  if (high.length === 0) return <p className="text-sm text-slate-400">No high priority items.</p>;

  return (
    <div className="space-y-3">
      {high.map(app => (
        <div key={app.id} className="p-3 rounded-xl border border-red-500/10 bg-red-500/5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: app.companyColor + '44', border: `1px solid ${app.companyColor}33` }}
              >
                {app.companyInitials.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{app.company}</p>
                <p className="text-xs text-slate-400">{app.role}</p>
              </div>
            </div>
            <span className="badge text-[10px] bg-red-500/10 text-red-400 border-red-500/20 flex-shrink-0">HIGH</span>
          </div>
          {app.nextAction && (
            <p className="text-xs text-slate-300 mt-2">→ {app.nextAction}</p>
          )}
          {app.deadline && (
            <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
              <Clock size={10} /> {daysUntil(app.deadline)} days until deadline
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { state } = useApp();
  const { applications, interviewSessions, profile, calendarEvents } = state;

  const stats = useMemo(() => ({
    total: applications.length,
    oa: applications.filter(a => ['assessment', 'oa-cleared', 'interview', 'hr', 'offer'].includes(a.status)).length,
    interviews: applications.filter(a => ['interview', 'hr', 'offer'].includes(a.status)).length,
    offers: applications.filter(a => a.status === 'offer').length,
  }), [applications]);

  const readiness = useMemo(() => {
    const scores = calculateAllRoleScores(profile);
    return scores.length > 0 ? Math.round(scores.slice(0, 3).reduce((s, r) => s + r.score, 0) / 3) : 0;
  }, [profile]);

  const readinessBreakdown = [
    { label: 'Resume', value: 82 },
    { label: 'DSA', value: Math.min(100, Math.round((profile.dsaSolved / 300) * 100)) },
    { label: 'Projects', value: Math.min(100, profile.projects * 20 + 20) },
    { label: 'Interview', value: interviewSessions.length > 0 ? Math.round(interviewSessions[interviewSessions.length - 1]?.score || 65) : 50 },
    { label: 'Skills', value: Math.min(100, profile.skills.length * 5) },
    { label: 'Experience', value: profile.internships > 0 ? 75 : 45 },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const recentActivity = applications
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{greeting},</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.name} 👋</h1>
          <p className="text-violet-400 text-sm mt-1">Placement Ka Pressure™ — let's work through it.</p>
        </div>
        <Link href="/war-room" className="btn-primary text-sm hidden md:flex">
          + Add Application
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Applications"
          value={stats.total}
          icon={<Briefcase size={18} className="text-violet-400" />}
          accent="violet"
        />
        <StatCard
          label="OA / Tests"
          value={stats.oa}
          icon={<Award size={18} className="text-cyan-400" />}
          accent="cyan"
        />
        <StatCard
          label="Interviews"
          value={stats.interviews}
          icon={<MessageSquare size={18} className="text-purple-400" />}
          accent="violet"
        />
        <StatCard
          label={stats.offers > 0 ? 'Offer 🎉' : 'Offers'}
          value={stats.offers}
          icon={<Trophy size={18} className="text-green-400" />}
          accent="green"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Funnel + Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Funnel */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Application Funnel</h2>
                <p className="text-xs text-slate-400">Where your applications are dropping</p>
              </div>
              <Link href="/ghosted" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                Full Analytics <ChevronRight size={12} />
              </Link>
            </div>
            <ApplicationFunnel applications={applications} />
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <Link href="/war-room" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentActivity.map(app => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: app.companyColor + '33', border: `1px solid ${app.companyColor}44` }}
                  >
                    {app.companyInitials.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{app.company}</p>
                    <p className="text-xs text-slate-400 truncate">{app.role}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={cn('badge text-[10px]', {
                      'text-blue-400 bg-blue-400/10 border-blue-400/20': app.status === 'applied',
                      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20': app.status === 'assessment',
                      'text-cyan-400 bg-cyan-400/10 border-cyan-400/20': app.status === 'oa-cleared',
                      'text-purple-400 bg-purple-400/10 border-purple-400/20': app.status === 'interview',
                      'text-pink-400 bg-pink-400/10 border-pink-400/20': app.status === 'hr',
                      'text-green-400 bg-green-400/10 border-green-400/20': app.status === 'offer',
                      'text-red-400 bg-red-400/10 border-red-400/20': app.status === 'rejected',
                      'text-gray-400 bg-gray-400/10 border-gray-400/20': app.status === 'ghosted',
                      'text-slate-400 bg-slate-400/10 border-slate-400/20': app.status === 'saved',
                    })}>
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Progress */}
          {interviewSessions.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Interview Progress</h2>
                  <p className="text-xs text-slate-400">Score improvement over practice sessions</p>
                </div>
                <Link href="/interview-replay" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  Practice Now <ArrowRight size={12} />
                </Link>
              </div>
              <div className="flex items-end gap-3 h-28">
                {interviewSessions.map((session, i) => (
                  <div key={session.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-white">{session.score}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400"
                      style={{ height: `${session.score}%` }}
                    />
                    <span className="text-[9px] text-slate-500">#{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-xs text-green-400 font-medium">
                    +{interviewSessions[interviewSessions.length - 1].score - interviewSessions[0].score} points improvement
                  </span>
                </div>
                <span className="text-xs text-slate-400">{interviewSessions.length} sessions</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Readiness + Events + Priority */}
        <div className="space-y-6">
          {/* Placement Readiness */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Readiness</h2>
              <Link href="/placement-twin" className="text-xs text-violet-400 hover:text-violet-300">
                Improve →
              </Link>
            </div>
            <div className="flex justify-center mb-5">
              <ProgressRing value={readiness} size={120} label="Overall" />
            </div>
            <div className="space-y-3">
              {readinessBreakdown.map(item => (
                <ScoreBar key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Upcoming</h2>
              <Link href="/calendar" className="text-xs text-violet-400 hover:text-violet-300">
                Calendar →
              </Link>
            </div>
            <UpcomingEvents events={calendarEvents} />
          </div>

          {/* Priority Actions */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Top Priorities</h2>
              <Link href="/war-room" className="text-xs text-violet-400 hover:text-violet-300">
                War Room →
              </Link>
            </div>
            <PriorityActions applications={applications} />
          </div>

          {/* Quick Insights */}
          <div className="space-y-3">
            <InsightCard
              title="Resume Performance"
              description="Your Frontend Resume has the highest response rate in your dataset."
              type="tip"
            />
            {profile.internships === 0 && (
              <InsightCard
                title="Internship Gap"
                description="Adding internship experience could boost your readiness by ~15%."
                type="warning"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
