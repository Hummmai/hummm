import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Privacy Policy | Hummm"
        description="Hummm's Privacy Policy — how we collect, use, and protect your personal data. Fully GDPR compliant."
        canonical="/privacy-policy"
      />
      <Navbar />
      <main className="pt-28 pb-20 section-padding">
        <div className="max-w-3xl mx-auto prose prose-sm prose-neutral dark:prose-invert">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: 30 March 2026</p>

          <h2>1. Who We Are</h2>
          <p>
            Humm Ltd ("Hummm", "we", "us", "our") is a UK-based AI-powered property consultancy. We are the data controller
            for the personal information we process. You can contact us at{" "}
            <a href="mailto:hello@hummm.pro" className="text-primary">hello@hummm.pro</a>.
          </p>

          <h2>2. What Data We Collect</h2>
          <ul>
            <li><strong>Identity data:</strong> name, date of birth (for AML checks)</li>
            <li><strong>Contact data:</strong> email address, phone number, postal address</li>
            <li><strong>Property data:</strong> address, type, size, features, photos you upload</li>
            <li><strong>Financial data:</strong> property valuations, asking prices (we do not store payment card details)</li>
            <li><strong>Technical data:</strong> IP address, browser type, pages visited, cookie preferences</li>
            <li><strong>Communication data:</strong> messages sent via our chat assistant or contact forms</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>We process your personal data for the following purposes:</p>
          <ul>
            <li>To provide property valuations, sales, lettings, and negotiation services</li>
            <li>To perform anti-money laundering (AML) identity verification as required by UK law</li>
            <li>To communicate with you about your property or enquiry</li>
            <li>To send service-related emails (confirmations, reports, updates)</li>
            <li>To improve our AI models and services (using anonymised, aggregated data only)</li>
            <li>To comply with legal and regulatory obligations</li>
          </ul>

          <h2>4. Legal Basis for Processing</h2>
          <ul>
            <li><strong>Consent:</strong> where you have given explicit consent (e.g. waitlist sign-up, marketing)</li>
            <li><strong>Contractual necessity:</strong> to fulfil our services to you</li>
            <li><strong>Legal obligation:</strong> AML regulations, anti-fraud requirements</li>
            <li><strong>Legitimate interest:</strong> improving our services, website analytics</li>
          </ul>

          <h2>5. Data Sharing</h2>
          <p>We may share your data with:</p>
          <ul>
            <li><strong>Property portals:</strong> Rightmove, Zoopla, and others when you list a property with us</li>
            <li><strong>Service providers:</strong> email delivery, hosting, and AI processing partners (all GDPR-compliant)</li>
            <li><strong>Regulatory bodies:</strong> where required by law (e.g. HMRC, The Property Ombudsman)</li>
          </ul>
          <p>We never sell your personal data to third parties for marketing purposes.</p>

          <h2>6. How Long We Keep Your Data</h2>
          <ul>
            <li><strong>Valuation data:</strong> 6 years (regulatory requirement)</li>
            <li><strong>AML check records:</strong> 5 years after the business relationship ends (MLR 2017)</li>
            <li><strong>Listing data:</strong> duration of listing plus 6 years</li>
            <li><strong>Marketing preferences:</strong> until you unsubscribe</li>
            <li><strong>Chat conversations:</strong> 12 months</li>
          </ul>

          <h2>7. Your Rights Under GDPR</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong>Rectification</strong> — ask us to correct inaccurate data</li>
            <li><strong>Erasure</strong> — ask us to delete your data (subject to legal obligations)</li>
            <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
            <li><strong>Restriction</strong> — ask us to limit processing of your data</li>
            <li><strong>Objection</strong> — object to processing based on legitimate interest</li>
            <li><strong>Withdraw consent</strong> — at any time, without affecting prior processing</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:hello@hummm.pro" className="text-primary">hello@hummm.pro</a>.
            We will respond within 30 days.
          </p>

          <h2>8. Cookies</h2>
          <p>
            We use essential cookies for site functionality, analytics cookies to understand usage, and personalisation
            cookies to improve your experience. You can manage your preferences at any time using the "Cookie Settings"
            link in our footer.
          </p>

          <h2>9. Data Security</h2>
          <p>
            We use industry-standard security measures including encryption in transit (TLS), secure data storage, and
            access controls. All data is processed and stored within GDPR-compliant infrastructure.
          </p>

          <h2>10. Children</h2>
          <p>Our services are not directed at individuals under 18. We do not knowingly collect data from children.</p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be communicated via email or a notice
            on our website.
          </p>

          <h2>12. Contact & Complaints</h2>
          <p>
            If you have questions or complaints about our data practices, please contact us at{" "}
            <a href="mailto:hello@hummm.pro" className="text-primary">hello@hummm.pro</a>.
          </p>
          <p>
            <strong>Registered Office:</strong> Hummm AI, 128 City Road, London EC1V 2NX, United Kingdom.
          </p>
          <p>
            You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary">ico.org.uk</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
