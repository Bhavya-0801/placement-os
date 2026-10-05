'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { SectionHeader, Modal } from '@/components/ui';
import { cn, generateId } from '@/lib/utils';
import { Plus, Zap, Code, Layout, Server, Database, Cloud, Cog, Brain, BarChart3, MessageSquare, Book } from 'lucide-react';
import type { UserSkill, SkillCategory, SkillLevel } from '@/lib/types';

const CATEGORIES: { id: SkillCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'programming', label: 'Programming', icon: <Code size={14} /> },
  { id: 'frontend', label: 'Frontend', icon: <Layout size={14} /> },
  { id: 'backend', label: 'Backend', icon: <Server size={14} /> },
  { id: 'database', label: 'Databases', icon: <Database size={14} /> },
  { id: 'cloud', label: 'Cloud', icon: <Cloud size={14} /> },
  { id: 'devops', label: 'DevOps', icon: <Cog size={14} /> },
  { id: 'ai-ml', label: 'AI/ML', icon: <Brain size={14} /> },
  { id: 'data', label: 'Data', icon: <BarChart3 size={14} /> },
  { id: 'core-cs', label: 'Core CS', icon: <Book size={14} /> },
  { id: 'communication', label: 'Communication', icon: <MessageSquare size={14} /> },
];

const LEVEL_CONFIG: Record<SkillLevel, { label: string; color: string; width: string }> = {
  beginner: { label: 'Beginner', color: 'bg-slate-400', width: '25%' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-400', width: '55%' },
  advanced: { label: 'Advanced', color: 'bg-green-400', width: '80%' },
  expert: { label: 'Expert', color: 'bg-violet-400', width: '100%' },
};

function SkillCard({ skill, onUpdate }: { skill: UserSkill; onUpdate: (skill: UserSkill) => void }) {
  const lc = LEVEL_CONFIG[skill.level];
  return (
    <div className="p-3 bg-white/3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{skill.name}</span>
        <select
          value={skill.level}
          onChange={e => onUpdate({ ...skill, level: e.target.value as SkillLevel })}
          className="text-xs bg-transparent border-none outline-none cursor-pointer"
          style={{ color: lc.color.replace('bg-', '').includes('slate') ? '#94a3b8' : lc.color.replace('bg-', '').includes('amber') ? '#fbbf24' : lc.color.replace('bg-', '').includes('green') ? '#4ade80' : '#a78bfa' }}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', lc.color)} style={{ width: lc.width, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function AddSkillModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { updateProfile, state } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('programming');
  const [level, setLevel] = useState<SkillLevel>('beginner');

  const handleAdd = () => {
    if (!name.trim()) return;
    updateProfile({
      skills: [...state.profile.skills, { id: generateId(), name, category, level }]
    });
    setName('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Skill" size="sm">
      <div className="space-y-4">
        <div>
          <label className="input-label">Skill Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kubernetes" autoFocus />
        </div>
        <div>
          <label className="input-label">Category</label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value as SkillCategory)}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Level</label>
          <div className="flex gap-2">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn('flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-all', {
                  'border-violet-500 bg-violet-500/20 text-violet-300': level === l,
                  'border-white/10 bg-white/3 text-slate-400': level !== l,
                })}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary w-full justify-center">Add Skill</button>
      </div>
    </Modal>
  );
}

// Radar chart component
function SkillRadar({ skills }: { skills: UserSkill[] }) {
  const categoryScores = useMemo(() => {
    const SCORE_MAP: Record<SkillLevel, number> = { beginner: 25, intermediate: 55, advanced: 80, expert: 100 };
    const catMap: Record<string, number[]> = {};
    skills.forEach(s => {
      if (!catMap[s.category]) catMap[s.category] = [];
      catMap[s.category].push(SCORE_MAP[s.level]);
    });
    return CATEGORIES.map(c => ({
      category: c.label,
      score: catMap[c.id]?.length
        ? Math.round(catMap[c.id].reduce((a, b) => a + b, 0) / catMap[c.id].length)
        : 0,
      count: catMap[c.id]?.length || 0,
    }));
  }, [skills]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {categoryScores.filter(c => c.count > 0).map(c => (
        <div key={c.category} className="text-center p-3 bg-white/3 border border-white/5 rounded-xl">
          <div className="text-lg font-bold text-white mb-1">{c.score}%</div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              style={{ width: `${c.score}%`, transition: 'width 1s ease' }} />
          </div>
          <p className="text-xs text-slate-400">{c.category}</p>
          <p className="text-[10px] text-slate-500">{c.count} skills</p>
        </div>
      ))}
    </div>
  );
}

export default function SkillsPage() {
  const { state, updateProfile } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');

  const filtered = useMemo(() =>
    activeCategory === 'all'
      ? state.profile.skills
      : state.profile.skills.filter(s => s.category === activeCategory),
    [state.profile.skills, activeCategory]
  );

  const handleUpdateSkill = (updated: UserSkill) => {
    updateProfile({
      skills: state.profile.skills.map(s => s.id === updated.id ? updated : s)
    });
  };

  const grouped = useMemo(() => {
    const g: Record<string, UserSkill[]> = {};
    filtered.forEach(s => {
      const catLabel = CATEGORIES.find(c => c.id === s.category)?.label || s.category;
      if (!g[catLabel]) g[catLabel] = [];
      g[catLabel].push(s);
    });
    return g;
  }, [filtered]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader
        title="Skills"
        subtitle={`${state.profile.skills.length} skills tracked across ${CATEGORIES.length} categories`}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} /> Add Skill
          </button>
        }
      />

      {/* Overview */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Skill Overview</h2>
        <SkillRadar skills={state.profile.skills} />
      </div>

      {/* Level summary */}
      <div className="grid grid-cols-4 gap-3">
        {(['beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map(level => {
          const count = state.profile.skills.filter(s => s.level === level).length;
          const lc = LEVEL_CONFIG[level];
          return (
            <div key={level} className="glass-card p-4 text-center">
              <div className={cn('text-2xl font-bold', {
                'text-slate-400': level === 'beginner',
                'text-amber-400': level === 'intermediate',
                'text-green-400': level === 'advanced',
                'text-violet-400': level === 'expert',
              })}>{count}</div>
              <p className="text-xs text-slate-400 mt-1 capitalize">{level}</p>
            </div>
          );
        })}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn('flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
            activeCategory === 'all' ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/3 text-slate-400 border-white/5'
          )}
        >
          All ({state.profile.skills.length})
        </button>
        {CATEGORIES.map(c => {
          const count = state.profile.skills.filter(s => s.category === c.id).length;
          if (count === 0) return null;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={cn('flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                activeCategory === c.id ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/3 text-slate-400 border-white/5'
              )}
            >
              {c.icon}{c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Skills grid */}
      {Object.entries(grouped).map(([cat, skills]) => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{cat}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {skills.map(skill => (
              <SkillCard key={skill.id} skill={skill} onUpdate={handleUpdateSkill} />
            ))}
          </div>
        </div>
      ))}

      {/* DSA Progress */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4">DSA Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-violet-400">{state.profile.dsaSolved}</div>
            <p className="text-xs text-slate-400">Solved</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{Math.max(0, 300 - state.profile.dsaSolved)}</div>
            <p className="text-xs text-slate-400">To target (300)</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{Math.round((state.profile.dsaSolved / 300) * 100)}%</div>
            <p className="text-xs text-slate-400">Progress</p>
          </div>
        </div>
        <div className="progress-bar mt-4">
          <div className="progress-fill" style={{ width: `${Math.min(100, (state.profile.dsaSolved / 300) * 100)}%` }} />
        </div>
      </div>

      <AddSkillModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
