'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, FileText, Mic, Brain, Ghost,
  Zap, Calendar, User, Settings, ChevronRight, Bell, Search,
  X, Menu, TrendingUp, BookOpen,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard, section: 'main' },
  { href: '/war-room', label: 'War Room', icon: Briefcase, section: 'main' },
  { href: '/resume-intelligence', label: 'Resume Intelligence', icon: FileText, section: 'main' },
  { href: '/interview-replay', label: 'Interview Replay', icon: Mic, section: 'main' },
  { href: '/placement-twin', label: 'Placement Twin', icon: Brain, section: 'main' },
  { href: '/ghosted', label: 'Ghosted', icon: Ghost, section: 'main' },
  { href: '/skills', label: 'Skills', icon: Zap, section: 'secondary' },
  { href: '/calendar', label: 'Calendar', icon: Calendar, section: 'secondary' },
  { href: '/profile', label: 'Profile', icon: User, section: 'secondary' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { state } = useApp();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={cn('sidebar flex flex-col h-screen max-h-screen select-none', mobileOpen && 'open')}>
        {/* Logo */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-tight">PlacementOS</div>
              <div className="text-[10px] text-violet-400/70">Placement Ka Pressure™</div>
            </div>
          </Link>
          <button onClick={onMobileClose} className="md:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Demo badge */}
        {state.demoMode && (
          <div className="mx-4 mt-2.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg flex-shrink-0">
            <p className="text-[11px] text-violet-400 font-medium text-center">Demo Workspace</p>
          </div>
        )}

        {/* Profile preview */}
        <div className="px-4 py-2.5 mt-1 flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {state.profile.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{state.profile.name}</p>
              <p className="text-xs text-slate-400 truncate">{state.profile.branch} • {state.profile.graduationYear}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable Area */}
        <nav className="px-3 mt-1 flex-1 overflow-y-auto min-h-0 space-y-0.5 pb-3">
          <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Main</p>
          {NAV_ITEMS.filter(n => n.section === 'main').map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn('nav-item mb-0.5', active && 'active')}
              >
                <item.icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={12} className="opacity-50" />}
              </Link>
            );
          })}

          <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-3 mb-1">Tools</p>
          {NAV_ITEMS.filter(n => n.section === 'secondary').map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn('nav-item mb-0.5', active && 'active')}
              >
                <item.icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section (Settings pinned at bottom) */}
        <div className="px-3 py-3 border-t border-white/5 flex-shrink-0 bg-[#0d0d24]/80 backdrop-blur-sm">
          <Link href="/settings" className={cn('nav-item', pathname === '/settings' && 'active')}>
            <Settings size={16} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { state, markAllNotificationsRead } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const unread = state.notifications.filter(n => !n.read).length;
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Command Center',
    '/war-room': 'War Room',
    '/resume-intelligence': 'Resume Intelligence',
    '/interview-replay': 'Interview Replay',
    '/placement-twin': 'Placement Twin',
    '/ghosted': 'Ghosted',
    '/skills': 'Skills',
    '/calendar': 'Calendar',
    '/profile': 'Profile',
    '/settings': 'Settings',
  };

  const title = pageTitles[pathname] || pageTitles[Object.keys(pageTitles).find(k => pathname.startsWith(k)) || ''] || 'PlacementOS';

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#080818]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white p-1"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 top-10 w-80 bg-[#1a1a38] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <button
                    onClick={() => { markAllNotificationsRead(); setShowNotif(false); }}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-8">No notifications</p>
                  ) : (
                    state.notifications.map(n => (
                      <div
                        key={n.id}
                        className={cn(
                          'px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors',
                          !n.read && 'bg-violet-500/5'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const NAV = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/war-room', label: 'War Room', icon: Briefcase },
    { href: '/interview-replay', label: 'Interview', icon: Mic },
    { href: '/placement-twin', label: 'Twin', icon: Brain },
    { href: '/ghosted', label: 'Ghosted', icon: Ghost },
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {NAV.map(item => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-1',
              active ? 'text-violet-400' : 'text-slate-500'
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
