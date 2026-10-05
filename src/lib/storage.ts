import type {
  AppState,
  UserProfile,
  Application,
  Resume,
  InterviewSession,
  ResumeAnalysis,
  CalendarEvent,
  Notification,
} from './types';

const STORAGE_KEY = 'placementos_state';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Failed to save state to localStorage');
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export { generateId };
