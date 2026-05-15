import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Accessibility Statement — EqualHires" };

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Accessibility Statement</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: May 15, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Our commitment</h2>
          <p>EqualHires is committed to providing an accessible and inclusive experience for all users, including individuals with disabilities. We believe that equitable access to employment opportunities begins with an equitable platform, and we strive to ensure our platform is accessible to users with diverse abilities and compatible with commonly used assistive technologies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Accessibility features</h2>
          <p>Our accessibility efforts include, but are not limited to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Keyboard navigation:</strong> Core platform functions can be accessed and operated using a keyboard without requiring a mouse.</li>
            <li><strong>Contrast ratios:</strong> We aim to maintain readable contrast ratios throughout the platform interface to support users with low vision or colour blindness.</li>
            <li><strong>Semantic HTML:</strong> We use semantic HTML structure to ensure content is properly interpreted by assistive technologies such as screen readers.</li>
            <li><strong>Responsive design:</strong> The platform adapts to different screen sizes and orientations to support mobile devices and varied display settings.</li>
            <li><strong>Screen reader compatibility:</strong> We work to ensure that interactive elements, forms, and content are accessible to screen reader users.</li>
            <li><strong>Descriptive labels:</strong> Form inputs, buttons, and interactive controls include descriptive labels and ARIA attributes to improve assistive technology compatibility.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Conformance status</h2>
          <p>EqualHires aims to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. While we strive to apply these guidelines across the platform, some content or features may not yet fully conform. We are actively working to identify and address accessibility gaps.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Ongoing improvements</h2>
          <p>EqualHires continuously reviews and improves platform accessibility, usability, and design standards. This includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Regular accessibility audits of new and existing features</li>
            <li>Testing with assistive technologies during development</li>
            <li>Incorporating accessibility feedback from users into platform improvements</li>
            <li>Training our development team on accessible design practices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-party content</h2>
          <p>Certain third-party integrations or embedded services used by EqualHires may not fully comply with accessibility standards. EqualHires is not responsible for third-party accessibility limitations but will endeavour to select accessible third-party services where possible and practical.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Known limitations</h2>
          <p>We are aware of the following areas where accessibility may be limited and are actively working to improve them:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Some complex interactive components (such as data tables and modal dialogs) may have limited screen reader support in certain browsers</li>
            <li>Dynamically loaded content may not always announce updates to screen reader users</li>
            <li>PDF documents linked from the platform may not be fully accessible</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Feedback and assistance</h2>
          <p>We welcome your feedback on the accessibility of EqualHires. If you experience any accessibility barriers while using the platform, or if you require assistance accessing any content or functionality, please contact us. We aim to respond to accessibility feedback within 5 business days.</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Email: <a href="mailto:info@equalhires.com" className="text-brand-600 hover:underline">info@equalhires.com</a></li>
            <li>Subject line: Accessibility Feedback</li>
          </ul>
          <p className="mt-3">When contacting us about an accessibility issue, please describe the barrier you encountered, the assistive technology or browser you are using, and the page or feature affected. This helps us investigate and address the issue effectively.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Applicable standards</h2>
          <p>EqualHires operates in Canada and follows accessibility guidelines under:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accessibility for Ontarians with Disabilities Act (AODA) — Information and Communications Standards</li>
            <li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
            <li>Canadian Human Rights Act provisions related to accessibility and accommodation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Related policies</h2>
          <p>
            For more information about how we collect and handle your data, please review our{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>{" "}
            and{" "}
            <Link href="/security-policy" className="text-brand-600 hover:underline">Security Policy</Link>.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 text-sm text-gray-400">
          © EqualHires. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}
