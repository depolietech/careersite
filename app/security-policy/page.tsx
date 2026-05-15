import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Security Policy — EqualHires" };

export default function SecurityPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: May 15, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Our approach to security</h2>
          <p>EqualHires takes reasonable administrative, technical, and organizational measures to protect user data and platform integrity. We are committed to maintaining a secure environment for all users — job seekers and recruiters alike — and we regularly evaluate and improve our security practices.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data protection measures</h2>
          <p>EqualHires implements the following measures to protect platform data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption:</strong> Passwords are stored using one-way cryptographic hashing. Data in transit is encrypted using HTTPS/TLS.</li>
            <li><strong>Access controls:</strong> Role-based access controls restrict what data each user type can view or modify.</li>
            <li><strong>Secure hosting:</strong> The platform is hosted on industry-standard cloud infrastructure with physical and logical security controls.</li>
            <li><strong>Audit logs:</strong> Administrative actions are logged and monitored for suspicious activity.</li>
            <li><strong>Monitoring systems:</strong> We use automated monitoring to detect anomalies, unauthorized access attempts, and unusual activity patterns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account security</h2>
          <p>Users are responsible for maintaining the confidentiality of their account credentials. We recommend the following practices:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use a strong, unique password for your EqualHires account</li>
            <li>Enable two-factor authentication (2FA) if offered</li>
            <li>Do not share your account credentials with others</li>
            <li>Log out of your account after use on shared or public devices</li>
            <li>Report any suspected unauthorized account access immediately</li>
          </ul>
          <p className="mt-3">EqualHires will never ask you for your password via email, phone, or chat.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Internal access controls</h2>
          <p>Access to sensitive platform data is limited to authorized EqualHires personnel, contractors, or service providers with legitimate business needs. All internal access is governed by the principle of least privilege — users are granted only the access necessary to perform their role. Access logs are maintained and reviewed regularly.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Security monitoring</h2>
          <p>EqualHires monitors systems, logs, and activity to detect unauthorized access, fraud, abuse, or security incidents. Monitoring includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Failed login attempt detection and rate limiting</li>
            <li>Administrative action audit trails</li>
            <li>Anomaly detection for unusual data access patterns</li>
            <li>Automated alerts for potential security events</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Incident response</h2>
          <p>In the event of a security incident or data breach, EqualHires will take the following steps:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Investigate the incident promptly to determine the scope and cause</li>
            <li>Take immediate steps to contain the breach and mitigate ongoing risk</li>
            <li>Notify affected parties where legally required under applicable privacy laws (including PIPEDA in Canada)</li>
            <li>Report the incident to relevant authorities as required</li>
            <li>Implement measures to prevent recurrence</li>
          </ul>
          <p className="mt-3">If you believe your account has been compromised, contact us immediately at <a href="mailto:info@equalhires.com" className="text-brand-600 hover:underline">info@equalhires.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. User responsibilities</h2>
          <p>Users agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attempt unauthorized access to any account, system, or data on the platform</li>
            <li>Interfere with or disrupt platform operations, servers, or networks</li>
            <li>Upload, transmit, or distribute malicious code, viruses, or harmful content</li>
            <li>Exploit vulnerabilities or weaknesses in the platform</li>
            <li>Engage in any activity that violates applicable computer crime or cybersecurity laws</li>
          </ul>
          <p className="mt-3">Violation of these responsibilities may result in immediate account suspension and may be reported to law enforcement.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Vulnerability disclosure</h2>
          <p>If you discover a potential security vulnerability in the EqualHires platform, we encourage responsible disclosure. Please report it to us directly at <a href="mailto:info@equalhires.com" className="text-brand-600 hover:underline">info@equalhires.com</a> with the subject line &quot;Security Vulnerability&quot;. We ask that you:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Give us reasonable time to investigate and address the issue before public disclosure</li>
            <li>Not exploit the vulnerability or access user data beyond what is necessary to demonstrate it</li>
            <li>Provide sufficient detail to reproduce and understand the issue</li>
          </ul>
          <p className="mt-3">We appreciate responsible security researchers and will acknowledge valid reports promptly.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Third-party security</h2>
          <p>EqualHires uses reputable third-party service providers for hosting, email delivery, and analytics. We evaluate third-party providers for security standards and require that they maintain appropriate safeguards. However, we cannot guarantee the security practices of third parties and encourage users to review their respective policies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. No guarantee of absolute security</h2>
          <p>While EqualHires implements reasonable security measures, no system is completely secure. We cannot guarantee that unauthorized third parties will never circumvent our safeguards. By using the platform, you acknowledge and accept this inherent risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Related policies</h2>
          <p>
            For more information about how we handle your data, see our{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>,{" "}
            <Link href="/data-retention" className="text-brand-600 hover:underline">Data Retention Policy</Link>, and{" "}
            <Link href="/cookie-policy" className="text-brand-600 hover:underline">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
          <p>
            Security questions or concerns? Contact us at{" "}
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
