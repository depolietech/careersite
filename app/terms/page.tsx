import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Terms of Service — Bias-Free Careers" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: April 30, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of terms</h2>
          <p>By creating an account or using Bias-Free Careers (&quot;the platform&quot;, &quot;we&quot;, &quot;our&quot;), you agree to these Terms of Service. If you do not agree, do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
          <p>You must be at least 16 years old to use this platform. By using it, you confirm you meet this requirement. Employers must be authorized to post positions on behalf of their organization.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for keeping your credentials secure.</li>
            <li>You may not share your account with others.</li>
            <li>You must provide accurate information. Misrepresentation (fake job postings, false credentials) is grounds for account termination.</li>
            <li>You may delete your account at any time from your settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Job seeker obligations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You agree to provide accurate profile information.</li>
            <li>You understand that masked fields (name, company, dates, institutions) are only revealed to a specific employer when an interview is scheduled.</li>
            <li>You may apply to roles and withdraw applications at any time before a hiring decision is made.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Employer obligations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may only post genuine, legal job opportunities.</li>
            <li>You may not use the platform to discriminate based on protected characteristics.</li>
            <li>Scheduling an interview reveals a candidate&apos;s masked information. This must only be done when you genuinely intend to interview the candidate.</li>
            <li>Repeatedly scheduling and cancelling interviews without genuine intent constitutes abuse and will result in trust score penalties and potential account suspension.</li>
            <li>Revealed candidate data must be treated as confidential and used solely for the hiring process.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited conduct</h2>
          <p>You must not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post fraudulent job listings</li>
            <li>Harvest or scrape candidate data</li>
            <li>Attempt to circumvent the anonymization system</li>
            <li>Harass, discriminate against, or harm other users</li>
            <li>Use the platform for any illegal purpose</li>
            <li>Introduce malware or interfere with platform operations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual property</h2>
          <p>The platform, its design, and its code are owned by Bias-Free Careers. Your content (profile data, job postings) remains yours. You grant us a limited license to display and process it to operate the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimer and limitation of liability</h2>
          <p>The platform is provided &quot;as is&quot; without warranties of any kind. We are not responsible for hiring outcomes, employment decisions, or the conduct of employers or job seekers. To the maximum extent permitted by law, our liability is limited to the amount you paid us in the past 12 months.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms, abuse the interview system, or engage in discriminatory conduct. You may terminate your own account at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Governing law</h2>
          <p>These terms are governed by the laws of Ontario, Canada. Disputes shall be resolved in the courts of Ontario.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes</h2>
          <p>We may update these terms. Continued use of the platform after changes are posted constitutes acceptance. We will notify users of material changes via email.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
          <p>Questions about these terms? Email <strong>legal@biasfree.careers</strong> or see our <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.</p>
        </section>
      </div>
    </div>
  );
}
