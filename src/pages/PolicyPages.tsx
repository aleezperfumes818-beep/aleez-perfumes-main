import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Building2, ExternalLink, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-black">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black font-medium" aria-current="page">
          Privacy Policy
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Legal Notice & Client Privacy • DPDP Act 2023 Compliant
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black font-medium">
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Aleez Perfumes & Fragrances Private Limited • Effective Date: January 1, 2026 • Last Reviewed: 2026
        </p>
      </div>

      {/* Commitment Banner */}
      <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2.5 text-black">
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          <h2 className="font-serif text-lg text-black font-medium">Our Data Minimization & Privacy Pledge</h2>
        </div>
        <p className="text-xs text-neutral-600 font-light leading-relaxed">
          At Aleez Perfumes, privacy is an indelible pillar of our luxury experience. We operate under strict principles of data minimization: we collect only what is strictly indispensable to formulate, package, and courier your fragrances safely to your doorstep. We never sell, rent, monetize, or trade your personal data to data brokers or advertising networks.
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 text-sm text-neutral-700 font-light leading-relaxed">
        {/* Section 1: Business Identity */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">1. Data Fiduciary Identity & Business Details</h2>
          <p>
            Under the Digital Personal Data Protection Act 2023 (DPDP Act) and applicable international standards, the legal entity acting as the Data Fiduciary is:
          </p>
          <div className="p-4 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-700 space-y-1 font-light">
            <p><strong>Legal Entity:</strong> Aleez Perfumes & Fragrances Private Limited</p>
            <p><strong>Trade Brand:</strong> Aleez Perfumes</p>
            <p><strong>Corporate & Operational Address:</strong> Plot No. 42, Luxury Parfumerie Enclave, Anna Salai, Chennai, Tamil Nadu 600002, India</p>
            <p><strong>Corporate Tax Registration:</strong> GSTIN: 33AAICA1234F1Z5</p>
            <p><strong>Official Contact Email:</strong> contact@aleezperfumes.com</p>
            <p><strong>Customer Care & Concierge WhatsApp:</strong> +91 93455 26905</p>
          </div>
        </section>

        {/* Section 2: Data Collected */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">2. Personal Data We Collect & Why (Data Minimization)</h2>
          <p>
            We strictly limit data collection to categories necessary for customer identification, order fulfillment, and legal accounting:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-neutral-600 pl-2">
            <li>
              <strong>Contact & Recipient Details:</strong> Full name, telephone/WhatsApp number, and delivery street address with PIN code. Used exclusively to package and route your parcel via express couriers.
            </li>
            <li>
              <strong>Electronic Communication:</strong> Email address. Used to transmit digital order confirmations, GST invoices, dispatch tracking links, and responses to your custom formulation inquiries.
            </li>
            <li>
              <strong>Custom Scent Formulation Notes:</strong> Scent preferences, custom note selections, and custom bottle engraving names submitted via our Interactive Scent Studio.
            </li>
            <li>
              <strong>Technical & Session Data:</strong> IP address, device browser type, and essential cookies strictly to maintain shopping bag persistence and protect checkout session tokens.
            </li>
          </ul>
        </section>

        {/* Section 3: Payment Security & No Card Storage */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">3. Payment Security & Zero Card Credential Storage</h2>
          <p>
            Aleez Perfumes never collects, views, or stores your credit card numbers, debit card details, CVV codes, bank login credentials, or UPI PINs on any server.
          </p>
          <p className="text-xs text-neutral-600">
            All transactions are routed directly through Razorpay, a PCI-DSS Level 1 compliant payment gateway audited according to international payment card industry standards. Razorpay utilizes 256-bit AES encryption and bank-grade tokenization.
          </p>
        </section>

        {/* Section 4: Third-Party SDK & Infrastructure Audit */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">4. Third-Party SDK & Infrastructure Audit</h2>
          <p>
            We conduct continuous audits of all third-party software development kits (SDKs) and external integrations to ensure zero invasive tracking or data leakage:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1">
              <strong className="text-black block">Razorpay Checkout SDK</strong>
              <p className="text-neutral-600">
                Role: Secure payment processing. Collects transaction authorization tokens. Zero marketing tracking.
              </p>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1">
              <strong className="text-black block">Supabase Cloud Database</strong>
              <p className="text-neutral-600">
                Role: Encrypted order catalog and profile storage. Row Level Security (RLS) ensures clients access only their personal orders.
              </p>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1">
              <strong className="text-black block">Logistics Couriers (BlueDart / Delhivery / DTDC)</strong>
              <p className="text-neutral-600">
                Role: Physical delivery. Transferred data is limited to recipient name, parcel address, and phone number for transit coordination.
              </p>
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1">
              <strong className="text-black block">Google Fonts & Open Assets</strong>
              <p className="text-neutral-600">
                Role: Display typography (Cormorant Garamond, Plus Jakarta Sans) served under open font licenses. No cookies or tracking tags.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Cookies & User Tracking */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">5. Cookies & Consent Management</h2>
          <p>
            We categorize cookies into Strictly Essential, Analytics, and Marketing. Essential cookies cannot be turned off as they are vital for store operations. You have complete control to accept or reject optional cookies at any time using our{' '}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
              className="text-black font-medium underline hover:text-neutral-600"
            >
              Cookie Preferences Manager
            </button>
            .
          </p>
        </section>

        {/* Section 6: Data Subject Rights & Deletion Option */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-black font-medium">6. Your Data Rights & Right to Erasure (Data Deletion)</h2>
          <p>
            Under the DPDP Act 2023, you have the following enforceable rights regarding your personal records:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 pl-2">
            <li><strong>Right to Access & Summary:</strong> Request an export of the personal information we hold about you.</li>
            <li><strong>Right to Correction & Updating:</strong> Update or rectify inaccurate personal records in your account portal.</li>
            <li><strong>Right to Erasure (Deletion):</strong> Permanently delete your user profile, saved addresses, and marketing subscriptions.</li>
            <li><strong>Right to Withdraw Consent:</strong> Opt out of marketing emails with 1 click without affecting order fulfillment.</li>
          </ul>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/data-deletion"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>Submit Data Deletion Request</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <Link
              to="/unsubscribe"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-neutral-200 text-black text-xs uppercase tracking-wider font-semibold rounded-lg hover:border-black transition-colors"
            >
              <span>Manage Email Preferences / Unsubscribe</span>
            </Link>
          </div>
        </section>

        {/* Section 7: Data Retention */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">7. Data Retention & Statutory Accounting</h2>
          <p>
            We retain account data for as long as your profile remains active. Upon a verified erasure request, account profiles are wiped within 30 days. However, under Section 36 of the Indian Central Goods and Services Tax (CGST) Act, physical and digital invoices must be preserved for statutory tax audit periods (6 financial years).
          </p>
        </section>

        {/* Section 8: Grievance Redressal Officer */}
        <section className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-black">
            <Building2 className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-serif text-xl text-black font-medium">8. Data Protection & Grievance Redressal Officer</h2>
          </div>
          <p className="text-xs text-neutral-600">
            In compliance with Rule 5(9) of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and Section 12 of the DPDP Act 2023, the designated Grievance Officer is:
          </p>
          <div className="text-xs text-neutral-700 space-y-1 font-light pt-1">
            <p><strong>Title:</strong> Data Protection & Grievance Desk</p>
            <p><strong>Company:</strong> Aleez Perfumes & Fragrances Private Limited</p>
            <p><strong>Postal Address:</strong> Plot No. 42, Luxury Parfumerie Enclave, Anna Salai, Chennai, Tamil Nadu 600002, India</p>
            <p><strong>Email Address:</strong> <a href="mailto:contact@aleezperfumes.com" className="text-black hover:underline font-medium">contact@aleezperfumes.com</a></p>
            <p><strong>Response Turnaround:</strong> Acknowledged within 24 hours; resolved within 15 business days.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-black">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black font-medium" aria-current="page">
          Terms & Conditions
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Customer Agreement & Store Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black font-medium">
          Terms & Conditions
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Aleez Perfumes & Fragrances Private Limited • Effective: 2026
        </p>
      </div>

      <div className="space-y-8 text-sm text-neutral-700 font-light leading-relaxed">
        {/* Section 1: Overview */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">1. Overview & Business Information</h2>
          <p>
            This website is owned and operated by <strong>Aleez Perfumes & Fragrances Private Limited</strong> (Trade Name: "Aleez Perfumes"). Throughout the site, terms "we", "us", and "our" refer to Aleez Perfumes. By accessing our platform, creating custom fragrance formulations, or placing an order, you agree to be bound by these Terms & Conditions.
          </p>
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1">
            <p><strong>Registered Office:</strong> Plot No. 42, Luxury Parfumerie Enclave, Anna Salai, Chennai, Tamil Nadu 600002, India</p>
            <p><strong>Official Inquiries:</strong> contact@aleezperfumes.com | Phone: +91 93455 26905</p>
            <p><strong>GSTIN:</strong> 33AAICA1234F1Z5</p>
          </div>
        </section>

        {/* Section 2: Transparent Pricing & No Hidden Fees */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">2. Transparent Pricing & Zero Hidden Fees Policy</h2>
          <p>
            We are firmly committed to pricing transparency:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 pl-2">
            <li>
              <strong>All-Inclusive Prices:</strong> All prices listed on Aleez Perfumes are displayed in Indian Rupees (₹ INR) and are strictly inclusive of all applicable Goods and Services Tax (GST).
            </li>
            <li>
              <strong>Zero Surprise Fees:</strong> There are no hidden handling fees, packaging surcharges, or arbitrary payment gateway convenience fees added during checkout.
            </li>
            <li>
              <strong>Express Shipping Threshold:</strong> Complimentary express shipping across India is automatically applied on all orders totaling ₹999 or more. For orders below ₹999, a flat shipping fee of ₹99 is visibly calculated prior to payment.
            </li>
          </ul>
        </section>

        {/* Section 3: Advance Payment Policy */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">3. Online Prepaid Orders Exclusively (No COD)</h2>
          <p>
            To preserve the uncontaminated purity of fine aromatic oils, prevent courier tampering, and maintain pristine bottle hygiene, Aleez Perfumes fulfills orders on a 100% advance prepaid basis only. We do not support Cash on Delivery (COD).
          </p>
          <p className="text-xs text-neutral-600">
            Payments are secured via Razorpay. We support UPI (Google Pay, PhonePe, Paytm), Visa/Mastercard/RuPay cards, and direct Net Banking.
          </p>
        </section>

        {/* Section 4: Authentic Product Descriptions & Safe Usage */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">4. Formulation Descriptions & Cosmetic Safety</h2>
          <p>
            Aleez Perfumes creates handcrafted Eau de Parfum, alcohol-free artisanal attars, and aged agarwood oud extractions.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 pl-2">
            <li>
              <strong>IFRA Standards:</strong> Formulations adhere strictly to International Fragrance Association (IFRA) safety standards.
            </li>
            <li>
              <strong>No Medical or Curative Claims:</strong> Our perfumes are luxury cosmetic preparations designed for personal adornment. They are not intended to cure, treat, or prevent any physiological condition.
            </li>
            <li>
              <strong>Allergy & Patch Test Recommendation:</strong> Fine natural botanicals (e.g. rose damascena, saffron, amber) can interact with specific skin types. We advise applying a drop to the inner wrist as a patch test prior to full application.
            </li>
            <li>
              <strong>Scent Inspirations:</strong> Mentions of famous luxury perfumes (e.g., "Inspired by Tom Ford Ombré Leather") are provided solely as comparative olfactory descriptions to assist client selection and do not imply trademark affiliation with original brand holders.
            </li>
          </ul>
        </section>

        {/* Section 5: Anti-Dark-Patterns Guarantee */}
        <section className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-black">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-serif text-base text-black font-medium">5. Anti-Dark-Patterns & Honest Commerce Pledge</h2>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            In compliance with the "Guidelines for Prevention and Regulation of Dark Patterns, 2023" issued by the Central Consumer Protection Authority (CCPA) of India, Aleez Perfumes guarantees:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 pl-2">
            <li>No false urgency or manipulated countdown clocks.</li>
            <li>No pre-checked checkboxes for marketing subscriptions or add-on charges.</li>
            <li>No hidden recurring subscriptions or forced continuity.</li>
            <li>Easy, unhindered 1-click cart item removal.</li>
          </ul>
        </section>

        {/* Section 6: Shipping, Refund & Cancellation Policy */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">6. Shipping, Replacements & Refunds</h2>
          <p>
            Orders are processed and dispatched within 24-48 business hours via insured express logistics partners. Please review our comprehensive policies:
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to="/shipping"
              className="text-xs text-black font-medium underline hover:text-neutral-600"
            >
              View Full Shipping Policy →
            </Link>
            <Link
              to="/refund"
              className="text-xs text-black font-medium underline hover:text-neutral-600"
            >
              View Full Refund & Replacement Policy →
            </Link>
          </div>
        </section>

        {/* Section 7: Intellectual Property & Licensing */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">7. Intellectual Property & Asset Licensing</h2>
          <p>
            All brand assets, photography, bottle silhouettes, and custom software code are legally protected. For comprehensive disclosures on third-party licenses including Google Fonts (SIL OFL 1.1), Lucide Icons, and photography credits, please consult our{' '}
            <Link to="/licenses" className="text-black font-medium underline hover:text-neutral-600">
              Asset Licenses & Attributions Page
            </Link>
            .
          </p>
        </section>

        {/* Section 8: Governing Law & Dispute Resolution */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">8. Governing Law & Jurisdiction</h2>
          <p>
            These Terms & Conditions and any dispute arising from client orders shall be governed by and construed in accordance with the laws of the Republic of India. The courts located in Chennai, Tamil Nadu, India shall have exclusive jurisdiction over any proceedings.
          </p>
        </section>
      </div>
    </div>
  );
};
