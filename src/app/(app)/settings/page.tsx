'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/context';
import { SectionHeader, Modal } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Settings, Moon, Sun, Clock, Database, Download, Upload,
  Trash2, RefreshCw, AlertTriangle, CheckCircle2, Shield,
  Bell, Info, Sparkles, HardDrive
} from 'lucide-react';
import type { AppState } from '@/lib/types';

export default function SettingsPage() {
  const {
    state,
    setTheme,
    setGhostedThreshold,
    resetDemoData,
    clearAllData,
    importState,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `placement-os-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exported successfully!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as AppState;
        if (parsed.profile && parsed.applications && Array.isArray(parsed.applications)) {
          importState(parsed);
          showToast('Data imported successfully!');
        } else {
          showToast('Invalid backup file format.');
        }
      } catch (err) {
        showToast('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Storage usage calculation
  const storageUsageKB = React.useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('placementos_state') || '';
      return (new Blob([raw]).size / 1024).toFixed(1);
    } catch {
      return '0';
    }
  }, [state]);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <SectionHeader
        title="Settings & Workspace Preferences"
        subtitle="Configure application rules, backup your data, adjust automation thresholds, and manage local storage."
      />

      {toastMessage && (
        <div className="p-3 bg-violet-600/20 border border-violet-500/40 rounded-xl text-violet-200 text-xs flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} className="text-violet-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ghosted Threshold Settings */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              Ghosted Classification Threshold
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Applications with no status change for longer than this duration will automatically trigger Ghosted alerts and analytics.
            </p>
          </div>
          <span className="text-sm font-bold text-cyan-400 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            {state.ghostedThreshold} Days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[7, 14, 21, 30].map(days => (
            <button
              key={days}
              onClick={() => {
                setGhostedThreshold(days);
                showToast(`Ghosted threshold set to ${days} days`);
              }}
              className={cn(
                'p-3 rounded-xl border text-center transition-all',
                state.ghostedThreshold === days
                  ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10'
                  : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]'
              )}
            >
              <div className="text-sm font-bold">{days} Days</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {days === 7 ? 'Aggressive' : days === 14 ? 'Standard' : days === 21 ? 'Lenient' : 'Maximum'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme & Display */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              Visual Theme
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              PlacementOS is optimized for deep dark glassmorphism to reduce eye strain during late-night coding and placement prep.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm pt-2">
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'p-3 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-semibold',
              state.theme === 'dark'
                ? 'border-violet-500 bg-violet-600/20 text-white'
                : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white'
            )}
          >
            <Moon size={15} /> Dark Glass
          </button>
          <button
            onClick={() => {
              setTheme('light');
              showToast('Theme set to Light (Dark remains recommended for high-contrast graphs)');
            }}
            className={cn(
              'p-3 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-semibold',
              state.theme === 'light'
                ? 'border-violet-500 bg-violet-600/20 text-white'
                : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white'
            )}
          >
            <Sun size={15} /> Light
          </button>
        </div>
      </div>

      {/* Backup, Import & Export */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <HardDrive size={16} className="text-emerald-400" />
            Data Management & Offline Backup
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            All your jobs, interview transcripts, and notes are securely stored in your local browser sandbox.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-slate-400">Applications Stored</span>
            <div className="text-xl font-bold text-white mt-1">{state.applications.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-slate-400">Interview Sessions</span>
            <div className="text-xl font-bold text-white mt-1">{state.interviewSessions.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-slate-400">Storage Footprint</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{storageUsageKB} KB</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <Download size={14} />
            Export Complete Backup (.json)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <Upload size={14} />
            Import Backup File
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.02] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle size={16} />
            Danger Zone
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Reset demo data to its initial curated state, or wipe all browser data to start completely blank.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Reset to Demo Seed Data
          </button>

          <button
            onClick={() => setClearModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} />
            Wipe All Data (Fresh Start)
          </button>
        </div>
      </div>

      {/* About Box */}
      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info size={14} />
          <span>PlacementOS v1.0.0 — Placement Ka Pressure™ turned into a system.</span>
        </div>
        <span>Offline-first &amp; Private</span>
      </div>

      {/* Reset Modal */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset to Demo State?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            This will reload the realistic demo dataset with 12+ company applications, mock interview replay sessions, resume analyses, and calendar schedules.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <button
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                resetDemoData();
                setResetModalOpen(false);
                showToast('Demo data reloaded!');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear Modal */}
      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Wipe All Data?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            This will permanently delete all applications, custom interview sessions, and stored resumes from your browser. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <button
              onClick={() => setClearModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearAllData();
                setClearModalOpen(false);
                showToast('All local data wiped. Workspace is fresh!');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500"
            >
              Yes, Wipe Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
