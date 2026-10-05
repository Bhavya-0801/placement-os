// PlacementOS Core Types

export type JobType = 'internship' | 'full-time' | 'contract' | 'part-time';

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'assessment'
  | 'oa-cleared'
  | 'interview'
  | 'hr'
  | 'offer'
  | 'rejected'
  | 'ghosted';

export type ApplicationSource =
  | 'linkedin'
  | 'company-career'
  | 'referral'
  | 'internshala'
  | 'naukri'
  | 'indeed'
  | 'campus'
  | 'other';

export type InterviewType = 'hr' | 'technical' | 'behavioral' | 'mixed' | 'rapid-fire';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  preferredRoles: string[];
  preferredLocations: string[];
  portfolio?: string;
  github?: string;
  linkedin?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  skills: UserSkill[];
  dsaSolved: number;
  internships: number;
  projects: number;
  hackathons: number;
  openSourceContributions: number;
  certifications: number;
  communicationRating: number; // 1-10
}

export interface UserSkill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export type SkillCategory =
  | 'programming'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'cloud'
  | 'devops'
  | 'ai-ml'
  | 'data'
  | 'core-cs'
  | 'communication'
  | 'other';

export interface Resume {
  id: string;
  name: string;
  content?: string;
  fileUrl?: string;
  targetRole?: string;
  createdAt: string;
  updatedAt: string;
  applications: number;
  responses: number;
}

export interface Application {
  id: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  role: string;
  jobType: JobType;
  location: string;
  remote: boolean;
  salary?: string;
  stipend?: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  applicationDate: string;
  deadline?: string;
  resumeId?: string;
  resumeName?: string;
  referral: boolean;
  referralContact?: string;
  applicationUrl?: string;
  skillsRequired: string[];
  notes?: string;
  nextAction?: string;
  priority: 'high' | 'medium' | 'low';
  events: ApplicationEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationEvent {
  id: string;
  type: 'applied' | 'oa-invite' | 'oa-completed' | 'interview' | 'offer' | 'rejected' | 'ghosted' | 'follow-up' | 'note' | 'hr';
  date: string;
  title: string;
  description?: string;
}

export interface InterviewSession {
  id: string;
  company: string;
  role: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  date: string;
  duration: number; // minutes
  score: number; // 0-100
  technicalScore: number;
  communicationScore: number;
  structureScore: number;
  conciseness: number;
  keywordCoverage: number;
  questions: InterviewQuestion[];
  metrics: InterviewMetrics;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'hr' | 'situational';
  answer?: string;
  score: number;
  fillerWords: number;
  wordCount: number;
  duration: number; // seconds
  starAnalysis?: StarAnalysis;
  feedback: string[];
  keywords: string[];
}

export interface StarAnalysis {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
  situationText?: string;
  taskText?: string;
  actionText?: string;
  resultText?: string;
}

export interface InterviewMetrics {
  totalWords: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordsPerMinute: number;
  averageAnswerLength: number;
  longestAnswer: number;
  shortestAnswer: number;
  topFillerWords: { word: string; count: number }[];
}

export interface ResumeAnalysis {
  id: string;
  resumeId?: string;
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  technicalScore: number;
  experienceScore: number;
  projectScore: number;
  keywordScore: number;
  educationScore: number;
  impactScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  requiredSkills: string[];
  strengths: string[];
  concerns: string[];
  impactStatements: string[];
  suggestions: string[];
  sections: ResumeSectionScore[];
  createdAt: string;
}

export interface ResumeSectionScore {
  section: string;
  score: number;
  issues: string[];
}

export interface RoleProfile {
  id: string;
  title: string;
  description: string;
  requiredSkills: { skill: string; weight: number; required: boolean }[];
  niceToHave: string[];
  minCGPA: number;
  dsaRequired: number;
  projectsRequired: number;
  internshipBonus: boolean;
  systemDesignRequired: boolean;
  avgPackage: string;
}

export interface PlacementSimulation {
  id: string;
  date: string;
  baseProfile: Partial<UserProfile>;
  modifications: SimulationModification[];
  roleScores: RoleScore[];
}

export interface SimulationModification {
  type: 'skill' | 'cgpa' | 'dsa' | 'internship' | 'project' | 'certification';
  label: string;
  value: string | number;
  impact: number;
}

export interface RoleScore {
  roleId: string;
  roleName: string;
  score: number;
  baseScore: number;
  breakdown: { category: string; score: number; weight: number }[];
  missingSkills: string[];
  strongSkills: string[];
  recommendations: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'deadline' | 'oa' | 'interview' | 'follow-up' | 'task' | 'other';
  applicationId?: string;
  company?: string;
  description?: string;
  completed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AppState {
  profile: UserProfile;
  applications: Application[];
  resumes: Resume[];
  interviewSessions: InterviewSession[];
  resumeAnalyses: ResumeAnalysis[];
  calendarEvents: CalendarEvent[];
  notifications: Notification[];
  theme: 'dark' | 'light';
  demoMode: boolean;
  ghostedThreshold: number; // days
}
