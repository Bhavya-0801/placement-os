import type { UserProfile, RoleScore, RoleProfile } from './types';
import { DEMO_ROLE_PROFILES } from './demo-data';

const SKILL_LEVEL_SCORES: Record<string, number> = {
  beginner: 30,
  intermediate: 60,
  advanced: 85,
  expert: 100,
};

export function calculateRoleScore(profile: UserProfile, role: RoleProfile): RoleScore {
  const userSkillNames = profile.skills.map(s => s.name.toLowerCase());
  const userSkillMap = new Map(profile.skills.map(s => [s.name.toLowerCase(), s]));

  // Skills score
  let skillScore = 0;
  let totalWeight = 0;
  const missingRequired: string[] = [];
  const strongSkills: string[] = [];

  for (const req of role.requiredSkills) {
    totalWeight += req.weight;
    const userSkill = userSkillMap.get(req.skill.toLowerCase());
    if (userSkill) {
      const levelScore = SKILL_LEVEL_SCORES[userSkill.level] || 0;
      skillScore += (levelScore / 100) * req.weight;
      if (levelScore >= 70) strongSkills.push(req.skill);
    } else {
      if (req.required) missingRequired.push(req.skill);
    }
  }
  const normalizedSkillScore = totalWeight > 0 ? (skillScore / totalWeight) * 100 : 50;

  // CGPA score
  const cgpaScore = profile.cgpa >= role.minCGPA
    ? Math.min(100, 60 + (profile.cgpa - role.minCGPA) * 15)
    : Math.max(0, 40 - (role.minCGPA - profile.cgpa) * 20);

  // DSA score
  const dsaScore = role.dsaRequired === 0 ? 80 :
    Math.min(100, (profile.dsaSolved / role.dsaRequired) * 100);

  // Projects score
  const projectScore = Math.min(100, (profile.projects / role.projectsRequired) * 80 + (profile.openSourceContributions > 0 ? 20 : 0));

  // Experience bonus
  const experienceScore = role.internshipBonus
    ? Math.min(100, profile.internships * 35 + 30)
    : 70;

  // Communication
  const commScore = profile.communicationRating * 10;

  // Composite
  const breakdown = [
    { category: 'Technical Skills', score: Math.round(normalizedSkillScore), weight: 35 },
    { category: 'DSA', score: Math.round(dsaScore), weight: 20 },
    { category: 'Projects', score: Math.round(projectScore), weight: 20 },
    { category: 'CGPA', score: Math.round(cgpaScore), weight: 10 },
    { category: 'Experience', score: Math.round(experienceScore), weight: 10 },
    { category: 'Communication', score: Math.round(commScore), weight: 5 },
  ];

  const totalScore = breakdown.reduce((sum, b) => sum + (b.score * b.weight) / 100, 0);

  const recommendations: string[] = [];
  if (missingRequired.length > 0) {
    recommendations.push(`Learn ${missingRequired[0]} — it's required for this role`);
  }
  if (profile.dsaSolved < role.dsaRequired) {
    recommendations.push(`Solve ${role.dsaRequired - profile.dsaSolved} more DSA problems to meet the threshold`);
  }
  if (profile.internships === 0 && role.internshipBonus) {
    recommendations.push('Add an internship or relevant project experience');
  }
  if (role.systemDesignRequired && !userSkillNames.includes('system design')) {
    recommendations.push('Study System Design fundamentals — required for this role');
  }
  const missingNiceToHave = role.niceToHave.filter(s => !userSkillNames.includes(s.toLowerCase()));
  if (missingNiceToHave.length > 0) {
    recommendations.push(`Nice to have: ${missingNiceToHave.slice(0, 2).join(', ')}`);
  }

  return {
    roleId: role.id,
    roleName: role.title,
    score: Math.round(Math.min(100, totalScore)),
    baseScore: Math.round(Math.min(100, totalScore)),
    breakdown,
    missingSkills: missingRequired,
    strongSkills,
    recommendations,
  };
}

export function calculateAllRoleScores(profile: UserProfile): RoleScore[] {
  return DEMO_ROLE_PROFILES
    .map(role => calculateRoleScore(profile, role))
    .sort((a, b) => b.score - a.score);
}

export function simulateImprovement(
  profile: UserProfile,
  modification: { type: string; value: string | number },
  role: RoleProfile
): number {
  const modifiedProfile = { ...profile, skills: [...profile.skills] };

  switch (modification.type) {
    case 'skill': {
      const existing = modifiedProfile.skills.findIndex(s => s.name.toLowerCase() === String(modification.value).toLowerCase());
      if (existing >= 0) {
        const skills = [...modifiedProfile.skills];
        skills[existing] = { ...skills[existing], level: 'intermediate' };
        modifiedProfile.skills = skills;
      } else {
        modifiedProfile.skills = [...modifiedProfile.skills, {
          id: 'sim-' + Math.random(),
          name: String(modification.value),
          category: 'other',
          level: 'intermediate',
        }];
      }
      break;
    }
    case 'cgpa':
      modifiedProfile.cgpa = Number(modification.value);
      break;
    case 'dsa':
      modifiedProfile.dsaSolved = Number(modification.value);
      break;
    case 'internship':
      modifiedProfile.internships = modifiedProfile.internships + 1;
      break;
    case 'project':
      modifiedProfile.projects = modifiedProfile.projects + 1;
      break;
    case 'certification':
      modifiedProfile.certifications = modifiedProfile.certifications + 1;
      break;
  }

  return calculateRoleScore(modifiedProfile, role).score;
}
