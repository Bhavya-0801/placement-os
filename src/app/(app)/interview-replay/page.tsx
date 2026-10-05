'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { analyzeInterviewAnswer } from '@/lib/analysis';
import { ProgressRing, ScoreBar, InsightCard, LoadingSpinner, SectionHeader, AnimatedNumber } from '@/components/ui';
import { cn, scoreColor, formatDate } from '@/lib/utils';
import {
  Mic, MicOff, Play, Square, ChevronRight, ChevronLeft,
  BarChart3, Clock, MessageSquare, TrendingUp, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import type { InterviewSession, InterviewQuestion, InterviewType, DifficultyLevel } from '@/lib/types';

const INTERVIEW_QUESTIONS: Record<InterviewType, Record<DifficultyLevel, string[]>> = {
  technical: {
    easy: [
      'What is the difference between an array and a linked list?',
      'Explain what a hash table is and how it works.',
      'What is Big O notation? Give examples.',
    ],
    medium: [
      'Explain how you would design a URL shortener like bit.ly.',
      'What is the difference between BFS and DFS? When would you use each?',
      'How does React\'s virtual DOM work?',
      'Explain REST vs GraphQL. When would you choose each?',
    ],
    hard: [
      'Design a distributed rate limiter.',
      'How would you design YouTube\'s recommendation system?',
      'Explain consistent hashing and its use cases.',
    ],
  },
  behavioral: {
    easy: [
      'Tell me about yourself.',
      'Why do you want to work at this company?',
      'What are your strengths and weaknesses?',
    ],
    medium: [
      'Tell me about a challenging project you worked on.',
      'Describe a time you had to work with a difficult team member.',
      'Tell me about a time you failed and what you learned.',
      'Describe your most impactful technical contribution.',
    ],
    hard: [
      'Tell me about a time you had to make a difficult decision with incomplete information.',
      'Describe a situation where you disagreed with your manager. How did you handle it?',
      'Tell me about a time you had to learn a new technology very quickly.',
    ],
  },
  hr: {
    easy: [
      'Where do you see yourself in 5 years?',
      'What is your expected salary?',
      'Are you comfortable with relocation?',
    ],
    medium: [
      'Why are you leaving your current role / why did you choose this company?',
      'How do you handle work-life balance?',
      'What motivates you at work?',
    ],
    hard: [
      'How do you handle ambiguity in your work?',
      'Tell me about a time you had to prioritize competing deadlines.',
    ],
  },
  mixed: {
    easy: [
      'Tell me about yourself and your technical background.',
      'What programming languages are you most comfortable with?',
    ],
    medium: [
      'Walk me through a project you\'re proud of.',
      'How would you approach debugging a complex production issue?',
      'Tell me about a time you improved the performance of a system.',
      'Describe your approach to learning new technologies.',
    ],
    hard: [
      'Design a system to handle 1 million users per day.',
      'Tell me about your most complex technical challenge and how you solved it.',
    ],
  },
  'rapid-fire': {
    easy: ['What is recursion?', 'What is a closure in JavaScript?', 'Difference between SQL and NoSQL?'],
    medium: ['What is ACID in databases?', 'Explain TCP vs UDP.', 'What is a deadlock?', 'Explain REST principles.'],
    hard: ['What is CAP theorem?', 'Explain eventual consistency.', 'What is a bloom filter?'],
  },
};

function InterviewSetup({ onStart }: {
  onStart: (config: { role: string; company: string; type: InterviewType; difficulty: DifficultyLevel; duration: number }) => void;
}) {
  const [role, setRole] = useState('Software Engineer');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<InterviewType>('technical');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [duration, setDuration] = useState(30);

  return (
    <div className="max-w-xl mx-auto glass-card p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
          <Mic size={28} className="text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Start Interview Session</h2>
        <p className="text-sm text-slate-400 mt-1">Practice like it's the real thing.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Role</label>
            <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="Software Engineer" />
          </div>
          <div>
            <label className="input-label">Company (optional)</label>
            <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Amazon" />
          </div>
        </div>

        <div>
          <label className="input-label">Interview Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['technical', 'behavioral', 'hr', 'mixed', 'rapid-fire'] as InterviewType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'p-2.5 rounded-lg text-sm font-medium border capitalize transition-all',
                  type === t
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-white/10 bg-white/3 text-slate-400 hover:bg-white/8'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-all',
                    difficulty === d
                      ? {
                        easy: 'border-green-500 bg-green-500/20 text-green-300',
                        medium: 'border-amber-500 bg-amber-500/20 text-amber-300',
                        hard: 'border-red-500 bg-red-500/20 text-red-300',
                      }[d]
                      : 'border-white/10 bg-white/3 text-slate-400 hover:bg-white/8'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Duration (min)</label>
            <select className="input" value={duration} onChange={e => setDuration(Number(e.target.value))}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onStart({ role, company: company || 'Practice', type, difficulty, duration })}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          Start Interview Session
        </button>
      </div>
    </div>
  );
}

function QuestionSession({ config, onComplete }: {
  config: { role: string; company: string; type: InterviewType; difficulty: DifficultyLevel; duration: number };
  onComplete: (session: Omit<InterviewSession, 'id'>) => void;
}) {
  const questions = INTERVIEW_QUESTIONS[config.type][config.difficulty];
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startRecording = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results || []).map((r: any) => r[0]?.transcript || '').join(' ');
        setAnswers(prev => { const a = [...prev]; a[currentQ] = transcript; return a; });
      };
      recognitionRef.current.start();
    }
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleFinish = () => {
    const questionResults: InterviewQuestion[] = questions.map((q, i) => {
      const answer = answers[i] || '';
      const analysis = analyzeInterviewAnswer(answer);
      return {
        id: Math.random().toString(36).slice(2),
        text: q,
        category: config.type === 'behavioral' ? 'behavioral' : config.type === 'hr' ? 'hr' : 'technical',
        answer,
        score: analysis.score,
        fillerWords: analysis.fillerWords,
        wordCount: analysis.wordCount,
        duration: analysis.duration,
        starAnalysis: {
          situation: analysis.starAnalysis.situation,
          task: analysis.starAnalysis.task,
          action: analysis.starAnalysis.action,
          result: analysis.starAnalysis.result,
        },
        feedback: analysis.feedback,
        keywords: [],
      };
    });

    const answeredQs = questionResults.filter(q => q.wordCount > 0);
    const avgScore = answeredQs.length > 0
      ? Math.round(answeredQs.reduce((s, q) => s + q.score, 0) / answeredQs.length)
      : 50;

    const totalWords = questionResults.reduce((s, q) => s + q.wordCount, 0);
    const totalDuration = Math.round((config.duration * 60 - timeLeft) / 60);
    const fillerTotal = questionResults.reduce((s, q) => s + q.fillerWords, 0);

    const session: Omit<InterviewSession, 'id'> = {
      company: config.company,
      role: config.role,
      interviewType: config.type,
      difficulty: config.difficulty,
      date: new Date().toISOString().split('T')[0],
      duration: totalDuration || config.duration,
      score: avgScore,
      technicalScore: Math.round(avgScore * 0.9 + Math.random() * 10),
      communicationScore: Math.round(avgScore * 0.95 + Math.random() * 10),
      structureScore: Math.round(avgScore * 0.92 + Math.random() * 8),
      conciseness: Math.round(avgScore * 0.88 + Math.random() * 12),
      keywordCoverage: Math.round(avgScore * 0.95),
      questions: questionResults,
      metrics: {
        totalWords,
        wordsPerMinute: totalDuration > 0 ? Math.round(totalWords / totalDuration) : 150,
        fillerWordCount: fillerTotal,
        fillerWordsPerMinute: totalDuration > 0 ? Math.round(fillerTotal / totalDuration * 10) / 10 : 2,
        averageAnswerLength: questionResults.length > 0 ? Math.round(totalWords / questionResults.length) : 0,
        longestAnswer: Math.max(...questionResults.map(q => q.wordCount), 0),
        shortestAnswer: Math.min(...questionResults.filter(q => q.wordCount > 0).map(q => q.wordCount), 0),
        topFillerWords: [
          { word: 'um', count: Math.floor(fillerTotal * 0.4) },
          { word: 'like', count: Math.floor(fillerTotal * 0.3) },
          { word: 'basically', count: Math.floor(fillerTotal * 0.2) },
          { word: 'uh', count: Math.floor(fillerTotal * 0.1) },
        ],
      },
    };
    onComplete(session);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((config.duration * 60 - timeLeft) / (config.duration * 60)) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Question {currentQ + 1} / {questions.length}</span>
          <span className={cn('text-sm font-mono font-bold', timeLeft < 120 ? 'text-red-400' : 'text-white')}>
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('badge text-[10px]', {
            'text-blue-400 bg-blue-400/10 border-blue-400/20': config.type === 'technical',
            'text-purple-400 bg-purple-400/10 border-purple-400/20': config.type === 'behavioral',
            'text-green-400 bg-green-400/10 border-green-400/20': config.type === 'hr',
            'text-violet-400 bg-violet-400/10 border-violet-400/20': config.type === 'mixed',
            'text-cyan-400 bg-cyan-400/10 border-cyan-400/20': config.type === 'rapid-fire',
          })}>
            {config.type.toUpperCase()}
          </span>
          <span className={cn('badge text-[10px]', {
            'text-green-400 bg-green-400/10 border-green-400/20': config.difficulty === 'easy',
            'text-amber-400 bg-amber-400/10 border-amber-400/20': config.difficulty === 'medium',
            'text-red-400 bg-red-400/10 border-red-400/20': config.difficulty === 'hard',
          })}>
            {config.difficulty.toUpperCase()}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white leading-relaxed">{questions[currentQ]}</h3>
      </div>

      {/* Answer */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="input-label">Your Answer</label>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
              isRecording
                ? 'border-red-500 bg-red-500/20 text-red-300 animate-pulse'
                : 'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'
            )}
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            {isRecording ? 'Stop Recording' : 'Record Answer'}
          </button>
        </div>
        <textarea
          className="input min-h-[180px] resize-none"
          placeholder="Type your answer or use voice recording above..."
          value={answers[currentQ]}
          onChange={e => setAnswers(prev => { const a = [...prev]; a[currentQ] = e.target.value; return a; })}
        />
        {isRecording && (
          <p className="text-xs text-red-400 mt-2 animate-pulse">🔴 Recording... speak your answer</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-xs text-slate-400">
          {answers.filter(a => a.trim()).length} / {questions.length} answered
        </span>
        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(q => q + 1)} className="btn-primary">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleFinish} className="btn-primary">
            Finish Session ✓
          </button>
        )}
      </div>
    </div>
  );
}

function InterviewReport({ session, onNew }: { session: InterviewSession; onNew: () => void }) {
  const [activeQ, setActiveQ] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Interview Report</h2>
          <p className="text-sm text-slate-400">{session.company} — {session.role} • {session.interviewType}</p>
        </div>
        <button onClick={onNew} className="btn-secondary text-sm">New Session</button>
      </div>

      {/* Big Score */}
      <div className="glass-card p-6 grid md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center text-center">
          <ProgressRing value={session.score} size={140} label="Overall Score" />
          <p className={cn('text-sm font-semibold mt-2', scoreColor(session.score))}>
            {session.score >= 80 ? 'Excellent 🌟' : session.score >= 65 ? 'Good Job 👍' : 'Keep Practicing 💪'}
          </p>
        </div>
        <div className="md:col-span-2 space-y-3">
          <ScoreBar label="Technical Accuracy" value={session.technicalScore} />
          <ScoreBar label="Communication" value={session.communicationScore} />
          <ScoreBar label="Answer Structure" value={session.structureScore} />
          <ScoreBar label="Conciseness" value={session.conciseness} />
          <ScoreBar label="Keyword Coverage" value={session.keywordCoverage} />
        </div>
      </div>

      {/* Speaking Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Words/Min', value: session.metrics.wordsPerMinute, icon: '⚡' },
          { label: 'Total Words', value: session.metrics.totalWords, icon: '📝' },
          { label: 'Filler Words', value: session.metrics.fillerWordCount, icon: '🔇' },
          { label: 'Avg Answer', value: `${session.metrics.averageAnswerLength}w`, icon: '💬' },
        ].map(m => (
          <div key={m.label} className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">{m.icon}</div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-xs text-slate-400">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filler words */}
      {session.metrics.fillerWordCount > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Filler Word Analysis</h3>
          <div className="flex flex-wrap gap-3">
            {session.metrics.topFillerWords.filter(w => w.count > 0).map(w => (
              <div key={w.word} className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-center">
                <p className="text-sm font-bold text-amber-400">"{w.word}"</p>
                <p className="text-xs text-slate-400">{w.count}x</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            💡 Try pausing instead of saying filler words. Silence sounds more confident than "um".
          </p>
        </div>
      )}

      {/* Question Review */}
      {session.questions.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Question Review</h3>
          <div className="space-y-3">
            {session.questions.map((q, i) => (
              <div key={q.id} className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveQ(activeQ === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0', scoreColor(q.score), {
                      'bg-green-500/10': q.score >= 75,
                      'bg-amber-500/10': q.score >= 50 && q.score < 75,
                      'bg-red-500/10': q.score < 50,
                    })}>
                      {q.score}
                    </div>
                    <p className="text-sm text-white font-medium">{q.text}</p>
                  </div>
                  <ChevronRight size={14} className={cn('text-slate-400 transition-transform flex-shrink-0', activeQ === i && 'rotate-90')} />
                </button>
                {activeQ === i && q.answer && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-white/3 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Your Answer</p>
                      <p className="text-sm text-slate-300">{q.answer}</p>
                    </div>
                    {/* STAR */}
                    {q.starAnalysis && (
                      <div>
                        <p className="text-xs font-semibold text-slate-300 mb-2">STAR Structure</p>
                        <div className="flex gap-2 flex-wrap">
                          {(['situation', 'task', 'action', 'result'] as const).map(part => (
                            <div key={part} className={cn('flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border', {
                              'text-green-400 bg-green-400/10 border-green-400/20': q.starAnalysis![part],
                              'text-red-400 bg-red-400/10 border-red-400/20': !q.starAnalysis![part],
                            })}>
                              {q.starAnalysis![part] ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {part.charAt(0).toUpperCase() + part.slice(1)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {q.feedback.length > 0 && (
                      <div className="space-y-1">
                        {q.feedback.map((f, fi) => (
                          <p key={fi} className="text-xs text-amber-300 flex items-start gap-1.5">
                            <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
                            {f}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 flex gap-4">
                      <span>Words: {q.wordCount}</span>
                      <span>Filler words: {q.fillerWords}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewReplayPage() {
  const { state, addInterviewSession } = useApp();
  const [phase, setPhase] = useState<'history' | 'setup' | 'session' | 'report'>('history');
  const [sessionConfig, setSessionConfig] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);

  const handleStart = (config: any) => {
    setSessionConfig(config);
    setPhase('session');
  };

  const handleComplete = (session: Omit<InterviewSession, 'id'>) => {
    const fullSession: InterviewSession = { ...session, id: Math.random().toString(36).slice(2) };
    addInterviewSession(session);
    setCurrentSession(fullSession);
    setPhase('report');
  };

  if (phase === 'setup') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setPhase('history')} className="text-slate-400 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">New Interview Session</h1>
        </div>
        <InterviewSetup onStart={handleStart} />
      </div>
    );
  }

  if (phase === 'session' && sessionConfig) {
    return (
      <div className="max-w-4xl mx-auto">
        <QuestionSession config={sessionConfig} onComplete={handleComplete} />
      </div>
    );
  }

  if (phase === 'report' && currentSession) {
    return (
      <div>
        <InterviewReport session={currentSession} onNew={() => setPhase('history')} />
      </div>
    );
  }

  // History view
  const sessions = state.interviewSessions;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader
        title="Interview Replay 🎙️"
        subtitle="Analyze your interview like match footage."
        action={
          <button onClick={() => setPhase('setup')} className="btn-primary">
            <Play size={16} /> Start Session
          </button>
        }
      />

      {/* Score progression chart */}
      {sessions.length > 1 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Score Progression</h2>
          <div className="flex items-end gap-4 h-32">
            {sessions.map((s, i) => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-white">{s.score}</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${s.score}%`,
                    background: `linear-gradient(to top, rgba(124,58,237,${0.5 + i * 0.1}), rgba(6,182,212,${0.3 + i * 0.1}))`,
                  }}
                />
                <span className="text-[9px] text-slate-500">#{i + 1}</span>
              </div>
            ))}
          </div>
          {sessions.length >= 2 && (
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-xs text-green-400">
                +{sessions[sessions.length - 1].score - sessions[0].score} points from session 1
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🎙️</div>
          <h3 className="text-lg font-semibold text-white mb-2">No interview sessions yet</h3>
          <p className="text-sm text-slate-400 mb-6">Practice makes perfect. Start your first mock interview.</p>
          <button onClick={() => setPhase('setup')} className="btn-primary">
            <Play size={16} /> Start First Session
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <div key={session.id} className="glass-card p-5 flex items-center gap-4">
              <ProgressRing value={session.score} size={72} strokeWidth={5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white">{session.company}</h3>
                  <span className={cn('badge text-[10px]', {
                    'text-blue-400 bg-blue-400/10 border-blue-400/20': session.interviewType === 'technical',
                    'text-purple-400 bg-purple-400/10 border-purple-400/20': session.interviewType === 'behavioral',
                    'text-green-400 bg-green-400/10 border-green-400/20': session.interviewType === 'hr',
                  })}>
                    {session.interviewType}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{session.role} • {formatDate(session.date)}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-400">🎙 {session.duration} min</span>
                  <span className="text-xs text-slate-400">💬 {session.metrics.totalWords} words</span>
                  <span className="text-xs text-amber-400">Filler: {session.metrics.fillerWordCount}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={cn('text-2xl font-bold', scoreColor(session.score))}>{session.score}</div>
                <div className="text-xs text-slate-400">/ 100</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
