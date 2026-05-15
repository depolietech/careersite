import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Terms of Service — Equalhires" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: May 15, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of terms</h2>
          <p>By creating an account or using Equalhires (&quot;the platform&quot;, &quot;we&quot;, &quot;our&quot;), you agree to these Terms of Service and our Privacy Policy. You must explicitly accept both documents during account creation. If you do not agree, do not use the platform.</p>
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
            <li>Job seeker accounts require email verification before full platform access is granted.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Employer / recruiter obligations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may only post genuine, legal job opportunities.</li>
            <li>You may not use the platform to discriminate based on protected characteristics including race, gender, age, religion, national origin, disability, or sexual orientation.</li>
            <li>Scheduling an interview reveals a candidate&apos;s masked information. This must only be done when you genuinely intend to interview the candidate.</li>
            <li>Repeatedly scheduling and cancelling interviews without genuine intent constitutes abuse and will result in trust score penalties and potential account suspension.</li>
            <li>Revealed candidate data must be treated as confidential and used solely for the hiring process.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Account approval and verification requirements</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Recruiter accounts require identity and company verification review before job posting privileges are granted.</li>
            <li>Verification requires submission of company name, business address, company website, and LinkedIn profile. The platform performs automated checks (website reachability, email domain match) and may perform manual review.</li>
            <li>Job postings are blocked until a recruiter account reaches <strong>Approved</strong> verification status.</li>
            <li>Job seeker accounts require email verification before full access is granted.</li>
            <li>We reserve the right to request additional verification at any time and to suspend accounts that cannot be verified.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Recruiter suspension policy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Interview cancellations:</strong> Recruiters who cancel 3 or more scheduled interviews within a 90-day period may have their account placed under review and job posting privileges suspended pending investigation.</li>
            <li><strong>Community reports:</strong> Job seekers may report recruiters for fraudulent, misleading, or abusive conduct. Accounts with multiple pending reports may be suspended while under review.</li>
            <li><strong>Trust score:</strong> Each recruiter has a trust score reflecting platform behaviour. A score below 40 will automatically restrict posting privileges. Scores decline with interview cancellations and validated reports.</li>
            <li><strong>Fraudulent listings:</strong> Any recruiter found posting fake or misleading job listings will have their account immediately suspended and may be permanently banned.</li>
            <li><strong>Appeals:</strong> Suspended accounts may contact <a href="mailto:info@equalhires.com" className="text-brand-600 hover:underline">info@equalhires.com</a> to request review. We aim to respond within 5 business days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Platform integrity and prohibited conduct</h2>
          <p>You must not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post fraudulent, fake, or misleading job listings</li>
            <li>Include discriminatory requirements or language in any job posting</li>
            <li>Impersonate another person, company, or recruiter</li>
            <li>Abuse the masked profile system to extract candidate identity before an interview is scheduled</li>
            <li>Harvest or scrape candidate data</li>
            <li>Attempt to circumvent the anonymization system</li>
            <li>Harass, discriminate against, or harm other users</li>
            <li>Use the platform for any illegal purpose</li>
            <li>Introduce malware or interfere with platform operations</li>
          </ul>
          <p className="mt-3">Violations of this section may result in immediate account suspension without notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Intellectual property</h2>
          <p>The platform, its design, and its code are owned by Equalhires. Your content (profile data, job postings) remains yours. You grant us a limited license to display and process it to operate the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Disclaimer and limitation of liability</h2>
          <p>The platform is provided &quot;as is&quot; without warranties of any kind. We are not responsible for hiring outcomes, employment decisions, or the conduct of employers or job seekers. To the maximum extent permitted by law, our liability is limited to the amount you paid us in the past 12 months.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms, abuse the interview system, engage in discriminatory conduct, or fail identity verification. You may terminate your own account at any time from your account settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing law</h2>
          <p>These terms are governed by the laws of Ontario, Canada. Disputes shall be resolved in the courts of Ontario.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">13. AI and automated decision systems</h2>
          <p>EqualHires may use AI-assisted and automated systems to analyze, rank, and recommend candidate profiles based on job-related qualifications, skills, and experience. Such systems are designed to support fair and bias-reduced hiring practices. AI-generated rankings and recommendations are advisory tools only and do not constitute hiring decisions.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">14. No employment guarantee</h2>
          <p>EqualHires does not guarantee interviews, employment opportunities, hiring outcomes, or candidate selection. The platform facilitates connections between job seekers and employers but has no control over, and accepts no responsibility for, the ultimate hiring decisions made by employers or recruiters.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Platform role disclaimer</h2>
          <p>EqualHires acts as a technology platform facilitating connections between recruiters and job seekers. We are not an employer, staffing agency, or recruitment firm. We are not responsible for hiring decisions made by employers or recruiters, the accuracy of job postings, or outcomes of the recruitment process.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Changes</h2>
          <p>We may update these terms. Continued use of the platform after changes are posted constitutes acceptance. We will notify users of material changes via email.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">17. Contact</h2>
          <p>Questions about these terms? Email <strong>info@equalhires.com</strong> or see our <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.</p>
        </section>

      </div>
    </div>
  );
}
