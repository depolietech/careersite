import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Data Retention Policy — EqualHires" };

export default function DataRetentionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Retention Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: May 15, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
          <p>EqualHires retains data only for as long as reasonably necessary to provide services, meet legal obligations, resolve disputes, maintain security, and enforce agreements. This policy explains how long we keep different types of data and the circumstances under which data may be retained beyond account closure.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Candidate data</h2>
          <p>Candidate profiles, resumes, application history, and related data are retained while accounts remain active. Upon account deletion:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Profile and personal data is removed from active databases</li>
            <li>Application records associated with your account are anonymized or deleted</li>
            <li>Data may remain in encrypted backups for up to 90 days before permanent deletion</li>
            <li>Certain records may be retained longer if legally restricted from deletion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Recruiter and employer data</h2>
          <p>Recruiter and employer account information may be retained for operational, compliance, fraud prevention, and audit purposes beyond account closure. This may include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account registration details and verification records</li>
            <li>Job posting history</li>
            <li>Interview scheduling activity and trust score records</li>
            <li>Complaint and report history</li>
            <li>Administrative action logs</li>
          </ul>
          <p className="mt-3">These records may be retained for a period necessary to investigate disputes, comply with legal obligations, and maintain platform integrity.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Inactive accounts</h2>
          <p>EqualHires may archive or delete inactive accounts and associated data after extended inactivity periods. Before doing so, we will attempt to notify the account holder via their registered email address. You may reactivate your account or export your data prior to archival by contacting us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Legal and compliance retention</h2>
          <p>Certain records may be retained longer than standard periods where required by:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Applicable law or regulation</li>
            <li>Active or anticipated legal proceedings</li>
            <li>Tax or financial reporting obligations</li>
            <li>Fraud prevention and investigation requirements</li>
            <li>Regulatory compliance or audit requirements</li>
          </ul>
          <p className="mt-3">In such cases, data will be retained only for the duration required and will be deleted or anonymized once the legal basis for retention no longer applies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Deletion requests</h2>
          <p>Users may request deletion of personal data by deleting their account from account settings or by contacting <a href="mailto:info@equalhires.com" className="text-brand-600 hover:underline">info@equalhires.com</a>. Deletion requests are subject to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Legal requirements that may mandate retention of certain records</li>
            <li>Operational needs such as outstanding disputes or pending applications</li>
            <li>Security requirements including fraud investigation records</li>
            <li>Contractual obligations</li>
          </ul>
          <p className="mt-3">We will confirm receipt of your deletion request and notify you of any data that cannot be immediately deleted, along with the reason and expected retention period.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Backups and logs</h2>
          <p>Backup systems and security logs may temporarily retain information even after account deletion requests are processed. Specifically:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encrypted backups may retain data for up to 90 days after deletion</li>
            <li>Security and audit logs may be retained for up to 12 months for fraud prevention and incident investigation purposes</li>
            <li>System performance logs are anonymized and may be retained for analytical purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Anonymized data</h2>
          <p>EqualHires may retain anonymized or aggregated data indefinitely for research, analytics, platform improvement, and reporting purposes. Anonymized data does not identify individual users and is not subject to deletion under personal data retention rules.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Governing law</h2>
          <p>This policy is governed by the laws of Ontario, Canada and applicable federal privacy legislation including the Personal Information Protection and Electronic Documents Act (PIPEDA). EqualHires is committed to complying with applicable data protection requirements in the jurisdictions where it operates.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Related policies</h2>
          <p>
            For more information, see our{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>{" "}
            and{" "}
            <Link href="/security-policy" className="text-brand-600 hover:underline">Security Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
          <p>
            Questions about data retention? Contact us at{" "}
            <a href="mailto:info@equalhires.com" className="text-brand-600 hover:underline">info@equalhires.com</a>.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 text-sm text-gray-400">
          © EqualHires. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}
