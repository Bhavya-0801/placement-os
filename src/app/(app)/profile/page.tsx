'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { SectionHeader, ScoreBar, ProgressRing, StatCard } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  User, GraduationCap, Briefcase, Code, Award, Globe,
  Mail, Phone, MapPin, CheckCircle2,
  Save, Sparkles, ExternalLink, BookOpen, Layers, Terminal
} from 'lucide-react';
import type { UserProfile } from '@/lib/types';

function GithubIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function ProfilePage() {
  const { state, updateProfile } = useApp();
  const [profile, setProfile] = useState<UserProfile>(state.profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'academic' | 'portfolio' | 'metrics'>('general');

  // Calculate profile completeness
  const completeness = React.useMemo(() => {
    let score = 0;
    const checks = [
      Boolean(profile.name),
      Boolean(profile.email),
      Boolean(profile.phone),
      Boolean(profile.university),
      Boolean(profile.branch),
      Boolean(profile.cgpa && profile.cgpa > 0),
      Boolean(profile.graduationYear),
      profile.preferredRoles?.length > 0,
      profile.preferredLocations?.length > 0,
      Boolean(profile.github),
      Boolean(profile.linkedin),
      Boolean(profile.portfolio),
      profile.dsaSolved > 50,
      profile.projects > 1,
      profile.skills?.length > 4,
    ];
    score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    return score;
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <SectionHeader
        title="Student Placement Profile"
        subtitle="Manage your academic credentials, project portfolio, DSA metrics, and job targets."
        action={
          <button
            onClick={() => handleSave()}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            {savedSuccess ? <CheckCircle2 size={14} className="text-green-300" /> : <Save size={14} />}
            {savedSuccess ? 'Changes Saved!' : 'Save Changes'}
          </button>
        }
      />

      {/* Header Profile Summary Card */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-r from-violet-950/20 via-slate-900/40 to-cyan-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl flex-shrink-0">
              <div className="w-full h-full bg-[#0d0d21] rounded-2xl flex items-center justify-center font-bold text-2xl text-white">
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium border border-violet-500/30">
                  Class of {profile.graduationYear}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {profile.degree} in {profile.branch} • {profile.university}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-500" /> {profile.email}</span>
                {profile.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-500" /> {profile.phone}</span>}
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">CGPA: {profile.cgpa} / 10</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 w-full md:w-auto justify-between md:justify-start">
            <ProgressRing value={completeness} size={64} strokeWidth={6} label="Profile" />
            <div>
              <div className="text-xs font-semibold text-white">Profile Strength</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {completeness >= 80 ? 'Ready for placement drives' : 'Complete missing fields for higher match'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2 text-sm">
        {[
          { id: 'general', label: 'Basic Info', icon: User },
          { id: 'academic', label: 'Academic & University', icon: GraduationCap },
          { id: 'metrics', label: 'DSA & Credentials', icon: Terminal },
          { id: 'portfolio', label: 'Links & Socials', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors text-xs',
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-white/5">
              <User size={16} className="text-violet-400" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Bio / Pitch</label>
                <input
                  type="text"
                  value={profile.bio || ''}
                  onChange={e => handleChange('bio', e.target.value)}
                  placeholder="Passionate Full-Stack Developer & Problem Solver"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Preferred Job Roles (comma separated)</label>
              <input
                type="text"
                value={profile.preferredRoles?.join(', ') || ''}
                onChange={e => handleChange('preferredRoles', e.target.value.split(',').map(s => s.trim()))}
                placeholder="Software Engineer, Backend Developer, Full Stack Engineer"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Target Locations (comma separated)</label>
              <input
                type="text"
                value={profile.preferredLocations?.join(', ') || ''}
                onChange={e => handleChange('preferredLocations', e.target.value.split(',').map(s => s.trim()))}
                placeholder="Bengaluru, Hyderabad, Pune, Remote"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </form>
        )}

        {/* Tab 2: Academic */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-white/5">
              <GraduationCap size={16} className="text-cyan-400" />
              University & Academic Records
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">University / Institute</label>
                <input
                  type="text"
                  value={profile.university}
                  onChange={e => handleChange('university', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Degree Program</label>
                <input
                  type="text"
                  value={profile.degree}
                  onChange={e => handleChange('degree', e.target.value)}
                  placeholder="B.Tech, B.E., M.Tech"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Branch / Specialization</label>
                <input
                  type="text"
                  value={profile.branch}
                  onChange={e => handleChange('branch', e.target.value)}
                  placeholder="Computer Science and Engineering"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Graduation Year</label>
                <input
                  type="number"
                  value={profile.graduationYear}
                  onChange={e => handleChange('graduationYear', parseInt(e.target.value) || 2026)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Cumulative Grade Point (CGPA)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={profile.cgpa}
                  onChange={e => handleChange('cgpa', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Companies often filter cutoffs at 7.0, 7.5, or 8.0</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Metrics & Credentials */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-white/5">
              <Terminal size={16} className="text-emerald-400" />
              DSA & Placement Track Record
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">DSA Problems Solved</label>
                <input
                  type="number"
                  value={profile.dsaSolved}
                  onChange={e => handleChange('dsaSolved', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">LeetCode, GFG, Codeforces</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Projects Built</label>
                <input
                  type="number"
                  value={profile.projects}
                  onChange={e => handleChange('projects', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Full stack & end-to-end applications</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Internships Completed</label>
                <input
                  type="number"
                  value={profile.internships}
                  onChange={e => handleChange('internships', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Prior corporate/startup experience</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Hackathons Won / Participated</label>
                <input
                  type="number"
                  value={profile.hackathons}
                  onChange={e => handleChange('hackathons', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Certifications</label>
                <input
                  type="number"
                  value={profile.certifications}
                  onChange={e => handleChange('certifications', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">AWS, GCP, Coursera certificates</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Communication Rating (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={profile.communicationRating}
                  onChange={e => handleChange('communicationRating', parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Self / mock interview assessment</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Portfolio & Links */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-white/5">
              <Globe size={16} className="text-amber-400" />
              Online Presence & Profiles
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <GithubIcon size={14} className="text-slate-400" /> GitHub URL
                </label>
                <input
                  type="url"
                  value={profile.github || ''}
                  onChange={e => handleChange('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <LinkedinIcon size={14} className="text-blue-400" /> LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={profile.linkedin || ''}
                  onChange={e => handleChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Globe size={14} className="text-cyan-400" /> Portfolio Website
                </label>
                <input
                  type="url"
                  value={profile.portfolio || ''}
                  onChange={e => handleChange('portfolio', e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 mt-6 border-t border-white/5">
          <button
            onClick={() => handleSave()}
            className="btn btn-primary text-xs flex items-center gap-2 px-6 py-2.5"
          >
            {savedSuccess ? <CheckCircle2 size={14} className="text-green-300" /> : <Save size={14} />}
            {savedSuccess ? 'Profile Saved!' : 'Save Profile Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
