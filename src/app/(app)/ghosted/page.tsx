'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/lib/context';
import { InsightCard, SectionHeader, AnimatedNumber } from '@/components/ui';
import { cn, getSourceLabel, daysAgo } from '@/lib/utils';
import { Ghost, TrendingUp, TrendingDown, Users, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';

const CHART_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a38] border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function GhostedPage() {
  const { state } = useApp();
  const { applications, resumes, ghostedThreshold } = state;

  const stats = useMemo(() => {
    const total = applications.length;
    const ghosted = applications.filter(a => a.status === 'ghosted').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const active = applications.filter(a => !['rejected', 'ghosted', 'saved'].includes(a.status)).length;
    const responses = applications.filter(a => !['saved', 'applied'].includes(a.status)).length;
    const oas = applications.filter(a => ['assessment', 'oa-cleared', 'interview', 'hr', 'offer'].includes(a.status)).length;
    const interviews = applications.filter(a => ['interview', 'hr', 'offer'].includes(a.status)).length;
    const offers = applications.filter(a => a.status === 'offer').length;

    return { total, ghosted, rejected, active, responses, oas, interviews, offers };
  }, [applications]);

  // Funnel data
  const funnelData = [
    { name: 'Applied', value: stats.total },
    { name: 'Responded', value: stats.responses },
    { name: 'OA', value: stats.oas },
    { name: 'Interview', value: stats.interviews },
    { name: 'Offer', value: stats.offers },
  ];

  // Source performance
  const sourceData = useMemo(() => {
    const sourceMap: Record<string, { total: number; responses: number }> = {};
    applications.forEach(a => {
      if (!sourceMap[a.source]) sourceMap[a.source] = { total: 0, responses: 0 };
      sourceMap[a.source].total++;
      if (!['saved', 'applied', 'ghosted'].includes(a.status)) {
        sourceMap[a.source].responses++;
      }
    });
    return Object.entries(sourceMap).map(([source, data]) => ({
      source: getSourceLabel(source),
      total: data.total,
      responses: data.responses,
      rate: data.total > 0 ? Math.round((data.responses / data.total) * 100) : 0,
    })).sort((a, b) => b.rate - a.rate);
  }, [applications]);

  // Role performance
  const roleData = useMemo(() => {
    const roleMap: Record<string, { total: number; interviews: number }> = {};
    applications.forEach(a => {
      const roleKey = a.role.includes('Frontend') ? 'Frontend' :
        a.role.includes('ML') || a.role.includes('AI') ? 'AI/ML' :
        a.role.includes('Data') ? 'Data' :
        a.role.includes('Product') ? 'Product' : 'SDE';
      if (!roleMap[roleKey]) roleMap[roleKey] = { total: 0, interviews: 0 };
      roleMap[roleKey].total++;
      if (['interview', 'hr', 'offer'].includes(a.status)) roleMap[roleKey].interviews++;
    });
    return Object.entries(roleMap).map(([role, d]) => ({
      role,
      total: d.total,
      interviews: d.interviews,
      rate: d.total > 0 ? Math.round((d.interviews / d.total) * 100) : 0,
    }));
  }, [applications]);

  // Resume performance
  const resumeData = useMemo(() => {
    return resumes.map(r => ({
      name: r.name,
      applications: r.applications,
      responses: r.responses,
      rate: r.applications > 0 ? Math.round((r.responses / r.applications) * 100) : 0,
    }));
  }, [resumes]);

  // Referral comparison
  const referralData = useMemo(() => {
    const withRef = applications.filter(a => a.referral);
    const withoutRef = applications.filter(a => !a.referral);
    const refResponses = withRef.filter(a => !['saved', 'applied', 'ghosted'].includes(a.status)).length;
    const noRefResponses = withoutRef.filter(a => !['saved', 'applied', 'ghosted'].includes(a.status)).length;

    return {
      withReferral: {
        total: withRef.length,
        responses: refResponses,
        rate: withRef.length > 0 ? Math.round((refResponses / withRef.length) * 100) : 0,
      },
      withoutReferral: {
        total: withoutRef.length,
        responses: noRefResponses,
        rate: withoutRef.length > 0 ? Math.round((noRefResponses / withoutRef.length) * 100) : 0,
      },
    };
  }, [applications]);

  // Potentially ghosted
  const potentiallyGhosted = applications.filter(a => {
    if (['rejected', 'ghosted', 'offer'].includes(a.status)) return false;
    const days = daysAgo(a.updatedAt);
    return days >= ghostedThreshold;
  });

  // Insights
  const insights = useMemo(() => {
    const ins: { title: string; description: string; type: 'info' | 'success' | 'warning' | 'tip' }[] = [];

    const bestSource = sourceData.sort((a, b) => b.rate - a.rate)[0];
    if (bestSource) {
      ins.push({
        title: 'Best Application Source',
        description: `${bestSource.source} has the highest response rate in your data at ${bestSource.rate}%.`,
        type: 'success',
      });
    }

    if (referralData.withReferral.total > 0 && referralData.withReferral.rate > referralData.withoutReferral.rate) {
      ins.push({
        title: 'Referrals Are Working',
        description: `In your data, referred applications have a ${referralData.withReferral.rate}% response rate vs ${referralData.withoutReferral.rate}% without referral.`,
        type: 'tip',
      });
    }

    if (potentiallyGhosted.length > 0) {
      ins.push({
        title: `${potentiallyGhosted.length} Application(s) May Be Ghosted`,
        description: `${potentiallyGhosted.length} active applications haven't had an update in ${ghostedThreshold}+ days.`,
        type: 'warning',
      });
    }

    const bestResume = resumeData.sort((a, b) => b.rate - a.rate)[0];
    if (bestResume && bestResume.applications > 2) {
      ins.push({
        title: 'Best Performing Resume',
        description: `"${bestResume.name}" has the highest response rate (${bestResume.rate}%) in your history.`,
        type: 'tip',
      });
    }

    return ins;
  }, [sourceData, referralData, potentiallyGhosted, resumeData, ghostedThreshold]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Ghosted 👻"
        subtitle="&ldquo;We&apos;ll get back to you&rdquo; &mdash; turned into data."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Applications', value: stats.total, icon: '📋' },
          { label: 'Responses', value: stats.responses, icon: '📬' },
          { label: 'Interviews', value: stats.interviews, icon: '🎙️' },
          { label: 'Offers', value: stats.offers, icon: '🎉' },
        ].map(s => (
          <div key={s.label} className="glass-card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-white mb-1">
              <AnimatedNumber value={s.value} />
            </div>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Response Rate', value: stats.total > 0 ? Math.round((stats.responses / stats.total) * 100) : 0, color: 'text-blue-400' },
          { label: 'Interview Rate', value: stats.total > 0 ? Math.round((stats.interviews / stats.total) * 100) : 0, color: 'text-purple-400' },
          { label: 'Ghost Rate', value: stats.total > 0 ? Math.round(((stats.ghosted + potentiallyGhosted.length) / stats.total) * 100) : 0, color: 'text-gray-400' },
          { label: 'Offer Rate', value: stats.total > 0 ? Math.round((stats.offers / stats.total) * 100) : 0, color: 'text-green-400' },
        ].map(r => (
          <div key={r.label} className="glass-card p-4 text-center">
            <div className={cn('text-4xl font-black', r.color)}>
              <AnimatedNumber value={r.value} suffix="%" />
            </div>
            <p className="text-xs text-slate-400 mt-1">{r.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Application Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((d, i) => {
              const pct = funnelData[0].value > 0 ? Math.round((d.value / funnelData[0].value) * 100) : 0;
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{d.name}</span>
                    <span className="text-sm font-bold text-white">{d.value}</span>
                  </div>
                  <div className="h-7 bg-white/3 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-3"
                      style={{
                        width: `${Math.max(pct, 5)}%`,
                        background: `linear-gradient(90deg, ${CHART_COLORS[i]}, ${CHART_COLORS[i]}aa)`,
                        transition: 'width 1s ease',
                      }}
                    >
                      <span className="text-xs font-semibold text-white/90">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source performance */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Response Rate by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sourceData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="source" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" name="Response %" radius={[6, 6, 0, 0]}>
                {sourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Referral comparison */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Referral Impact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <div className="text-4xl font-black text-green-400 mb-1">{referralData.withReferral.rate}%</div>
              <p className="text-sm font-semibold text-white">With Referral</p>
              <p className="text-xs text-slate-400 mt-1">{referralData.withReferral.total} applications</p>
              <p className="text-xs text-slate-400">{referralData.withReferral.responses} responses</p>
            </div>
            <div className="text-center p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="text-4xl font-black text-red-400 mb-1">{referralData.withoutReferral.rate}%</div>
              <p className="text-sm font-semibold text-white">Without Referral</p>
              <p className="text-xs text-slate-400 mt-1">{referralData.withoutReferral.total} applications</p>
              <p className="text-xs text-slate-400">{referralData.withoutReferral.responses} responses</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 text-center">
            * Based on your historical application data. Correlation, not causation.
          </p>
        </div>

        {/* Resume A/B */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Resume A/B Performance</h3>
          <div className="space-y-3">
            {resumeData.map((r, i) => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300 truncate max-w-[160px]">{r.name}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{r.applications} apps</span>
                    <span className={cn('font-bold', {
                      'text-green-400': r.rate >= 20,
                      'text-amber-400': r.rate >= 10,
                      'text-red-400': r.rate < 10,
                    })}>{r.rate}%</span>
                  </div>
                </div>
                <div className="h-2 bg-white/3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(r.rate * 3, 5)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role performance */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Role Performance</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Type</th>
                <th>Applications</th>
                <th>Interviews</th>
                <th>Interview Rate</th>
              </tr>
            </thead>
            <tbody>
              {roleData.map(r => (
                <tr key={r.role}>
                  <td className="font-medium">{r.role}</td>
                  <td>{r.total}</td>
                  <td>{r.interviews}</td>
                  <td>
                    <span className={cn('font-semibold', {
                      'text-green-400': r.rate >= 20,
                      'text-amber-400': r.rate >= 10,
                      'text-red-400': r.rate < 10,
                    })}>
                      {r.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Potentially Ghosted */}
      {potentiallyGhosted.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Ghost Detector 👻</h3>
          <p className="text-xs text-slate-400 mb-4">
            Applications with no update in {ghostedThreshold}+ days. These may need follow-up or archival.
          </p>
          <div className="space-y-2">
            {potentiallyGhosted.map(app => (
              <div key={app.id} className="flex items-center gap-3 p-3 bg-gray-500/5 border border-gray-500/20 rounded-xl">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: app.companyColor + '33' }}
                >
                  {app.companyInitials.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{app.company}</p>
                  <p className="text-xs text-slate-400">{app.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold">{daysAgo(app.updatedAt)} days</p>
                  <p className="text-[10px] text-slate-500">no update</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Insights from Your Data</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <InsightCard key={i} title={ins.title} description={ins.description} type={ins.type} />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-3">
          * These insights describe your own historical application data and do not guarantee future outcomes.
        </p>
      </div>
    </div>
  );
}
