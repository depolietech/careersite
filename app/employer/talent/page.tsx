"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search, MapPin, Clock, Briefcase, GraduationCap, Award,
  ChevronDown, ChevronUp, EyeOff, Loader2, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WorkExp = {
  id: string; title: string; roleCategory: string | null;
  durationYears: number | null; current: boolean;
  description: string | null; skills: string[];
};
type Education = { id: string; degree: string; field: string | null; durationYears: number | null };
type Cert = { id: string; name: string; issuer: string; dateObtained: string | null };

type Talent = {
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
  workExperiences: WorkExp[];
  educations: Education[];
  certifications: Cert[];
};

function TalentCard({ talent }: { talent: Talent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
              <EyeOff size={18} className="text-brand-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{talent.candidateCode}</p>
              {talent.headline && <p className="text-sm text-gray-600 mt-0.5">{talent.headline}</p>}
            </div>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="btn-ghost p-2 rounded-xl text-gray-400"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
          {talent.yearsExperience != null && (
            <span className="flex items-center gap-1"><Briefcase size={12} />{talent.yearsExperience} yrs exp</span>
          )}
          {talent.location && (
            <span className="flex items-center gap-1"><MapPin size={12} />{talent.location}</span>
          )}
          {talent.jobType && (
            <span className="flex items-center gap-1"><Clock size={12} />{talent.jobType}</span>
          )}
          {talent.salaryMin != null && (
            <span>${(talent.salaryMin / 1000).toFixed(0)}k–${((talent.salaryMax ?? talent.salaryMin) / 1000).toFixed(0)}k expected</span>
          )}
        </div>

        {talent.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {talent.skills.map((s) => (
              <span key={s} className="badge bg-brand-50 text-brand-700 text-sm">{s}</span>
            ))}
          </div>
        )}

        {talent.summary && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{talent.summary}</p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-5">
          {talent.workExperiences.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Work Experience</p>
              <div className="space-y-3">
                {talent.workExperiences.map((w) => (
                  <div key={w.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">{w.title}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                        <EyeOff size={11} /> Company hidden
                      </div>
                    </div>
                    {w.roleCategory && <p className="text-xs text-gray-500">{w.roleCategory}</p>}
                    {w.durationYears != null && (
                      <p className="text-xs text-gray-400">{w.durationYears} yr{w.durationYears !== 1 ? "s" : ""}{w.current ? " · Current" : ""}</p>
                    )}
                    {w.description && <p className="text-sm text-gray-600">{w.description}</p>}
                    {w.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {w.skills.map((s) => <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {talent.educations.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                <GraduationCap size={12} /> Education
              </p>
              <div className="space-y-1.5">
                {talent.educations.map((e) => (
                  <div key={e.id} className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{e.degree}{e.field ? ` — ${e.field}` : ""}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                      <EyeOff size={11} /> School hidden
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {talent.certifications.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                <Award size={12} /> Certifications
              </p>
              <div className="space-y-1">
                {talent.certifications.map((c) => (
                  <div key={c.id} className="text-sm text-gray-700">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-500"> · {c.issuer}</span>
                    {c.dateObtained && <span className="text-gray-400"> · {c.dateObtained}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-brand-50 border border-brand-100 p-3 text-xs text-brand-700 flex items-center gap-2">
            <EyeOff size={13} className="shrink-0" />
            Identity (name, contact, school, employer) revealed only when you schedule an interview.
          </div>
        </div>
      )}
    </div>
  );
}

export default function TalentPage() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minExpFilter, setMinExpFilter] = useState("");

  const fetchTalent = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (skillFilter)    params.set("skill",    skillFilter);
    if (locationFilter) params.set("location", locationFilter);
    if (minExpFilter)   params.set("minExp",   minExpFilter);
    const res = await fetch(`/api/talent?${params}`);
    const data = await res.json();
    setTalents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [skillFilter, locationFilter, minExpFilter]);

  useEffect(() => { fetchTalent(); }, [fetchTalent]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
        <p className="text-gray-500 mt-1">Browse anonymous candidate profiles. Identities are revealed only after scheduling an interview.</p>
      </div>

      <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800 flex items-center gap-3">
        <EyeOff size={16} className="text-brand-600 shrink-0" />
        All profiles are anonymised — names, photos, school names, and company names are hidden until an interview is scheduled.
      </div>

      {/* Filters */}
      <div className="card p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Filter candidates</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Skill"
            placeholder="e.g. React"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
          <Input
            label="Location"
            placeholder="e.g. Ontario or Toronto"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <Input
            label="Min. experience (yrs)"
            type="number"
            placeholder="3"
            value={minExpFilter}
            onChange={(e) => setMinExpFilter(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={fetchTalent}>
          <Search size={14} /> Search
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : talents.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900">No candidates found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters or check back later as more candidates join.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{talents.length} candidate{talents.length !== 1 ? "s" : ""} found</p>
          {talents.map((t) => <TalentCard key={t.id} talent={t} />)}
        </div>
      )}
    </div>
  );
}
