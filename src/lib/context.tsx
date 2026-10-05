'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppState, Application, InterviewSession, Resume, CalendarEvent, Notification, UserProfile, ResumeAnalysis } from '@/lib/types';
import { loadState, saveState, clearState, generateId } from '@/lib/storage';
import { createDemoState } from '@/lib/demo-data';

interface AppContextType {
  state: AppState;
  isLoading: boolean;
  // Applications
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'events'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  // Interview Sessions
  addInterviewSession: (session: Omit<InterviewSession, 'id'>) => void;
  // Resumes
  addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  // Resume Analyses
  addResumeAnalysis: (analysis: Omit<ResumeAnalysis, 'id' | 'createdAt'>) => void;
  // Calendar
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void;
  // Settings
  setTheme: (theme: 'dark' | 'light') => void;
  setGhostedThreshold: (days: number) => void;
  importState: (data: AppState) => void;
  clearAllData: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadState();
      if (saved) {
        setState(saved);
      } else {
        const demo = createDemoState();
        setState(demo);
        saveState(demo);
      }
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addApplication = useCallback((app: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'events'>) => {
    update(prev => ({
      ...prev,
      applications: [
        {
          ...app,
          id: generateId(),
          events: [{ id: generateId(), type: 'applied', date: app.applicationDate, title: 'Application submitted' }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Application,
        ...prev.applications,
      ],
    }));
  }, [update]);

  const updateApplication = useCallback((id: string, updates: Partial<Application>) => {
    update(prev => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
  }, [update]);

  const deleteApplication = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      applications: prev.applications.filter(a => a.id !== id),
    }));
  }, [update]);

  const addInterviewSession = useCallback((session: Omit<InterviewSession, 'id'>) => {
    update(prev => ({
      ...prev,
      interviewSessions: [{ ...session, id: generateId() }, ...prev.interviewSessions],
    }));
  }, [update]);

  const addResume = useCallback((resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => {
    update(prev => ({
      ...prev,
      resumes: [
        { ...resume, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...prev.resumes,
      ],
    }));
  }, [update]);

  const updateResume = useCallback((id: string, updates: Partial<Resume>) => {
    update(prev => ({
      ...prev,
      resumes: prev.resumes.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r),
    }));
  }, [update]);

  const deleteResume = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      resumes: prev.resumes.filter(r => r.id !== id),
    }));
  }, [update]);

  const addResumeAnalysis = useCallback((analysis: Omit<ResumeAnalysis, 'id' | 'createdAt'>) => {
    update(prev => ({
      ...prev,
      resumeAnalyses: [
        { ...analysis, id: generateId(), createdAt: new Date().toISOString() },
        ...prev.resumeAnalyses,
      ],
    }));
  }, [update]);

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    update(prev => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, { ...event, id: generateId() }],
    }));
  }, [update]);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    update(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map(e => e.id === id ? { ...e, ...updates } : e),
    }));
  }, [update]);

  const deleteCalendarEvent = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.filter(e => e.id !== id),
    }));
  }, [update]);

  const markNotificationRead = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  }, [update]);

  const markAllNotificationsRead = useCallback(() => {
    update(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  }, [update]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    update(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  }, [update]);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    update(prev => ({ ...prev, theme }));
  }, [update]);

  const setGhostedThreshold = useCallback((days: number) => {
    update(prev => ({ ...prev, ghostedThreshold: days }));
  }, [update]);

  const importState = useCallback((data: AppState) => {
    setState(data);
    saveState(data);
  }, []);

  const clearAllData = useCallback(() => {
    clearState();
    const emptyState: AppState = {
      profile: {
        id: 'user_default',
        name: 'Student Name',
        email: '',
        university: '',
        degree: 'B.Tech',
        branch: 'Computer Science',
        graduationYear: 2026,
        cgpa: 0,
        preferredRoles: [],
        preferredLocations: [],
        skills: [],
        dsaSolved: 0,
        internships: 0,
        projects: 0,
        hackathons: 0,
        openSourceContributions: 0,
        certifications: 0,
        communicationRating: 5,
      },
      applications: [],
      resumes: [],
      interviewSessions: [],
      resumeAnalyses: [],
      calendarEvents: [],
      notifications: [],
      theme: 'dark',
      demoMode: false,
      ghostedThreshold: 14,
    };
    setState(emptyState);
    saveState(emptyState);
  }, []);

  const resetDemoData = useCallback(() => {
    clearState();
    const demo = createDemoState();
    setState(demo);
    saveState(demo);
  }, []);

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-violet-300 text-sm">Loading PlacementOS...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state,
      isLoading,
      addApplication,
      updateApplication,
      deleteApplication,
      addInterviewSession,
      addResume,
      updateResume,
      deleteResume,
      addResumeAnalysis,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      setTheme,
      setGhostedThreshold,
      importState,
      clearAllData,
      resetDemoData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
