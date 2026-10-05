'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn, scoreColor, scoreGradient } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedNumber({ value, duration = 1000, className, suffix = '', prefix = '' }: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{displayed}{suffix}
    </span>
  );
}

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  animate?: boolean;
}

export function ProgressRing({ value, size = 120, strokeWidth = 8, className, label, animate = true }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [current, setCurrent] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) return;
    const timeout = setTimeout(() => setCurrent(value), 100);
    return () => clearTimeout(timeout);
  }, [value, animate]);

  const offset = circumference - (current / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={value} suffix="%" className={cn('text-2xl font-bold', scoreColor(value))} duration={1200} />
        {label && <span className="text-xs text-slate-400 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  className?: string;
  animate?: boolean;
}

export function ScoreBar({ label, value, className, animate = true }: ScoreBarProps) {
  const [width, setWidth] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(t);
  }, [value, animate]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={cn('text-sm font-semibold', scoreColor(value))}>{value}</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${width}%`, transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: string;
  animate?: boolean;
}

export function StatCard({ label, value, icon, trend, trendUp, accent = 'violet', animate = true }: StatCardProps) {
  const accentColors: Record<string, string> = {
    violet: 'from-violet-600/20 to-violet-600/5 border-violet-500/20',
    cyan: 'from-cyan-600/20 to-cyan-600/5 border-cyan-500/20',
    green: 'from-green-600/20 to-green-600/5 border-green-500/20',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20',
  };

  return (
    <div className={cn('stat-card bg-gradient-to-br', accentColors[accent] || accentColors.violet, 'animate-slide-up')}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/5">{icon}</div>
        {trend && (
          <span className={cn('text-xs font-medium', trendUp ? 'text-green-400' : 'text-red-400')}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' && animate
          ? <AnimatedNumber value={value} />
          : value}
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-5xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    saved: { label: 'Saved', className: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
    applied: { label: 'Applied', className: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    assessment: { label: 'Assessment', className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    'oa-cleared': { label: 'OA Cleared', className: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
    interview: { label: 'Interview', className: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
    hr: { label: 'HR Round', className: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
    offer: { label: 'Offer 🎉', className: 'text-green-400 bg-green-400/10 border-green-400/20' },
    rejected: { label: 'Rejected', className: 'text-red-400 bg-red-400/10 border-red-400/20' },
    ghosted: { label: 'Ghosted 👻', className: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
  };

  const config = configs[status] || configs.saved;
  return (
    <span className={cn('badge', config.className)}>
      {config.label}
    </span>
  );
}

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="border-2 border-violet-500 border-t-transparent rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-white/3 rounded-xl border border-white/5 w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            active === tab.id
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-[#111128] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up',
        widths[size]
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export function ToastProvider() {
  return null; // Simple implementation — toasts handled inline
}

export function InsightCard({
  title,
  description,
  type = 'info',
}: {
  title: string;
  description: string;
  type?: 'info' | 'success' | 'warning' | 'tip';
}) {
  const styles = {
    info: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
    success: 'border-green-500/20 bg-green-500/5 text-green-300',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
    tip: 'border-violet-500/20 bg-violet-500/5 text-violet-300',
  };
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', tip: '💡' };

  return (
    <div className={cn('border rounded-xl p-4', styles[type])}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div>
          <p className="font-semibold text-sm mb-1">{title}</p>
          <p className="text-xs opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );
}
