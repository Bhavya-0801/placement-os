'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { calculateAllRoleScores, simulateImprovement } from '@/lib/placement-twin';
import { DEMO_ROLE_PROFILES } from '@/lib/demo-data';
import { ProgressRing, ScoreBar, InsightCard, SectionHeader, AnimatedNumber } from '@/components/ui';
import { cn, scoreColor } from '@/lib/utils';
import { Brain, Zap, ChevronRight, TrendingUp, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import type { RoleScore } from '@/lib/types';

const WHAT_IF_OPTIONS = [
  { type: 'skill', label: 'Learn Docker', value: 'Docker', icon: '🐳' },
  { type: 'skill', label: 'Learn AWS', value: 'AWS', icon: '☁️' },
  { type: 'skill', label: 'Learn System Design', value: 'System Design', icon: '🏗️' },
  { type: 'skill', label: 'Learn PyTorch', value: 'PyTorch', icon: '🧠' },
  { type: 'skill', label: 'Learn Kubernetes', value: 'Kubernetes', icon: '⚙️' },
  { type: 'skill', label: 'Learn TypeScript', value: 'TypeScript', icon: '📘' },
  { type: 'dsa', label: '+100 DSA problems', value: 100, icon: '💻' },
  { type: 'dsa', label: '+200 DSA problems', value: 200, icon: '🚀' },
  { type: 'internship', label: 'Add 1 Internship', value: 1, icon: '💼' },
  { type: 'project', label: 'Add 1 Project', value: 1, icon: '📁' },
  { type: 'cgpa', label: 'CGPA → 8.5', value: 8.5, icon: '🎓' },
  { type: 'cgpa', label: 'CGPA → 9.0', value: 9.0, icon: '⭐' },
];

function RoleCard({ score, onClick }: { score: RoleScore; onClick: () => void }) {
  const colors = {
    90: 'from-green-600/20 to-green-600/5 border-green-500/30',
    75: 'from-cyan-600/20 to-cyan-600/5 border-cyan-500/30',
    55: 'from-amber-600/20 to-amber-600/5 border-amber-500/30',
    0: 'from-red-600/20 to-red-600/5 border-red-500/30',
  };

  const colorClass = score.score >= 90 ? colors[90] :
    score.score >= 75 ? colors[75] :
    score.score >= 55 ? colors[55] : colors[0];

  return (
    <button
      onClick={onClick}
      className={cn('glass-card p-5 bg-gradient-to-br cursor-pointer hover:scale-[1.02] transition-all text-left', colorClass)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white">{score.roleName}</h3>
        <span className={cn('text-2xl font-black', scoreColor(score.score))}>{score.score}%</span>
      </div>
      <div className="progress-bar mb-3">
        <div className="progress-fill" style={{ width: `${score.score}%` }} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {score.strongSkills.slice(0, 3).map(s => (
          <span key={s} className="text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 rounded px-1.5 py-0.5">{s}</span>
        ))}
        {score.missingSkills.slice(0, 2).map(s => (
          <span key={s} className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 rounded px-1.5 py-0.5 line-through">{s}</span>
        ))}
      </div>
    </button>
  );
}

function WhatIfSimulator({ selectedRole, baseScores }: { selectedRole: RoleScore | null; baseScores: RoleScore[] }) {
  const { state } = useApp();
  const [selectedMod, setSelectedMod] = useState<typeof WHAT_IF_OPTIONS[0] | null>(null);
  const [targetRoleId, setTargetRoleId] = useState(selectedRole?.roleId || 'swe');

  const targetRole = DEMO_ROLE_PROFILES.find(r => r.id === targetRoleId);
  const baseScore = baseScores.find(s => s.roleId === targetRoleId)?.score || 0;

  const simScore = useMemo(() => {
    if (!selectedMod || !targetRole) return baseScore;
    return simulateImprovement(state.profile, { type: selectedMod.type, value: selectedMod.value }, targetRole);
  }, [selectedMod, targetRole, state.profile, baseScore]);

  const improvement = simScore - baseScore;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-violet-400" />
        <h2 className="text-lg font-bold text-white">What-If Simulator</h2>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Simulate improvements without changing your actual profile. See the impact instantly.
      </p>

      <div className="mb-4">
        <label className="input-label mb-2">Target Role</label>
        <select className="input" value={targetRoleId} onChange={e => { setTargetRoleId(e.target.value); setSelectedMod(null); }}>
          {DEMO_ROLE_PROFILES.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
        {WHAT_IF_OPTIONS.map(option => (
          <button
            key={option.label}
            onClick={() => setSelectedMod(selectedMod?.label === option.label ? null : option)}
            className={cn(
              'p-2.5 rounded-xl text-left border transition-all',
              selectedMod?.label === option.label
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-white/5 bg-white/3 hover:bg-white/8'
            )}
          >
            <span className="text-lg block mb-0.5">{option.icon}</span>
            <span className={cn('text-xs font-medium', selectedMod?.label === option.label ? 'text-violet-300' : 'text-slate-300')}>
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* Comparison */}
      <div className="flex items-center gap-6 justify-center p-5 bg-white/3 rounded-2xl border border-white/5">
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Current</p>
          <ProgressRing value={baseScore} size={100} strokeWidth={6} />
        </div>
        <div className="text-center">
          <ArrowRight size={24} className={cn('mx-auto mb-2', improvement > 0 ? 'text-green-400' : 'text-slate-400')} />
          {selectedMod && improvement !== 0 && (
            <span className={cn('text-xl font-bold', improvement > 0 ? 'text-green-400' : 'text-red-400')}>
              {improvement > 0 ? '+' : ''}{improvement}%
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Simulated</p>
          <ProgressRing value={simScore} size={100} strokeWidth={6} />
        </div>
      </div>

      {selectedMod && (
        <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <p className="text-sm text-violet-300">
            {improvement > 0
              ? `✨ If you ${selectedMod.label.toLowerCase()}, your readiness for ${DEMO_ROLE_PROFILES.find(r => r.id === targetRoleId)?.title} would improve by +${improvement}%`
              : `This improvement doesn't significantly impact ${DEMO_ROLE_PROFILES.find(r => r.id === targetRoleId)?.title} readiness`}
          </p>
        </div>
      )}

      <p className="text-[10px] text-slate-500 mt-3">
        * Simulations are estimates based on skill matching algorithms. Actual hiring decisions involve many more factors.
      </p>
    </div>
  );
}

function RoleDetail({ score, onBack }: { score: RoleScore; onBack: () => void }) {
  return (
    <div className="max-w-2xl space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        ← Back to all roles
      </button>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{score.roleName}</h2>
          <ProgressRing value={score.score} size={100} strokeWidth={6} />
        </div>

        <div className="space-y-3 mb-5">
          {score.breakdown.map(b => (
            <ScoreBar key={b.category} label={b.category} value={b.score} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-green-400 mb-2">✓ Strong Areas</h4>
            {score.strongSkills.length > 0 ? (
              score.strongSkills.map(s => (
                <div key={s} className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                  <CheckCircle size={12} className="text-green-400" />
                  {s}
                </div>
              ))
            ) : <p className="text-xs text-slate-400">Keep building skills!</p>}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-red-400 mb-2">✗ Missing / Weak</h4>
            {score.missingSkills.length > 0 ? (
              score.missingSkills.map(s => (
                <div key={s} className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                  <XCircle size={12} className="text-red-400" />
                  {s}
                </div>
              ))
            ) : <p className="text-xs text-green-400">All required skills covered! 🎉</p>}
          </div>
        </div>
      </div>

      {score.recommendations.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Recommended Actions</h3>
          <div className="space-y-2">
            {score.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                <span className="text-violet-400 font-bold text-sm">{i + 1}</span>
                <p className="text-sm text-slate-300">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlacementTwinPage() {
  const { state } = useApp();
  const [selectedRole, setSelectedRole] = useState<RoleScore | null>(null);
  const [tab, setTab] = useState<'roles' | 'simulator'>('roles');

  const roleScores = useMemo(() => calculateAllRoleScores(state.profile), [state.profile]);

  if (selectedRole) {
    return (
      <div className="max-w-5xl mx-auto">
        <RoleDetail score={selectedRole} onBack={() => setSelectedRole(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Placement Twin 🧠"
        subtitle="What happens if you improve one thing?"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setTab('roles')}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                tab === 'roles' ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/3 text-slate-400 border-white/5')}
            >
              Role Readiness
            </button>
            <button
              onClick={() => setTab('simulator')}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                tab === 'simulator' ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/3 text-slate-400 border-white/5')}
            >
              <Zap size={14} className="inline mr-1" />
              What-If
            </button>
          </div>
        }
      />

      {/* Profile Summary */}
      <div className="glass-card p-5">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-slate-400">CGPA</p>
            <p className="text-xl font-bold text-white">{state.profile.cgpa}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">DSA Solved</p>
            <p className="text-xl font-bold text-white">{state.profile.dsaSolved}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Projects</p>
            <p className="text-xl font-bold text-white">{state.profile.projects}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Internships</p>
            <p className="text-xl font-bold text-white">{state.profile.internships}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Skills</p>
            <p className="text-xl font-bold text-white">{state.profile.skills.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Hackathons</p>
            <p className="text-xl font-bold text-white">{state.profile.hackathons}</p>
          </div>
        </div>
      </div>

      {tab === 'roles' && (
        <div>
          <p className="text-sm text-slate-400 mb-4">
            Based on your skill profile and experience. Click a role for detailed breakdown.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleScores.map(score => (
              <RoleCard key={score.roleId} score={score} onClick={() => setSelectedRole(score)} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            * Scores are estimates based on skill matching. Actual shortlisting depends on many factors.
          </p>
        </div>
      )}

      {tab === 'simulator' && (
        <WhatIfSimulator selectedRole={selectedRole} baseScores={roleScores} />
      )}
    </div>
  );
}
