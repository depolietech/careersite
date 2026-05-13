"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  employerProfileId: string;
  companyName: string;
}

const CATEGORIES = [
  { key: "communication",   label: "Communication" },
  { key: "professionalism", label: "Professionalism" },
  { key: "transparency",    label: "Transparency" },
  { key: "fairness",        label: "Fair Hiring" },
] as const;

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <Star
            size={20}
            className={`transition-colors ${
              n <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function RecruiterReviewForm({ employerProfileId, companyName }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [overall, setOverall] = useState(0);
  const [ratings, setRatings] = useState({ communication: 0, professionalism: 0, transparency: 0, fairness: 0 });
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overall === 0) { setError("Please provide an overall rating."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recruiter-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerProfileId,
          rating:          overall,
          communication:   ratings.communication   || overall,
          professionalism: ratings.professionalism || overall,
          transparency:    ratings.transparency    || overall,
          fairness:        ratings.fairness        || overall,
          comment:         comment.trim() || null,
          isAnonymous,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit review"); return; }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        Thank you for your review! Your feedback helps keep hiring fair and transparent.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
      >
        <Star size={14} /> Rate this recruiter
      </button>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Rate your experience with {companyName}</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Overall Rating <span className="text-red-400">*</span></label>
          <StarRating value={overall} onChange={setOverall} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">{label}</label>
              <StarRating value={ratings[key]} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Comments <span className="text-gray-400">(optional)</span></label>
          <textarea
            className="input w-full resize-none text-sm"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this recruiter..."
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-gray-300 accent-brand-500 h-4 w-4"
          />
          Submit anonymously
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">{error}</div>
        )}

        <div className="flex gap-2">
          <Button type="submit" size="sm" loading={loading} disabled={overall === 0}>
            Submit Review
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
