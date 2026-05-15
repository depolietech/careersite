import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Cookie Policy — EqualHires" };

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: May 15, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What are cookies?</h2>
          <p>Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work efficiently, improve user experience, and provide information to website operators. Similar technologies such as web beacons, pixels, and local storage may also be used in conjunction with cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Purpose of cookies</h2>
          <p>EqualHires uses cookies and similar technologies to improve platform performance, security, analytics, and user experience. Specifically, we use cookies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Keep you signed in during your session</li>
            <li>Remember your preferences and settings</li>
            <li>Protect against fraudulent activity and unauthorized access</li>
            <li>Understand how users interact with the platform to improve features</li>
            <li>Measure the effectiveness of platform changes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Types of cookies we use</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>Essential (authentication) cookies:</strong> Required for the platform to function. These manage your login session and keep your account secure. They cannot be disabled without preventing access to core features.
            </li>
            <li>
              <strong>Analytics cookies:</strong> Help us understand how visitors use the platform — pages visited, time spent, and features used. This data is used in aggregate to improve the service. These are only set with your consent.
            </li>
            <li>
              <strong>Performance cookies:</strong> Measure platform load times, error rates, and technical performance. Used to diagnose issues and optimize the user experience.
            </li>
            <li>
              <strong>Preference cookies:</strong> Remember your choices such as language preference, display settings, or notification preferences between visits.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-party services</h2>
          <p>EqualHires may use third-party services such as analytics providers, authentication systems, or embedded services that may also place cookies on your device. These third parties have their own privacy and cookie policies, and we encourage you to review them. EqualHires is not responsible for the cookie practices of third-party services.</p>
          <p className="mt-3">Third-party services we may use include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Analytics platforms to measure platform usage</li>
            <li>Authentication services to verify your identity securely</li>
            <li>Cloud hosting providers that may use technical cookies for load balancing and security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Managing cookies</h2>
          <p>Users may manage or disable cookies through browser settings; however, certain platform features may not function properly if essential cookies are disabled. Most browsers allow you to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>View which cookies are stored and delete them individually</li>
            <li>Block all cookies from specific websites</li>
            <li>Block third-party cookies</li>
            <li>Clear all cookies when you close your browser</li>
          </ul>
          <p className="mt-3">Please refer to your browser&apos;s help documentation for instructions on managing cookie settings. Note that disabling essential cookies will prevent you from logging in to EqualHires.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookie duration</h2>
          <p>Cookies used by EqualHires may be:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Session cookies:</strong> Temporary cookies that are deleted when you close your browser. Used to maintain your login session.</li>
            <li><strong>Persistent cookies:</strong> Cookies that remain on your device for a set period or until you delete them. Used to remember preferences and for analytics purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Consent</h2>
          <p>By continuing to use the EqualHires platform, you consent to the use of essential cookies required for platform operation. For optional analytics and performance cookies, we seek your explicit consent via the cookie consent banner displayed upon first visit. You may withdraw consent for non-essential cookies at any time through your browser settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to this policy</h2>
          <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes are posted constitutes acceptance of the revised policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
          <p>
            Questions about our use of cookies? Contact us at{" "}
            <a href="mailto:admin@equalhires.com" className="text-brand-600 hover:underline">admin@equalhires.com</a>{" "}
            or review our <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 text-sm text-gray-400">
          © EqualHires. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}
