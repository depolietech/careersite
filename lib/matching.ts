// Rule-based internal matching engine
// Weights are fixed constants — no AI, no external calls.

// ─── Skill synonym map ────────────────────────────────────────────────────────
// Maps common aliases → canonical lowercase name for fair comparison.
const SYNONYMS: Record<string, string> = {
  // JavaScript ecosystem
  js: "javascript", es6: "javascript", ecmascript: "javascript",
  "react.js": "react", reactjs: "react",
  "vue.js": "vue", vuejs: "vue",
  angularjs: "angular",
  "next.js": "next.js", nextjs: "next.js",
  "node.js": "node.js", nodejs: "node.js", node: "node.js",
  "express.js": "express.js", expressjs: "express.js", express: "express.js",
  ts: "typescript",
  // Languages
  golang: "go", python3: "python", py: "python",
  csharp: "c#", "c sharp": "c#",
  // .NET
  dotnet: ".net", ".net core": ".net", "asp.net": ".net",
  // Databases
  postgres: "postgresql", mongo: "mongodb",
  "elastic search": "elasticsearch",
  // Cloud
  "amazon web services": "aws",
  gcp: "google cloud", "google cloud platform": "google cloud",
  "microsoft azure": "azure",
  // DevOps
  k8s: "kubernetes", cicd: "ci/cd", "ci-cd": "ci/cd", "dev ops": "devops",
  // Agile / PM
  scrum: "agile", "agile methodology": "agile", "agile/scrum": "agile",
  pmp: "project management", "project manager": "project management",
  // ML / AI
  ml: "machine learning", "natural language processing": "nlp",
  // APIs
  "rest api": "rest", restful: "rest", "rest apis": "rest", "restful api": "rest",
  "graphql api": "graphql",
  // CSS
  tailwind: "tailwind css", tailwindcss: "tailwind css",
  // Design
  ux: "ux design", "ui/ux": "ux design", "product design": "ux design",
  // Mobile
  "react-native": "react native",
  // Misc
  "excel vba": "vba",
  "version control": "git",
};

export function normalizeSkill(s: string): string {
  const lower = s.toLowerCase().trim();
  return SYNONYMS[lower] ?? lower;
}

function parseArr(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch { return []; }
}

// ─── Shared sub-scorers ───────────────────────────────────────────────────────

function matchSkills(jobSkills: string[], seekerSkills: string[]) {
  if (jobSkills.length === 0) return { score: 100, matched: [] as string[], gaps: [] as string[] };
  const normJob    = jobSkills.map(normalizeSkill);
  const normSeeker = new Set(seekerSkills.map(normalizeSkill));
  const matched: string[] = [];
  const gaps: string[]    = [];
  normJob.forEach((norm, i) => {
    (normSeeker.has(norm) ? matched : gaps).push(jobSkills[i]);
  });
  return { score: Math.round((matched.length / normJob.length) * 100), matched, gaps };
}

function scoreExperience(required: number | null, actual: number | null): number {
  if (!required) return 100;
  if (actual === null || actual === undefined) return 30;
  if (actual >= required) return 100;
  const deficit = required - actual;
  if (deficit <= 1) return 80;
  if (deficit <= 2) return 60;
  if (deficit <= 4) return 40;
  return 20;
}

function scoreCertifications(
  required: string | null,
  certs: { name: string; verificationLevel: string }[],
  verifiedBonus = false
): number {
  if (!required?.trim()) return 100;
  const reqList = required.split(/[,;]/).map((c) => normalizeSkill(c.trim())).filter(Boolean);
  if (reqList.length === 0) return 100;
  const seekerNorm = new Set(certs.map((c) => normalizeSkill(c.name)));
  const matched = reqList.filter((r) => seekerNorm.has(r)).length;
  const base = Math.round((matched / reqList.length) * 100);
  if (!verifiedBonus || certs.length === 0) return base;
  const verifiedRatio = certs.filter((c) => c.verificationLevel !== "SELF_REPORTED").length / certs.length;
  return Math.min(100, Math.round(base + verifiedRatio * 15));
}

function scoreLocation(
  jobType: string, jobLocation: string,
  seekerJobType: string | null, seekerLocation: string | null
): number {
  if (jobType === "remote") return 100;
  if (seekerJobType === "remote") return 30;
  if (!seekerLocation) return 50;
  const jl = jobLocation.toLowerCase();
  const sl = seekerLocation.toLowerCase();
  if (jl.includes(sl) || sl.includes(jl)) return 100;
  const jParts = jl.split(",").map((p) => p.trim());
  const sParts = sl.split(",").map((p) => p.trim());
  if (jParts.some((jp) => sParts.some((sp) => jp.includes(sp) || sp.includes(jp)))) return 80;
  return 40;
}

function scoreRoleMatch(
  jobTitle: string,
  jobSkillsRaw: string,
  workExperiences: { title: string; skills: string }[]
): number {
  if (workExperiences.length === 0) return 0;
  const normTitle  = normalizeSkill(jobTitle);
  const jobNormSet = new Set(parseArr(jobSkillsRaw).map(normalizeSkill));
  let best = 0;
  for (const exp of workExperiences) {
    let sim = 0;
    const expTitle = normalizeSkill(exp.title);
    if (expTitle === normTitle)                                          sim += 60;
    else if (expTitle.includes(normTitle) || normTitle.includes(expTitle)) sim += 35;
    const expSet  = new Set(parseArr(exp.skills).map(normalizeSkill));
    const overlap = [...expSet].filter((s) => jobNormSet.has(s)).length;
    sim += Math.round((overlap / Math.max(expSet.size, 1)) * 40);
    best = Math.max(best, Math.min(100, sim));
  }
  return best;
}

// ─── Skill → Certification recommendations ────────────────────────────────────
const SKILL_CERTS: Record<string, string[]> = {
  "aws":              ["AWS Solutions Architect", "AWS Certified Developer", "AWS Cloud Practitioner"],
  "google cloud":     ["Google Cloud Professional Architect", "Google Cloud Associate Engineer"],
  "azure":            ["Azure Administrator Associate", "Azure Solutions Architect"],
  "kubernetes":       ["Certified Kubernetes Administrator", "Certified Kubernetes Application Developer"],
  "terraform":        ["HashiCorp Terraform Associate"],
  "machine learning": ["AWS Machine Learning Specialty", "Google Professional ML Engineer", "Databricks ML Professional"],
  "python":           ["Google Professional Data Engineer", "Databricks Certified Data Engineer"],
  "java":             ["Oracle Certified Professional Java"],
  "project management": ["PMP", "PRINCE2"],
  "agile":            ["Certified ScrumMaster", "PMI-ACP", "SAFe Practitioner"],
  "scrum":            ["Certified ScrumMaster", "SAFe Scrum Master"],
  "security":         ["CompTIA Security+", "CISSP", "CEH"],
  "sql":              ["Microsoft SQL Server Certification", "Oracle Database Certification"],
  "data analysis":    ["Google Data Analytics Certificate", "Tableau Desktop Specialist"],
  "tableau":          ["Tableau Desktop Specialist"],
  "power bi":         ["Microsoft Power BI Data Analyst"],
  "salesforce":       ["Salesforce Administrator", "Salesforce Platform Developer"],
  "network security": ["CompTIA Network+", "CISSP", "CCNA"],
  "linux":            ["CompTIA Linux+", "Red Hat Certified Engineer"],
  "docker":           ["Docker Certified Associate"],
  "devops":           ["AWS DevOps Engineer Professional", "Google Cloud DevOps Engineer"],
  "react":            ["Meta Front-End Developer Certificate"],
  "ux design":        ["Google UX Design Certificate", "Nielsen Norman UX Certification"],
  "accounting":       ["CPA", "CGA"],
  "finance":          ["CFA", "CPA"],
};

function getCertRecommendations(skillGaps: string[]): string[] {
  const recommended = new Set<string>();
  for (const gap of skillGaps) {
    const norm = normalizeSkill(gap);
    for (const [key, certs] of Object.entries(SKILL_CERTS)) {
      if (norm.includes(key) || key.includes(norm)) {
        certs.forEach((c) => recommended.add(c));
        break;
      }
    }
  }
  return [...recommended].slice(0, 4);
}

// ─── Profile completeness (0–100) ────────────────────────────────────────────

export function calcProfileCompleteness(
  profile: {
    firstName: string; lastName: string; headline: string | null;
    summary: string | null; skills: string;
    yearsExperience: number | null; jobType: string | null; location: string | null;
    workExperiences: unknown[]; educations: unknown[];
  },
  resumeCount: number
): number {
  let score = 0;
  const skills = parseArr(profile.skills);
  if (profile.firstName && profile.lastName) score += 10;
  if (profile.headline)                      score += 10;
  if (profile.summary)                       score += 10;
  if (skills.length > 0)                     score += 15;
  if ((profile.yearsExperience ?? 0) > 0)    score += 10;
  if (profile.jobType)                       score +=  5;
  if (profile.location)                      score +=  5;
  if (profile.workExperiences.length > 0)    score += 20;
  if (profile.educations.length > 0)         score += 10;
  if (resumeCount > 0)                       score +=  5;
  return score;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchBreakdown {
  skills:         number;
  experience:     number;
  certifications: number;
  language:       number;
  location:       number;
  completeness:   number;
}

export interface MatchResult {
  score:               number;
  breakdown:           MatchBreakdown;
  matchedSkills:       string[];
  skillGaps:           string[];
  certRecommendations: string[];
}

export interface RecruiterMatchBreakdown {
  skills:         number;
  experience:     number;
  certifications: number;
  roleMatch:      number;
  language:       number;
}

export interface RecruiterMatchResult {
  score:         number;
  breakdown:     RecruiterMatchBreakdown;
  matchedSkills: string[];
  skillGaps:     string[];
}

// ─── Job Seeker scoring ───────────────────────────────────────────────────────
// Weights: skills 40 | experience 20 | certifications 15 | language 10 | location 10 | completeness 5

export type JobInput = {
  skills: string;
  experience: number | null;
  certificateRequired: string | null;
  jobType: string;
  location: string;
};

export type SeekerInput = {
  skills: string;
  yearsExperience: number | null;
  jobType: string | null;
  location: string | null;
  workExperiences: { skills: string }[];
  certifications: { name: string; verificationLevel: string }[];
  firstName: string; lastName: string;
  headline: string | null; summary: string | null;
  educations: unknown[];
};

export function scoreJobForSeeker(
  job: JobInput,
  profile: SeekerInput,
  resumeCount: number
): MatchResult {
  const allSeekerSkills = [
    ...parseArr(profile.skills),
    ...profile.workExperiences.flatMap((w) => parseArr(w.skills)),
  ];
  const jobSkills = parseArr(job.skills);

  const { score: skillScore, matched, gaps } = matchSkills(jobSkills, allSeekerSkills);
  const expScore  = scoreExperience(job.experience, profile.yearsExperience);
  const certScore = scoreCertifications(job.certificateRequired, profile.certifications);
  const locScore  = scoreLocation(job.jobType, job.location, profile.jobType, profile.location);
  const compScore = calcProfileCompleteness(profile, resumeCount);

  const breakdown: MatchBreakdown = {
    skills:         skillScore,
    experience:     expScore,
    certifications: certScore,
    language:       100, // no language field on Job yet
    location:       locScore,
    completeness:   compScore,
  };

  const score = Math.round(
    skillScore * 0.40 +
    expScore   * 0.20 +
    certScore  * 0.15 +
    100        * 0.10 + // language
    locScore   * 0.10 +
    compScore  * 0.05
  );

  return { score, breakdown, matchedSkills: matched, skillGaps: gaps, certRecommendations: getCertRecommendations(gaps) };
}

// ─── Recruiter scoring ────────────────────────────────────────────────────────
// Weights: skills 45 | experience 20 | verified certs 15 | role match 10 | language 5 | prefs 5

export type RecruiterJobInput = {
  title: string;
  skills: string;
  experience: number | null;
  certificateRequired: string | null;
  jobType: string;
  location: string;
};

export type RecruiterSeekerInput = {
  skills: string;
  yearsExperience: number | null;
  jobType: string | null;
  location: string | null;
  workExperiences: { title: string; skills: string }[];
  certifications: { name: string; verificationLevel: string }[];
};

export function scoreSeekerForJob(
  job: RecruiterJobInput,
  profile: RecruiterSeekerInput
): RecruiterMatchResult {
  const allSeekerSkills = [
    ...parseArr(profile.skills),
    ...profile.workExperiences.flatMap((w) => parseArr(w.skills)),
  ];
  const jobSkills = parseArr(job.skills);

  const { score: skillScore, matched, gaps } = matchSkills(jobSkills, allSeekerSkills);
  const expScore  = scoreExperience(job.experience, profile.yearsExperience);
  const certScore = scoreCertifications(job.certificateRequired, profile.certifications, true);
  const roleScore = scoreRoleMatch(job.title, job.skills, profile.workExperiences);

  const breakdown: RecruiterMatchBreakdown = {
    skills:         skillScore,
    experience:     expScore,
    certifications: certScore,
    roleMatch:      roleScore,
    language:       100, // no language field on Job yet
  };

  const score = Math.round(
    skillScore * 0.45 +
    expScore   * 0.20 +
    certScore  * 0.15 +
    roleScore  * 0.10 +
    100        * 0.05 + // language
    100        * 0.05   // recruiter preferences — full score until model exists
  );

  return { score, breakdown, matchedSkills: matched, skillGaps: gaps };
}
