import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Recruiter Agreement — EqualHires" };

export default function RecruiterAgreementPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Agreement</h1>
      <p className="text-sm text-gray-400 mb-2">Effective Date: May 7, 2026</p>
      <p className="text-sm text-gray-500 mb-10">
        This Recruiter Agreement (&quot;Agreement&quot;) governs the use of the EqualHires platform by employers, recruiters,
        staffing agencies, contractors, and hiring representatives (&quot;Recruiter&quot;, &quot;you&quot;, or &quot;your&quot;) using the services
        provided by EqualHires (&quot;EqualHires&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By creating a recruiter account or using the
        platform, you agree to comply with this Agreement.
      </p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Purpose of the Platform</h2>
          <p>
            EqualHires is a bias-reduction hiring platform designed to promote fair and skills-focused recruitment
            practices. Certain candidate information may remain masked until specific recruitment milestones are reached.
          </p>
          <p className="mt-3">
            Recruiters agree to use the platform in good faith and in accordance with applicable laws and ethical hiring
            standards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Recruiter Eligibility</h2>
          <p>To use EqualHires as a recruiter, you must:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Be at least 18 years old</li>
            <li>Represent a legitimate business or hiring organization</li>
            <li>Provide accurate company and contact information</li>
            <li>Maintain a valid and verified email address</li>
            <li>Comply with all applicable employment, privacy, anti-discrimination, and labor laws</li>
          </ul>
          <p className="mt-3">EqualHires reserves the right to request additional verification documents at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Verification</h2>
          <p>Recruiters may be required to complete verification steps, including but not limited to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Email verification</li>
            <li>Company website validation</li>
            <li>Business registration verification</li>
            <li>LinkedIn or professional profile review</li>
            <li>Manual approval by EqualHires administrators</li>
          </ul>
          <p className="mt-3">EqualHires may deny, suspend, or revoke recruiter access at its sole discretion.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
          <p>Recruiters agree <strong>NOT</strong> to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Post fake, misleading, fraudulent, or non-existent jobs</li>
            <li>Discriminate against candidates based on protected characteristics</li>
            <li>Attempt to bypass candidate masking features</li>
            <li>Request hidden candidate information outside authorized platform workflows</li>
            <li>Harvest candidate data for unauthorized marketing or resale</li>
            <li>Share platform access credentials</li>
            <li>Upload malicious software or harmful content</li>
            <li>Use the platform for unlawful recruitment activities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Candidate Privacy &amp; Masking</h2>
          <p>EqualHires uses candidate masking features to support fair hiring practices. Recruiters acknowledge and agree that:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Certain candidate information may remain hidden until interview scheduling or other approved stages</li>
            <li>Attempts to identify masked candidates outside platform rules are prohibited</li>
            <li>Recruiters must handle all candidate data confidentially</li>
            <li>Candidate information may only be used for legitimate recruitment purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Job Posting Standards</h2>
          <p>Recruiters are responsible for ensuring that job postings:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Are accurate and lawful</li>
            <li>Clearly describe the role and expectations</li>
            <li>Include truthful salary ranges where applicable</li>
            <li>Do not contain discriminatory language</li>
            <li>Do not misrepresent employment conditions</li>
          </ul>
          <p className="mt-3">EqualHires may remove or edit postings that violate platform standards.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Interview Scheduling &amp; Cancellation Policy</h2>
          <p>Recruiters are expected to act professionally throughout the hiring process. Recruiters may cancel or reschedule interviews when necessary; however:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Excessive cancellations may trigger platform review</li>
            <li>Repeated cancellations or abuse may result in account suspension</li>
            <li>EqualHires may restrict recruiter access after repeated misuse of scheduling features</li>
          </ul>
          <p className="mt-3">EqualHires reserves the right to investigate suspicious or harmful hiring behavior.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Recruiter Conduct &amp; Trust Monitoring</h2>
          <p>EqualHires may monitor recruiter activity to maintain platform integrity, including:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Cancellation frequency</li>
            <li>Candidate complaints</li>
            <li>Suspicious job activity</li>
            <li>Inactive or misleading postings</li>
            <li>Abuse of platform functionality</li>
          </ul>
          <p className="mt-3">Accounts may be flagged, suspended, restricted, or permanently removed where abuse is detected.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
          <p>
            All platform content, software, branding, workflows, and materials associated with EqualHires remain the
            property of EqualHires unless otherwise stated. Recruiters may not copy, reproduce, reverse engineer, or
            commercially exploit any portion of the platform without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Data Protection &amp; Privacy</h2>
          <p>Recruiters agree to comply with applicable privacy laws and to protect all candidate information accessed through the platform. Recruiters may not:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Sell candidate data</li>
            <li>Export candidate data for unrelated purposes</li>
            <li>Store candidate data longer than necessary</li>
            <li>Share candidate information with unauthorized third parties</li>
          </ul>
          <p className="mt-3">
            Use of the platform is also governed by the{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">EqualHires Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Suspension &amp; Termination</h2>
          <p>EqualHires may suspend or terminate recruiter accounts for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Violation of this Agreement</li>
            <li>Fraudulent or abusive activity</li>
            <li>Repeated interview cancellations</li>
            <li>Attempts to bypass masking systems</li>
            <li>Harmful conduct toward candidates</li>
            <li>Legal or compliance concerns</li>
          </ul>
          <p className="mt-3">Termination may occur without prior notice where necessary to protect users or the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Disclaimer of Warranties</h2>
          <p>EqualHires provides the platform &quot;as is&quot; and does not guarantee:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Candidate suitability</li>
            <li>Hiring outcomes</li>
            <li>Platform availability without interruption</li>
            <li>Accuracy of user-generated content</li>
          </ul>
          <p className="mt-3">Recruiters use the platform at their own risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, EqualHires shall not be liable for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Indirect or consequential damages</li>
            <li>Hiring decisions made by recruiters</li>
            <li>Loss of business or revenue</li>
            <li>Unauthorized access caused by recruiter negligence</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Changes to this Agreement</h2>
          <p>
            EqualHires may update this Agreement from time to time. Continued use of the platform after updates
            constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Governing Law</h2>
          <p>
            This Agreement shall be governed by the laws of the applicable jurisdiction in which EqualHires operates,
            without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Contact Information</h2>
          <p>
            For questions regarding this Agreement, please contact:{" "}
            <a href="mailto:support@equalhires.com" className="text-brand-600 hover:underline">support@equalhires.com</a>
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 text-sm text-gray-400">
          © EqualHires. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}
