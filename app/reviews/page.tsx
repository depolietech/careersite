"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Building2, X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Search } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";

type Company = { id: string; companyName: string; industry: string | null };

type Review = {
  id: string;
  rating: number;
  title: string;
  body: string;
  isAnonymous: boolean;
  createdAt: string;
  reviewerEmail: string | null;
  company: { id: string; companyName: string; industry: string | null };
};

function Stars({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
        >
          <Star
            size={interactive ? 22 : 16}
            className={
              n <= (interactive ? hovered || rating : rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ companies, onClose, onSubmitted }: {
  companies: Company[];
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [employerProfileId, setEmployerProfileId] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!employerProfileId) { setError("Please select a company."); return; }
    if (rating === 0) { setError("Please select a star rating."); return; }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employerProfileId, rating, title, body, isAnonymous }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error ?? "Failed to submit review."); return; }
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Write a Company Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
            <select
              className="input w-full"
              value={employerProfileId}
              onChange={(e) => setEmployerProfileId(e.target.value)}
              required
            >
              <option value="">Select a company…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}{c.industry ? ` · ${c.industry}` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Overall Rating</label>
            <Stars rating={rating} interactive onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Title</label>
            <input
              className="input w-full"
              placeholder="Summarize your experience in a few words"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Review</label>
            <textarea
              className="input w-full resize-none"
              rows={5}
              placeholder="Share details about your experience applying or interviewing with this company…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={3000}
              required
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/3000</p>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-brand-600"
            />
            <span className="text-sm text-gray-600">Post anonymously</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit Review
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Building2 size={16} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.company.companyName}</p>
            {review.company.industry && (
              <p className="text-xs text-gray-400">{review.company.industry}</p>
            )}
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      <div>
        <p className="font-medium text-gray-800 text-sm">{review.title}</p>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400 pt-1 border-t border-gray-50">
        <span>{review.isAnonymous ? "Anonymous reviewer" : review.reviewerEmail}</span>
        <span>·</span>
        <span>{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isJobSeeker = session?.user?.role === "JOB_SEEKER";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    const res = await fetch(`/api/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function openWriteReview() {
    if (!session) { router.push("/login?callbackUrl=/reviews"); return; }
    if (!isJobSeeker) return;
    if (companies.length === 0) {
      const res = await fetch("/api/employers/public");
      setCompanies(await res.json());
    }
    setShowModal(true);
  }

  function handleSubmitted() {
    setShowModal(false);
    setSubmitted(true);
    fetchReviews();
    setTimeout(() => setSubmitted(false), 5000);
  }

  const filtered = search.trim()
    ? reviews.filter((r) => r.company.companyName.toLowerCase().includes(search.toLowerCase()))
    : reviews;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <Navbar variant="marketing" userRole={session?.user?.role ?? null} />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-forest text-white py-16 px-4">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              Community Reviews
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Company Reviews by Job Seekers</h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Real experiences from real candidates — helping you find trustworthy employers and avoid scams.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="bg-white text-forest hover:bg-gray-100 font-semibold"
                onClick={openWriteReview}
              >
                Write a Review
              </Button>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        {total > 0 && (
          <div className="bg-white border-b border-gray-100 py-4 px-4">
            <div className="mx-auto max-w-3xl flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-600"><strong className="text-gray-900">{total}</strong> review{total !== 1 ? "s" : ""} from the community</span>
              {avgRating && (
                <div className="flex items-center gap-2">
                  <Stars rating={Math.round(Number(avgRating))} />
                  <span className="font-semibold text-gray-900">{avgRating}</span>
                  <span className="text-gray-400">avg</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
          {/* Success toast */}
          {submitted && (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4 text-green-800 text-sm font-medium">
              <CheckCircle2 size={18} className="shrink-0 text-green-500" />
              Your review has been submitted — thank you!
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 w-full"
              placeholder="Search by company name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Reviews list */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center space-y-3">
              <Star size={32} className="mx-auto text-gray-200" />
              <p className="text-gray-500 font-medium">
                {search ? "No reviews match your search." : "No reviews yet — be the first to share your experience!"}
              </p>
              {!search && (
                <Button variant="secondary" onClick={openWriteReview}>Write the first review</Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && !search && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-gray-400">Page {page} of {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showModal && (
        <ReviewModal
          companies={companies}
          onClose={() => setShowModal(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </>
  );
}
