import type { ResumeAnalysis } from './types';

const COMMON_TECH_SKILLS = [
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'next.js', 'vue', 'angular', 'svelte', 'tailwind', 'css', 'html', 'webpack', 'vite',
  'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails', 'graphql', 'rest api',
  'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'supabase', 'sqlite', 'sql',
  'aws', 'gcp', 'azure', 'cloud', 'lambda', 'ec2', 's3', 'cloudfront',
  'docker', 'kubernetes', 'ci/cd', 'github actions', 'jenkins', 'terraform', 'ansible',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'data structures', 'algorithms', 'system design', 'oop', 'git', 'linux', 'bash',
  'microservices', 'kafka', 'rabbitmq', 'grpc', 'websockets', 'oauth', 'jwt',
];

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'so', 'right', 'i mean', 'kind of', 'sort of', 'literally'];

const IMPACT_PATTERNS = [
  /\d+%/g,
  /\d+ (users|students|customers|people|clients)/gi,
  /reduced.*by \d+/gi,
  /increased.*by \d+/gi,
  /improved.*by \d+/gi,
  /built.*for \d+/gi,
  /deployed.*\d+/gi,
  /processed.*\d+/gi,
  /saved.*\d+/gi,
  /generated.*\d+/gi,
];

function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  return COMMON_TECH_SKILLS.filter(skill => lowerText.includes(skill.toLowerCase()));
}

function extractRequiredSkills(jd: string): string[] {
  const lowerJd = jd.toLowerCase();
  const found: string[] = [];
  
  // Common JD requirement patterns
  const requirementPatterns = [
    /required skills?:([^.]*)/gi,
    /must have:([^.]*)/gi,
    /requirements?:([^.]*)/gi,
    /qualifications?:([^.]*)/gi,
    /we're looking for:([^.]*)/gi,
  ];

  // Just extract all tech skills from JD
  for (const skill of COMMON_TECH_SKILLS) {
    if (lowerJd.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }

  return found;
}

function detectImpactStatements(text: string): string[] {
  const statements: string[] = [];
  const sentences = text.split(/[.!?]/);
  
  for (const sentence of sentences) {
    if (IMPACT_PATTERNS.some(p => p.test(sentence))) {
      const trimmed = sentence.trim();
      if (trimmed.length > 10) {
        statements.push(trimmed.substring(0, 120));
        // Reset lastIndex for global regexes
        IMPACT_PATTERNS.forEach(p => { if (p.global) p.lastIndex = 0; });
      }
    }
  }
  return statements.slice(0, 5);
}

function checkResumeSections(resumeText: string) {
  const lower = resumeText.toLowerCase();
  const sections = [
    { section: 'Contact Info', keywords: ['email', 'phone', 'linkedin', 'github'], weight: 10 },
    { section: 'Education', keywords: ['b.tech', 'bachelor', 'university', 'college', 'cgpa', 'gpa'], weight: 15 },
    { section: 'Skills', keywords: ['skills', 'technologies', 'languages', 'tools'], weight: 15 },
    { section: 'Projects', keywords: ['project', 'built', 'developed', 'created'], weight: 20 },
    { section: 'Experience', keywords: ['experience', 'internship', 'worked', 'company', 'role'], weight: 20 },
    { section: 'Impact', keywords: ['%', 'users', 'reduced', 'increased', 'improved', 'million', 'thousand'], weight: 20 },
  ];

  return sections.map(s => {
    const found = s.keywords.filter(k => lower.includes(k)).length;
    const ratio = found / s.keywords.length;
    const score = Math.round(ratio * 100);
    const issues: string[] = [];
    if (score < 50) issues.push(`${s.section} section appears incomplete or missing.`);
    if (s.section === 'Impact' && score < 30) issues.push('No quantified achievements detected. Add metrics like "Improved X by 30%".');
    return { section: s.section, score: Math.min(100, score), issues };
  });
}

export function analyzeResumeVsJob(resumeText: string, jobDescription: string, jobTitle: string, company: string): Omit<ResumeAnalysis, 'id' | 'createdAt'> {
  const resumeSkills = extractSkills(resumeText);
  const requiredSkills = extractRequiredSkills(jobDescription);
  
  const matchedSkills = requiredSkills.filter(s =>
    resumeSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(s =>
    !resumeSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
  );

  const keywordScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 60;

  const impactStatements = detectImpactStatements(resumeText);
  const impactScore = Math.min(100, 30 + impactStatements.length * 14);

  const sections = checkResumeSections(resumeText);
  const sectionAvg = sections.reduce((s, c) => s + c.score, 0) / sections.length;

  const lower = resumeText.toLowerCase();
  const hasExperience = /internship|intern|worked at|experience/i.test(resumeText);
  const hasProjects = /project|built|developed/i.test(resumeText);
  const hasLinkedIn = /linkedin/i.test(resumeText);
  const hasGitHub = /github/i.test(resumeText);

  const experienceScore = hasExperience ? 72 : 42;
  const projectScore = hasProjects ? Math.min(100, 50 + resumeSkills.length * 3) : 35;
  const educationScore = /cgpa|gpa|university|college/i.test(resumeText) ? 85 : 60;

  const technicalScore = Math.round(
    keywordScore * 0.4 + (resumeSkills.length / Math.max(requiredSkills.length, 1)) * 60 * 0.6
  );

  const overallScore = Math.round(
    technicalScore * 0.25 +
    experienceScore * 0.2 +
    projectScore * 0.2 +
    keywordScore * 0.15 +
    educationScore * 0.1 +
    impactScore * 0.1
  );

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (matchedSkills.length > 0) {
    strengths.push(`${matchedSkills.length} required skills found: ${matchedSkills.slice(0, 3).join(', ')}`);
  }
  if (impactStatements.length > 0) {
    strengths.push(`${impactStatements.length} quantified achievement(s) detected`);
  }
  if (hasGitHub) strengths.push('GitHub profile linked — demonstrates active coding');
  if (hasLinkedIn) strengths.push('LinkedIn profile present');
  if (educationScore > 80) strengths.push('Education section well-structured');

  if (missingSkills.length > 0) {
    concerns.push(`Missing ${missingSkills.length} required skill(s): ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (impactStatements.length === 0) {
    concerns.push('No quantified impact found. Add metrics (e.g., "Reduced load time by 40%")');
  }
  if (!hasExperience) {
    concerns.push('No internship/experience section detected');
  }
  if (!hasGitHub) {
    concerns.push('GitHub link not found — add it to show active development');
  }

  const suggestions: string[] = [
    ...missingSkills.slice(0, 3).map(s => `Add ${s} to your skills or mention it in project descriptions`),
    impactStatements.length < 2 ? 'Add at least 2-3 quantified achievements to each project' : '',
    !hasLinkedIn ? 'Add your LinkedIn URL to the contact section' : '',
    !hasGitHub ? 'Add your GitHub URL to increase recruiter confidence' : '',
  ].filter(Boolean);

  return {
    resumeText,
    jobDescription,
    jobTitle,
    company,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    technicalScore: Math.min(100, Math.max(0, technicalScore)),
    experienceScore: Math.min(100, Math.max(0, experienceScore)),
    projectScore: Math.min(100, Math.max(0, projectScore)),
    keywordScore: Math.min(100, Math.max(0, keywordScore)),
    educationScore: Math.min(100, Math.max(0, educationScore)),
    impactScore: Math.min(100, Math.max(0, impactScore)),
    matchedSkills,
    missingSkills,
    requiredSkills,
    strengths,
    concerns,
    impactStatements,
    suggestions,
    sections,
  };
}

export function analyzeInterviewAnswer(answer: string, questionKeywords: string[] = []): {
  score: number;
  fillerWords: number;
  wordCount: number;
  duration: number;
  starAnalysis: { situation: boolean; task: boolean; action: boolean; result: boolean };
  feedback: string[];
} {
  const words = answer.trim().split(/\s+/);
  const wordCount = words.length;
  
  const lowerAnswer = answer.toLowerCase();
  let fillerCount = 0;
  FILLER_WORDS.forEach(fw => {
    const matches = lowerAnswer.match(new RegExp(`\\b${fw}\\b`, 'g'));
    if (matches) fillerCount += matches.length;
  });

  const wordsPerMinute = 150;
  const duration = Math.round((wordCount / wordsPerMinute) * 60);

  const hasSituation = /when|context|situation|working on|was|were/i.test(answer);
  const hasTask = /task|goal|objective|need to|had to|responsible/i.test(answer);
  const hasAction = /i did|i built|i implemented|i resolved|i created|i led|action/i.test(answer);
  const hasResult = /result|outcome|achieved|improved|reduced|increased|impact|learned/i.test(answer);

  const starAnalysis = { situation: hasSituation, task: hasTask, action: hasAction, result: hasResult };
  const starScore = Object.values(starAnalysis).filter(Boolean).length * 25;

  const keywordCoverage = questionKeywords.length > 0
    ? questionKeywords.filter(k => lowerAnswer.includes(k.toLowerCase())).length / questionKeywords.length
    : 0.5;

  const fillerPenalty = Math.min(30, fillerCount * 2);
  const lengthScore = wordCount < 50 ? 50 : wordCount > 400 ? 70 : 90;
  
  const score = Math.round(
    starScore * 0.35 +
    keywordCoverage * 100 * 0.25 +
    lengthScore * 0.2 +
    (100 - fillerPenalty) * 0.2
  );

  const feedback: string[] = [];
  if (!hasSituation) feedback.push('Add context: describe the situation or background');
  if (!hasTask) feedback.push('Clarify your specific role or objective');
  if (!hasAction) feedback.push('Describe the specific actions you took');
  if (!hasResult) feedback.push('Always end with a measurable result or outcome');
  if (fillerCount > 5) feedback.push(`Reduce filler words (${fillerCount} detected) — practice pausing instead`);
  if (wordCount < 60) feedback.push('Answer is too brief. Aim for 100-200 words.');
  if (wordCount > 400) feedback.push('Answer may be too long — try to be more concise');

  return {
    score: Math.min(100, Math.max(0, score)),
    fillerWords: fillerCount,
    wordCount,
    duration,
    starAnalysis,
    feedback,
  };
}
