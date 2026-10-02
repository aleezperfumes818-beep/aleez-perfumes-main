import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="border-b border-luxury-border pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
          Legal Notice
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-luxury-dark mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-500 font-light mt-1">Aleez Perfumes • 2026</p>
      </div>

      <div className="space-y-6 text-sm text-stone-600 font-light leading-relaxed">
        <p>
          At Aleez Perfumes, accessible via our online store, the privacy of our valued clientele is paramount. This document outlines the types of personal information collected and how it is secured.
        </p>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-luxury-dark">1. Information We Collect</h2>
          <p>
            When placing an order or registering an account, we collect necessary contact information including your full name, shipping address, mobile phone number, and email address.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-luxury-dark">2. Payment Security</h2>
          <p>
            We do not store your credit card numbers, CVVs, UPI PINs, or banking credentials on our servers. All transactions are securely routed through Razorpay, a PCI-DSS Level 1 compliant payment gateway.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-luxury-dark">3. How Your Information Is Used</h2>
          <p>
            Your information is used solely to process orders, facilitate courier fulfillment, send shipment tracking notifications, and respond to your personal fragrance concierge requests.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="border-b border-luxury-border pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
          Terms of Service
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-luxury-dark mt-1">
          Terms & Conditions
        </h1>
        <p className="text-xs text-stone-500 font-light mt-1">Aleez Perfumes • 2026</p>
      </div>

      <div className="space-y-6 text-sm text-stone-600 font-light leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-luxury-dark">1. Store Nature</h2>
          <p>
            Aleez Perfumes operates as an exclusive online fragrance brand. All product orders are placed digitally and fulfilled via express shipping partners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-luxury-dark">2. Pricing & Currency</h2>
          <p>
            All prices listed on Aleez Perfumes are displayed in Indian Rupees (₹ INR) and inclusive of all applicable taxes. We reserve the right to modify prices without prior notice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-luxury-dark">3. Payment Terms</h2>
          <p>
            All orders require full advance payment through authorized online payment methods via Razorpay. Orders without verified payment status will not be dispatched.
          </p>
        </section>
      </div>
    </div>
  );
};
