"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Building2, X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Search } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
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
    if (!employerProfileId) { setError(t("reviews.errSelectCompany")); return; }
    if (rating === 0) { setError(t("reviews.errSelectRating")); return; }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employerProfileId, rating, title, body, isAnonymous }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error ?? t("reviews.errSubmit")); return; }
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{t("reviews.modalTitle")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("reviews.companyLabel")}</label>
            <select
              className="input w-full"
              value={employerProfileId}
              onChange={(e) => setEmployerProfileId(e.target.value)}
              required
            >
              <option value="">{t("reviews.selectCompany")}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}{c.industry ? ` · ${c.industry}` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("reviews.overallRating")}</label>
            <Stars rating={rating} interactive onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {[
                  "",
                  t("reviews.ratingPoor"),
                  t("reviews.ratingFair"),
                  t("reviews.ratingGood"),
                  t("reviews.ratingVeryGood"),
                  t("reviews.ratingExcellent"),
                ][rating]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("reviews.reviewTitle")}</label>
            <input
              className="input w-full"
              placeholder={t("reviews.titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("reviews.reviewBody")}</label>
            <textarea
              className="input w-full resize-none"
              rows={5}
              placeholder={t("reviews.bodyPlaceholder")}
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
            <span className="text-sm text-gray-600">{t("reviews.postAnonymously")}</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {t("reviews.submitReview")}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>{t("common.cancel")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { t } = useI18n();
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
        <span>{review.isAnonymous ? t("reviews.anonymousReviewer") : review.reviewerEmail}</span>
        <span>·</span>
        <span>{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const isJobSeeker = session?.user?.role === "JOB_SEEKER";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/employers/public")
      .then((r) => r.json())
      .then((data) => { setCompanies(data); setCompaniesLoading(false); });
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (selectedCompanyId) params.set("employerProfileId", selectedCompanyId);
    const res = await fetch(`/api/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page, selectedCompanyId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => { setPage(1); }, [selectedCompanyId]);

  async function openWriteReview() {
    if (!session) { router.push("/login?callbackUrl=/reviews"); return; }
    if (!isJobSeeker) return;
    setShowModal(true);
  }

  function handleSubmitted() {
    setShowModal(false);
    setSubmitted(true);
    fetchReviews();
    setTimeout(() => setSubmitted(false), 5000);
  }

  const filteredCompanies = search.trim()
    ? companies.filter((c) => c.companyName.toLowerCase().includes(search.toLowerCase()))
    : companies;

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const CompanySidebar = (
    <div className="card p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">{t("reviews.browseByCompany")}</h2>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-8 w-full text-sm py-1.5"
          placeholder={t("reviews.searchCompanies")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button
        onClick={() => setSelectedCompanyId(null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          !selectedCompanyId
            ? "bg-brand-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {t("reviews.allCompanies")}
        <span className="ml-1.5 text-xs opacity-70">({total})</span>
      </button>

      <div className="space-y-0.5 max-h-52 md:max-h-[60vh] overflow-y-auto">
        {companiesLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={18} className="animate-spin text-gray-300" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <p className="text-xs text-gray-400 px-3 py-2">{t("reviews.noCompaniesFound")}</p>
        ) : (
          filteredCompanies.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCompanyId(c.id === selectedCompanyId ? null : c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCompanyId === c.id
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <p className="text-sm truncate">{c.companyName}</p>
              {c.industry && <p className="text-xs text-gray-400 truncate">{c.industry}</p>}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <Navbar variant="marketing" userRole={session?.user?.role ?? null} />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-forest text-white py-14 px-4">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {t("reviews.badge")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">{t("reviews.heroHeading")}</h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              {t("reviews.heroDesc")}
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                className="bg-white text-forest hover:bg-gray-100 font-semibold"
                onClick={openWriteReview}
              >
                {t("reviews.writeReview")}
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Success toast */}
          {submitted && (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4 text-green-800 text-sm font-medium mb-6">
              <CheckCircle2 size={18} className="shrink-0 text-green-500" />
              {t("reviews.submitted")}
            </div>
          )}

          {/* Mobile sidebar (stacked above reviews) */}
          <div className="md:hidden mb-6">
            {CompanySidebar}
          </div>

          <div className="flex gap-6 items-start">
            {/* Desktop sidebar */}
            <aside className="w-64 shrink-0 hidden md:block sticky top-24">
              {CompanySidebar}
            </aside>

            {/* Reviews panel */}
            <div className="flex-1 space-y-4">
              {/* Active filter header */}
              <div className="flex items-center justify-between">
                <div>
                  {selectedCompany ? (
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900">{selectedCompany.companyName}</h2>
                      <button
                        onClick={() => setSelectedCompanyId(null)}
                        className="text-gray-400 hover:text-gray-600"
                        title={t("reviews.clearFilter")}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <h2 className="font-semibold text-gray-900">{t("reviews.allReviews")}</h2>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {loading
                      ? t("common.loading")
                      : `${total} ${total !== 1 ? t("reviews.reviews") : t("reviews.review")}${avgRating ? ` · ${avgRating} ${t("reviews.avgRating")}` : ""}`}
                  </p>
                </div>
                {avgRating && !loading && (
                  <Stars rating={Math.round(Number(avgRating))} />
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-gray-300" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="card p-12 text-center space-y-3">
                  <Star size={32} className="mx-auto text-gray-200" />
                  <p className="text-gray-500 font-medium">
                    {selectedCompany
                      ? `${t("reviews.noReviewsCompany")} ${selectedCompany.companyName}.`
                      : t("reviews.noReviewsYet")}
                  </p>
                  <Button variant="secondary" onClick={openWriteReview}>
                    {selectedCompany
                      ? `${t("reviews.reviewCompany")} ${selectedCompany.companyName}`
                      : t("reviews.writeFirst")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} /> {t("reviews.previous")}
                  </button>
                  <span className="text-sm text-gray-400">
                    {t("reviews.pageOf")} {page} {t("reviews.of")} {pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"
                  >
                    {t("reviews.next")} <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
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
