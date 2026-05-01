import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Privacy Policy — Bias-Free Careers" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: April 30, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who we are</h2>
          <p>Bias-Free Careers (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a skills-first hiring platform designed to reduce unconscious bias in recruitment. We are headquartered in Canada. Our platform masks personally identifiable information from recruiters until an interview is voluntarily scheduled.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information we collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account information:</strong> Email address, hashed password, and role (job seeker or employer).</li>
            <li><strong>Profile information (job seekers):</strong> Name, phone number, LinkedIn/GitHub URLs, professional summary, skills, work history, education, and certifications. Sensitive fields (name, company names, dates, institutions) are masked from employers until you schedule an interview.</li>
            <li><strong>Profile information (employers):</strong> Company name, industry, location, website, and company size.</li>
            <li><strong>Usage data:</strong> Pages visited, features used, and session metadata collected to improve the service.</li>
            <li><strong>Cookies:</strong> We use essential cookies for authentication and optional analytics cookies (with your consent).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How we use your information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To operate and improve the platform</li>
            <li>To match job seekers with relevant opportunities</li>
            <li>To enforce our anonymous-first hiring model</li>
            <li>To detect and prevent abuse (e.g., recruiters who repeatedly cancel interviews)</li>
            <li>To send transactional emails (application updates, interview notifications)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data masking and revelation</h2>
          <p>Personally identifiable fields — including your full name, photo, company names, employment dates, and educational institution — are never shown to recruiters unless you explicitly proceed with an interview. At that point, both parties mutually consent to the reveal. You may withdraw from a process at any time before reveal.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data sharing</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers necessary to operate the platform (hosting, email delivery, analytics)</li>
            <li>Law enforcement if legally required</li>
            <li>Employers — only the unmasked fields, and only after a confirmed interview is scheduled</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data retention</h2>
          <p>We retain your account data for as long as your account is active. You may delete your account at any time from your account settings, which will remove all associated profile and application data. Some data may be retained for up to 90 days in backups before permanent deletion.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your rights</h2>
          <p>Depending on your jurisdiction (Canada — PIPEDA; EU — GDPR; California — CCPA), you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
            <li>Data portability</li>
          </ul>
          <p className="mt-3">To exercise these rights, contact us at <strong>privacy@biasfree.careers</strong>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Security</h2>
          <p>We use industry-standard security measures including encrypted passwords, HTTPS, and access controls. No method of transmission over the internet is 100% secure, but we take reasonable steps to protect your data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies</h2>
          <p>We use essential cookies for authentication sessions. With your consent, we also use analytics cookies to understand how the platform is used. You can manage your cookie preferences using the consent banner or your browser settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to this policy</h2>
          <p>We may update this policy periodically. We will notify you of significant changes via email or a prominent notice on the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
          <p>Questions? Reach us at <strong>privacy@biasfree.careers</strong> or through our <Link href="/about" className="text-brand-600 hover:underline">about page</Link>.</p>
        </section>
      </div>
    </div>
  );
}
