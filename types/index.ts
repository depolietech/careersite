export type UserRole = "JOB_SEEKER" | "EMPLOYER";

export type RecruiterType = "COMPANY" | "AGENCY";

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "FORWARDED"
  | "INTERVIEW_SCHEDULED"
  | "REJECTED"
  | "OFFER_MADE"
  | "HIRED";

export type JobStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";

export interface MaskedProfile {
  id: string;
  candidateCode: string;
  headline: string | null;
  summary: string | null;
  skills: string[];
  yearsExperience: number | null;
  jobType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  workExperiences: MaskedWorkExperience[];
  educations: MaskedEducation[];
}

export interface MaskedWorkExperience {
  id: string;
  title: string;
  roleCategory: string | null;
  durationYears: number;         // always shown — computed from raw dates
  description: string | null;
  skills: string[];
  current: boolean;
  // Only present after reveal
  company?: string;
  startDate?: string;
  endDate?: string | null;
}

export interface MaskedEducation {
  id: string;
  degree: string;
  field: string | null;
  durationYears: number;         // always shown — endYear minus startYear
  // Only present after reveal
  institution?: string;
  startYear?: number;
  endYear?: number | null;
}

export interface RevealedProfile extends MaskedProfile {
  firstName: string;
  lastName: string;
  phone: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  workExperiences: MaskedWorkExperience[];
  educations: MaskedEducation[];
}
