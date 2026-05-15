import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Job Seeker Agreement — EqualHires" };

export default function JobSeekerAgreementPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Seeker Agreement</h1>
      <p className="text-sm text-gray-400 mb-2">Effective Date: May 15, 2026</p>
      <p className="text-sm text-gray-500 mb-10">
        This Job Seeker Agreement (&quot;Agreement&quot;) governs the use of the EqualHires platform by candidates, job seekers,
        and users seeking employment opportunities (&quot;Job Seeker&quot;, &quot;you&quot;, or &quot;your&quot;). By creating an account or
        using EqualHires, you agree to comply with this Agreement and all applicable laws.
      </p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of terms</h2>
          <p>By creating an account or using the EqualHires platform, you confirm that you have read, understood, and agree to be bound by this Agreement and all related policies, including the <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>. If you do not agree to these terms, you must not use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Candidate profile processing</h2>
          <p>When you create a job seeker profile on EqualHires, your profile information may be:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Standardized and formatted to ensure consistency across candidate profiles</li>
            <li>Anonymized to remove or obscure identifying information during early recruitment stages</li>
            <li>Algorithmically processed to support fair hiring practices and improve matching quality</li>
            <li>Compared against job requirements to generate compatibility insights for recruiters</li>
          </ul>
          <p className="mt-3">Profile processing is designed to evaluate candidates on job-relevant skills and qualifications, not on demographic characteristics.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Identity masking and reveal</h2>
          <p>EqualHires may hide personal identifiers such as your name, gender indicators, educational institution, photograph, and other identifying information until a recruiter selects you for an interview or an approved reveal stage is reached.</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Masking is automatic and applied to all job seeker profiles viewed by recruiters prior to interview scheduling</li>
            <li>Your full identity is only revealed to a specific recruiter when an interview is mutually confirmed</li>
            <li>You may withdraw from a process at any time before the reveal to prevent identity disclosure</li>
            <li>Once revealed, your information is subject to the recruiter&apos;s confidentiality obligations under the Recruiter Agreement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. AI-assisted matching</h2>
          <p>EqualHires may use AI-assisted tools and automated systems to rank or recommend your profile to recruiters based on skills, qualifications, and job compatibility. You acknowledge that:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>AI matching systems are advisory tools and do not make hiring decisions</li>
            <li>Rankings and recommendations are based on information you provide in your profile</li>
            <li>The accuracy of AI-generated recommendations depends on the completeness and accuracy of your profile</li>
            <li>You can improve your match quality by keeping your profile up to date</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. User content ownership</h2>
          <p>You retain ownership of your resume, profile content, and any other materials you submit to EqualHires. By submitting content to the platform, you grant EqualHires a limited, non-exclusive, royalty-free license to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Process and display your profile to recruiters in accordance with the platform&apos;s anonymization rules</li>
            <li>Analyze your profile content to improve matching algorithms and platform performance</li>
            <li>Store and manage your data as described in our Privacy Policy and Data Retention Policy</li>
          </ul>
          <p className="mt-3">This license ends when you delete your account, subject to our data retention obligations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Accuracy of information</h2>
          <p>You agree to provide accurate, truthful, and current information in your profile and applications. You understand that:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Providing false, misleading, or fraudulent information may result in account suspension or termination</li>
            <li>Misrepresenting credentials, qualifications, or work experience is grounds for immediate removal</li>
            <li>You are responsible for keeping your profile information up to date</li>
            <li>EqualHires may verify information you provide and may request supporting documentation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. No employment guarantee</h2>
          <p>EqualHires does not guarantee job placement, interviews, employment offers, or recruiter responses. The platform facilitates connections between job seekers and employers but has no control over, and accepts no responsibility for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Hiring decisions made by employers or recruiters</li>
            <li>The availability or suitability of job postings</li>
            <li>The outcome of any recruitment process</li>
            <li>The conduct or decisions of employers or recruiters</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Prohibited conduct</h2>
          <p>As a job seeker, you must not:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Upload false, misleading, or fraudulent profile information or credentials</li>
            <li>Impersonate another person or create duplicate accounts</li>
            <li>Misuse the platform to harvest job posting data or recruiter contact information</li>
            <li>Scrape, copy, or export platform data through unauthorized means</li>
            <li>Interfere with platform operations, other users&apos; accounts, or platform security</li>
            <li>Violate any applicable laws, including employment, privacy, or human rights legislation</li>
            <li>Use the platform for any purpose other than seeking employment opportunities</li>
          </ul>
          <p className="mt-3">Violations of this section may result in immediate account suspension without notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Privacy and data usage</h2>
          <p>
            Your personal information is processed in accordance with the{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">EqualHires Privacy Policy</Link>.
            By using the platform, you consent to the collection, use, and processing of your data as described in that policy. You may exercise your privacy rights, including requesting access to or deletion of your personal data, by contacting us at <a href="mailto:admin@equalhires.com" className="text-brand-600 hover:underline">admin@equalhires.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Account suspension</h2>
          <p>EqualHires reserves the right to suspend or terminate accounts that:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Violate this Agreement or any applicable platform policy</li>
            <li>Contain false or fraudulent information</li>
            <li>Engage in abusive or harmful conduct toward other users</li>
            <li>Are associated with prohibited activities</li>
            <li>Fail to comply with applicable laws</li>
          </ul>
          <p className="mt-3">You may also close your account at any time from your account settings. If you believe your account was suspended in error, contact <a href="mailto:admin@equalhires.com" className="text-brand-600 hover:underline">admin@equalhires.com</a> to request a review.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Limitation of liability</h2>
          <p>EqualHires shall not be liable for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Hiring decisions or outcomes resulting from the recruitment process</li>
            <li>The conduct, decisions, or actions of employers or recruiters</li>
            <li>Platform interruptions, downtime, or technical failures</li>
            <li>Loss of profile data due to technical issues (though we take reasonable steps to prevent such loss)</li>
            <li>Actions or omissions of third-party services integrated with the platform</li>
          </ul>
          <p className="mt-3">To the maximum extent permitted by applicable law, EqualHires&apos; total liability to you shall not exceed the amount you paid to EqualHires in the 12 months preceding the event giving rise to the claim.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing law</h2>
          <p>This Agreement shall be governed by the laws of Ontario, Canada, unless otherwise required by applicable law in your jurisdiction. Any disputes arising from this Agreement shall be resolved in the courts of Ontario, Canada, except where prohibited by local law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p>
            For questions about this Agreement, contact us at{" "}
            <a href="mailto:admin@equalhires.com" className="text-brand-600 hover:underline">admin@equalhires.com</a>.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 text-sm text-gray-400">
          © EqualHires. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}
