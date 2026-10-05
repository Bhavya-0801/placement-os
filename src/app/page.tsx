'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, ArrowRight, Briefcase, FileText, Mic, Brain,
  Ghost, ChevronRight, Zap
} from 'lucide-react';

const STATS = [
  { label: 'Applications', value: '47' },
  { label: 'OA Rounds', value: '8' },
  { label: 'Interviews', value: '5' },
  { label: 'Offer', value: '1' },
];

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Placement War Room',
    description: 'Every application. Every round. One dashboard.',
    detail: 'Kanban, table and timeline views. Track every company, status, referral and deadline in one place.',
    accent: '#7c3aed',
    href: '/war-room',
  },
  {
    icon: FileText,
    title: 'Resume Intelligence',
    description: "See your resume through a recruiter's eyes.",
    detail: 'Paste your resume and job description. Get a match score, missing skills, and what to fix.',
    accent: '#06b6d4',
    href: '/resume-intelligence',
  },
  {
    icon: Mic,
    title: 'Interview Replay',
    description: 'Your interview, analyzed like match footage.',
    detail: 'Practice with real questions. Detect filler words, STAR structure, and improvement trends.',
    accent: '#8b5cf6',
    href: '/interview-replay',
  },
  {
    icon: Brain,
    title: 'Placement Twin',
    description: 'Simulate your readiness before applying.',
    detail: 'See your readiness for each role. Run what-if simulations. "What if I learn Docker?"',
    accent: '#10b981',
    href: '/placement-twin',
  },
  {
    icon: Ghost,
    title: 'Ghosted',
    description: 'Turn rejection and silence into useful data.',
    detail: 'Funnel analytics, referral comparison, resume A/B performance, and application timing analysis.',
    accent: '#f59e0b',
    href: '/ghosted',
  },
];

const MICROCOPY = [
  'OA aa gaya bhai. 🎯',
  'Resume bhej diya, ab dua karo. 🤞',
  'HR said "we\'ll get back to you." 🕰️',
  'Ghosted again? Data hai toh dard nahi. 👻',
  'One application closer. 💪',
  'Referral mila? W. 🏆',
  'Shortlisted. Big W. ✅',
  'Interview kal hai BTW. 📅',
];

function HeroMockDashboard() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-[#0d0d24]/90 backdrop-blur overflow-hidden shadow-2xl">
        {/* Mock top bar */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-slate-400 font-mono">placementos.app/dashboard</span>
        </div>

        <div className="p-5">
          {/* Greeting */}
          <div className="mb-4">
            <p className="text-slate-400 text-xs">Good evening,</p>
            <h3 className="text-white font-bold text-lg">Bhavya 👋</h3>
            <p className="text-violet-400 text-xs mt-0.5">Adobe interview in 3 days. Placement Ka Pressure™</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Readiness bar */}
          <div className="bg-white/3 rounded-xl p-3 border border-white/5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-medium">Placement Readiness</span>
              <span className="text-sm font-bold text-violet-400">78%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[78%] bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
            </div>
          </div>

          {/* Recent apps */}
          <div className="space-y-2">
            {[
              { co: 'Amazon', role: 'SDE', status: 'Assessment', color: '#FF9900', badge: 'bg-yellow-400/10 text-yellow-400' },
              { co: 'Adobe', role: 'CSE', status: 'Interview', color: '#FF0000', badge: 'bg-purple-400/10 text-purple-400' },
              { co: 'Swiggy', role: 'Intern', status: 'Offer 🎉', color: '#FC8019', badge: 'bg-green-400/10 text-green-400' },
            ].map(app => (
              <div key={app.co} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: app.color + '33', border: `1px solid ${app.color}44` }}>
                  {app.co.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{app.co}</p>
                  <p className="text-[10px] text-slate-400">{app.role}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${app.badge}`}>{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 bg-green-500/20 border border-green-500/30 rounded-xl p-3 backdrop-blur">
        <p className="text-[10px] text-green-400 font-semibold">Offer Received! 🎉</p>
        <p className="text-[9px] text-slate-400">Swiggy • ₹60k/month</p>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-violet-500/20 border border-violet-500/30 rounded-xl p-3 backdrop-blur">
        <p className="text-[10px] text-violet-400 font-semibold">Resume Match: 74%</p>
        <p className="text-[9px] text-slate-400">Amazon SDE role</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [microcopyIdx, setMicrocopyIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMicrocopyIdx(i => (i + 1) % MICROCOPY.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#080818] mesh-gradient bg-grid text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#080818]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">PlacementOS</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">Explore Demo</Link>
          <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">Enter War Room <ArrowRight size={14} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-6">
              <Zap size={14} />
              <span className="transition-all duration-500">{MICROCOPY[microcopyIdx]}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Placement season<br />
              <span className="gradient-text">is chaos.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light mb-3">
              Your dashboard shouldn&apos;t be.
            </p>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg">
              PlacementOS combines applications, resumes, interviews, skills, and analytics into one system.
              <br />
              <span className="text-violet-400 font-medium">From &ldquo;Please Hire Me&rdquo; to &ldquo;Offer Received.&rdquo;</span>
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
                Enter War Room <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="btn-secondary text-base px-8 py-3.5">
                Explore Demo
              </Link>
            </div>
          </div>

          {/* Hero mock */}
          <div className="relative mt-16">
            <div className="absolute inset-0 bg-gradient-radial from-violet-600/20 via-transparent to-transparent blur-3xl -z-10" />
            <HeroMockDashboard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Five systems. <span className="gradient-text">One answer.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              PlacementOS answers the five most important questions during placement season.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <div className="glass-card p-6 h-full cursor-pointer group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: feature.accent + '20', border: `1px solid ${feature.accent}30` }}
                  >
                    <feature.icon size={22} style={{ color: feature.accent }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-violet-300 text-sm font-medium mb-3">{feature.description}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.detail}</p>
                  <div className="flex items-center gap-1 mt-4 text-sm font-medium" style={{ color: feature.accent }}>
                    Open <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Questions */}
      <section className="py-20 px-6 bg-[#0d0d24]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            PlacementOS answers <span className="gradient-text">5 questions</span>
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Where am I in my placement journey?', a: 'Placement War Room', icon: '📊' },
              { q: "Why am I not getting shortlisted?", a: 'Resume vs Job Analysis', icon: '📄' },
              { q: 'How well do I actually perform in interviews?', a: 'Interview Replay', icon: '🎙️' },
              { q: 'Which roles am I actually ready for?', a: 'Placement Twin', icon: '🧠' },
              { q: 'What does my application history tell me?', a: 'Ghosted Analytics', icon: '👻' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-5 rounded-xl bg-white/3 border border-white/5 text-left">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-slate-300 font-medium">{item.q}</p>
                  <p className="text-violet-400 text-sm mt-0.5">→ {item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Placement season starts<br />
            <span className="gradient-text">before the first company arrives.</span>
          </h2>
          <p className="text-slate-400 mb-8">
            Start building your PlacementOS profile today.
          </p>
          <Link href="/dashboard" className="btn-primary text-lg px-10 py-4">
            Enter War Room <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-slate-500 mt-4">
            🔒 All data stored locally. No account required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp size={16} className="text-violet-400" />
          <span className="font-bold text-white">PlacementOS</span>
        </div>
        <p className="text-xs text-slate-500">
          Placement Ka Pressure™ — turned into a system. | Made for BTech students
        </p>
        <p className="text-xs text-slate-600 mt-1">
          All data stored in browser localStorage. No backend, no tracking.
        </p>
      </footer>
    </div>
  );
}
