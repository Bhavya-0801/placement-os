import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function daysAgo(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    saved: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    applied: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    assessment: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'oa-cleared': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    interview: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    hr: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    offer: 'text-green-400 bg-green-400/10 border-green-400/20',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
    ghosted: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  };
  return colors[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    saved: 'Saved',
    applied: 'Applied',
    assessment: 'Assessment',
    'oa-cleared': 'OA Cleared',
    interview: 'Interview',
    hr: 'HR Round',
    offer: 'Offer 🎉',
    rejected: 'Rejected',
    ghosted: 'Ghosted 👻',
  };
  return labels[status] || status;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-slate-400',
  };
  return colors[priority] || 'text-slate-400';
}

export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    linkedin: 'LinkedIn',
    'company-career': 'Company Career',
    referral: 'Referral',
    internshala: 'Internshala',
    naukri: 'Naukri',
    indeed: 'Indeed',
    campus: 'Campus',
    other: 'Other',
  };
  return labels[source] || source;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

export function scoreGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-emerald-400';
  if (score >= 60) return 'from-yellow-500 to-amber-400';
  return 'from-red-500 to-rose-400';
}
