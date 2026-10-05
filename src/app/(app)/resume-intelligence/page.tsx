'use client';

import React, { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { analyzeResumeVsJob } from '@/lib/analysis';
import { ProgressRing, ScoreBar, InsightCard, LoadingSpinner, EmptyState, SectionHeader } from '@/components/ui';
import { cn, scoreColor } from '@/lib/utils';
import { Upload, FileText, Search, CheckCircle, XCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import type { ResumeAnalysis } from '@/lib/types';

const DEMO_RESUME = `Bhavya Sharma
bhavy@gmail.com | +91-9XXXXXXXXX | github.com/bhavya | linkedin.com/in/bhavya

EDUCATION
Delhi Technological University — B.Tech Computer Science (2023-2027)
CGPA: 8.2 | Relevant Coursework: DSA, DBMS, Operating Systems, Computer Networks

SKILLS
Languages: JavaScript, TypeScript, Python, Java, C++
Frontend: React, Next.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, REST APIs, GraphQL
Database: PostgreSQL, MongoDB, Redis, SQL
Tools: Git, Docker, VS Code, Linux

PROJECTS
PlacementOS — Full-Stack Web Application (React, Next.js, TypeScript)
• Built a comprehensive student placement tracking system used by 200+ students
• Implemented real-time analytics dashboard reducing application tracking time by 60%
• Deployed on Vercel with 99.9% uptime

Student Mentorship Platform (Node.js, PostgreSQL, React)
• Developed peer mentoring platform connecting 500+ students with alumni
• Reduced mentor-mentee matching time from 2 weeks to 3 days

INTERNSHIPS
SDE Intern — Swiggy (June 2025 - Aug 2025)
• Worked on backend APIs serving 10,000+ daily requests

ACHIEVEMENTS
• Winner — Smart India Hackathon 2024 (among 500 teams)
• GitHub: 150+ contributions, 3 open source projects
• LeetCode: 187 problems solved

CERTIFICATIONS
• AWS Cloud Practitioner (2024)
• Google Associate Android Developer (2024)`;

const DEMO_JD = `Software Engineer — Amazon India
Location: Bangalore | Full Time | 26 LPA

We are looking for a passionate Software Engineer to join our team.

Requirements:
• Strong proficiency in Data Structures and Algorithms
• Experience with Java or C++
• Knowledge of System Design principles
• Familiarity with distributed systems and microservices
• Experience with REST APIs
• SQL and database knowledge required
• Docker and containerization experience preferred
• AWS cloud experience is a plus
• Strong problem-solving and communication skills

Nice to have:
• Kubernetes
• CI/CD pipelines
• Kafka or message queuing systems`;

function RecruiterView({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <div className="space-y-6">
      {/* Recruiter scan simulation */}
      <div className="p-5 bg-white/3 border border-white/5 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">⏱ Recruiter Initial Scan</h3>
        <p className="text-xs text-slate-400 mb-4">A recruiter scans a resume in ~7 seconds. Here's what they'd notice:</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-green-400 mb-2">✓ Strong Signals</p>
            <div className="space-y-1">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-2">⚠ Concerns</p>
            <div className="space-y-1">
              {analysis.concerns.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <AlertCircle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impact statements found */}
      {analysis.impactStatements.length > 0 && (
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
          <p className="text-xs font-semibold text-green-400 mb-2">✓ Quantified Achievements Detected</p>
          {analysis.impactStatements.map((stmt, i) => (
            <p key={i} className="text-xs text-slate-300 mb-1">• {stmt}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillMatchGrid({ required, matched, missing }: { required: string[]; matched: string[]; missing: string[] }) {
  if (required.length === 0) return (
    <p className="text-sm text-slate-400">No specific skills could be extracted from the job description.</p>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Required by JD</h4>
        <div className="space-y-2">
          {required.map(skill => {
            const found = matched.includes(skill);
            return (
              <div key={skill} className={cn('flex items-center gap-2 p-2.5 rounded-lg border text-sm', {
                'border-green-500/20 bg-green-500/5 text-green-300': found,
                'border-red-500/20 bg-red-500/5 text-red-300': !found,
              })}>
                {found ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                <span className="capitalize">{skill}</span>
                {found && <span className="ml-auto text-[10px] text-green-400 font-semibold">FOUND</span>}
                {!found && <span className="ml-auto text-[10px] text-red-400 font-semibold">MISSING</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Suggestions</h4>
        <div className="space-y-2">
          {missing.slice(0, 5).map(skill => (
            <div key={skill} className="p-2.5 rounded-lg border border-violet-500/20 bg-violet-500/5">
              <p className="text-xs font-semibold text-violet-300 capitalize">{skill}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Add to skills section or mention in a project</p>
            </div>
          ))}
          {missing.length === 0 && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
              <p className="text-xs text-green-400 font-semibold">All required skills found! ✨</p>
              <p className="text-xs text-slate-400 mt-1">Your resume covers all the required skills for this role.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const LOADING_STEPS = [
  'Parsing resume...',
  'Extracting skills...',
  'Analyzing job description...',
  'Comparing requirements...',
  'Generating recruiter view...',
];

export default function ResumeIntelligencePage() {
  const { state, addResumeAnalysis, addResume } = useApp();
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [tab, setTab] = useState('analysis');
  const [showVersions, setShowVersions] = useState(false);

  const runAnalysis = useCallback(async () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setIsAnalyzing(true);
    setLoadStep(0);

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setLoadStep(i);
    }

    const result = analyzeResumeVsJob(resumeText, jdText, jobTitle || 'Unknown Role', company || 'Unknown Company');
    const fullResult: ResumeAnalysis = {
      ...result,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };
    setAnalysis(fullResult);
    addResumeAnalysis(result);
    setIsAnalyzing(false);
  }, [resumeText, jdText, jobTitle, company, addResumeAnalysis]);

  const useDemoData = () => {
    setResumeText(DEMO_RESUME);
    setJdText(DEMO_JD);
    setJobTitle('Software Engineer');
    setCompany('Amazon');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Resume Intelligence"
        subtitle="See what a recruiter sees before they reject you."
        action={
          <div className="flex gap-2">
            <button onClick={useDemoData} className="btn-secondary text-sm py-2">
              Use Demo Data
            </button>
            <button onClick={() => setShowVersions(!showVersions)} className="btn-secondary text-sm py-2">
              <FileText size={14} /> Versions
            </button>
          </div>
        }
      />

      {/* Resume Versions panel */}
      {showVersions && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Your Resume Versions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {state.resumes.map(r => (
              <div key={r.id} className="p-3 bg-white/3 border border-white/5 rounded-xl">
                <p className="text-sm font-medium text-white truncate">{r.name}</p>
                {r.targetRole && <p className="text-xs text-slate-400 mt-0.5">{r.targetRole}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{r.applications} apps</span>
                  <span>{r.responses} responses</span>
                </div>
                <div className="mt-1">
                  <span className={cn('text-xs font-semibold', {
                    'text-green-400': r.applications > 0 && (r.responses / r.applications) > 0.2,
                    'text-amber-400': r.applications > 0 && (r.responses / r.applications) > 0.1,
                    'text-red-400': r.applications > 0 && (r.responses / r.applications) <= 0.1,
                    'text-slate-400': r.applications === 0,
                  })}>
                    {r.applications > 0 ? `${Math.round((r.responses / r.applications) * 100)}% response rate` : 'No apps yet'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!analysis ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Resume Input */}
          <div className="glass-card p-5">
            <label className="input-label mb-3">Resume Text</label>
            <textarea
              className="input min-h-[300px] resize-none font-mono text-xs"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          </div>

          {/* JD Input */}
          <div className="glass-card p-5">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="input-label">Job Title</label>
                <input className="input" placeholder="Software Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
              <div>
                <label className="input-label">Company</label>
                <input className="input" placeholder="Google" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
            </div>
            <label className="input-label mb-2">Job Description</label>
            <textarea
              className="input min-h-[250px] resize-none text-xs"
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={e => setJdText(e.target.value)}
            />
          </div>

          {/* Analyze Button */}
          <div className="lg:col-span-2 flex justify-center">
            {isAnalyzing ? (
              <div className="text-center py-6">
                <LoadingSpinner size={32} />
                <p className="text-sm text-violet-400 mt-3 animate-pulse">{LOADING_STEPS[loadStep]}</p>
              </div>
            ) : (
              <button
                onClick={runAnalysis}
                disabled={!resumeText.trim() || !jdText.trim()}
                className="btn-primary text-base px-10 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={18} /> Analyze Resume vs Job
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Reset */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Analyzing <strong className="text-white">{analysis.jobTitle}</strong> at <strong className="text-white">{analysis.company}</strong>
            </p>
            <button onClick={() => setAnalysis(null)} className="btn-secondary text-sm py-2">
              ← New Analysis
            </button>
          </div>

          {/* Score + Breakdown */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Big score */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400 mb-3">Match Score</p>
              <ProgressRing value={analysis.overallScore} size={140} label="Overall" />
              <p className={cn('text-sm font-semibold mt-3', scoreColor(analysis.overallScore))}>
                {analysis.overallScore >= 80 ? 'Strong Match ✨' :
                  analysis.overallScore >= 60 ? 'Good Match 👍' : 'Needs Work ⚠️'}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="md:col-span-2 glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Score Breakdown</h3>
              <div className="space-y-3">
                <ScoreBar label="Technical Skills" value={analysis.technicalScore} />
                <ScoreBar label="Experience" value={analysis.experienceScore} />
                <ScoreBar label="Projects" value={analysis.projectScore} />
                <ScoreBar label="Keywords" value={analysis.keywordScore} />
                <ScoreBar label="Education" value={analysis.educationScore} />
                <ScoreBar label="Impact Statements" value={analysis.impactScore} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/5">
            {['analysis', 'skills', 'recruiter', 'suggestions'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-all capitalize',
                  tab === t
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'analysis' && (
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.sections.map(s => (
                <div key={s.section} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{s.section}</h4>
                    <span className={cn('text-sm font-bold', scoreColor(s.score))}>{s.score}%</span>
                  </div>
                  <div className="progress-bar mb-2">
                    <div className="progress-fill" style={{ width: `${s.score}%` }} />
                  </div>
                  {s.issues.map((issue, i) => (
                    <p key={i} className="text-xs text-amber-400 mt-1">⚠ {issue}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {tab === 'skills' && (
            <div className="glass-card p-6">
              <SkillMatchGrid
                required={analysis.requiredSkills}
                matched={analysis.matchedSkills}
                missing={analysis.missingSkills}
              />
            </div>
          )}

          {tab === 'recruiter' && (
            <div className="glass-card p-6">
              <RecruiterView analysis={analysis} />
            </div>
          )}

          {tab === 'suggestions' && (
            <div className="space-y-3">
              {analysis.suggestions.map((s, i) => (
                <InsightCard key={i} title={`Suggestion ${i + 1}`} description={s} type="tip" />
              ))}
              {analysis.suggestions.length === 0 && (
                <InsightCard
                  title="Looking good!"
                  description="Your resume aligns well with this job description. Focus on polishing impact statements."
                  type="success"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
