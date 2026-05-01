import type { MaskedProfile, RevealedProfile } from "@/types";

export function candidateCode(profileId: string): string {
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = (hash << 5) - hash + profileId.charCodeAt(i);
    hash |= 0;
  }
  return `C-${Math.abs(hash) % 90000 + 10000}`;
}

// Convert "YYYY-MM" dates to duration in years (1 decimal place).
function calcWorkDurationYears(
  startDate: string,
  endDate: string | null,
  current: boolean
): number {
  const [sy, sm = 1] = startDate.split("-").map(Number);
  const start = new Date(sy, sm - 1);
  const end =
    current || !endDate
      ? new Date()
      : (() => {
          const [ey, em = 1] = endDate.split("-").map(Number);
          return new Date(ey, em - 1);
        })();
  const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years * 10) / 10);
}

// Convert integer school years to duration in years.
function calcEducationDurationYears(startYear: number, endYear: number | null): number {
  return Math.max(0, (endYear ?? new Date().getFullYear()) - startYear);
}

export function maskProfile(profile: {
  id: string;
  headline: string | null;
  summary: string | null;
  skills: string;
  yearsExperience: number | null;
  jobType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  workExperiences: Array<{
    id: string;
    title: string;
    roleCategory: string | null;
    description: string | null;
    skills: string;
    current: boolean;
    // RAW fields — used only to compute duration, never passed through
    company: string;
    startDate: string;
    endDate: string | null;
    durationYears: number | null;
  }>;
  educations: Array<{
    id: string;
    degree: string;
    field: string | null;
    // RAW fields — used only to compute duration, never passed through
    startYear: number;
    endYear: number | null;
    durationYears: number | null;
  }>;
}): MaskedProfile {
  return {
    id: profile.id,
    candidateCode: candidateCode(profile.id),
    headline: profile.headline,
    summary: profile.summary,
    skills: safeParseJson(profile.skills),
    yearsExperience: profile.yearsExperience,
    jobType: profile.jobType,
    salaryMin: profile.salaryMin,
    salaryMax: profile.salaryMax,
    location: profile.location,
    workExperiences: profile.workExperiences.map((w) => ({
      id: w.id,
      title: w.title,
      roleCategory: w.roleCategory,
      description: w.description,
      skills: safeParseJson(w.skills),
      current: w.current,
      // Show computed duration — NOT raw dates or company
      durationYears:
        w.durationYears ?? calcWorkDurationYears(w.startDate, w.endDate, w.current),
    })),
    educations: profile.educations.map((e) => ({
      id: e.id,
      degree: e.degree,
      field: e.field,
      // Show computed duration — NOT raw years or institution
      durationYears: e.durationYears ?? calcEducationDurationYears(e.startYear, e.endYear),
    })),
  };
}

export function revealProfile(profile: {
  id: string;
  headline: string | null;
  summary: string | null;
  skills: string;
  yearsExperience: number | null;
  jobType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  workExperiences: Array<{
    id: string;
    title: string;
    roleCategory: string | null;
    company: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
    skills: string;
    current: boolean;
    durationYears: number | null;
  }>;
  educations: Array<{
    id: string;
    degree: string;
    field: string | null;
    institution: string;
    startYear: number;
    endYear: number | null;
    durationYears: number | null;
  }>;
}): RevealedProfile {
  return {
    id: profile.id,
    candidateCode: candidateCode(profile.id),
    headline: profile.headline,
    summary: profile.summary,
    skills: safeParseJson(profile.skills),
    yearsExperience: profile.yearsExperience,
    jobType: profile.jobType,
    salaryMin: profile.salaryMin,
    salaryMax: profile.salaryMax,
    location: profile.location,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    photoUrl: profile.photoUrl,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    workExperiences: profile.workExperiences.map((w) => ({
      id: w.id,
      title: w.title,
      roleCategory: w.roleCategory,
      company: w.company,
      startDate: w.startDate,
      endDate: w.endDate,
      description: w.description,
      skills: safeParseJson(w.skills),
      current: w.current,
      durationYears:
        w.durationYears ?? calcWorkDurationYears(w.startDate, w.endDate, w.current),
    })),
    educations: profile.educations.map((e) => ({
      id: e.id,
      degree: e.degree,
      field: e.field,
      institution: e.institution,
      startYear: e.startYear,
      endYear: e.endYear,
      durationYears: e.durationYears ?? calcEducationDurationYears(e.startYear, e.endYear),
    })),
  };
}

function safeParseJson(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
