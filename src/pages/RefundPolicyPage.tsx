import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldCheck, MessageSquare, Truck, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const RefundPolicyPage: React.FC = () => {
  const { settings, getWhatsAppUrl } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-black">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black font-medium" aria-current="page">
          Refund & Replacement Policy
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Client Protection & Transparency Guarantee
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black font-medium">
          Refund, Return & Replacement Policy
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Aleez Perfumes & Fragrances Private Limited • Updated 2026
        </p>
      </div>

      {/* Primary Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-black" aria-hidden="true" />
          <h2 className="font-serif text-base text-black font-medium">Hygiene & Purity Standard</h2>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Due to the sterile and personal nature of fine fragrance extracts, perfumes cannot be returned once unsealed or sprayed.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <Truck className="w-6 h-6 text-black" aria-hidden="true" />
          <h2 className="font-serif text-base text-black font-medium">48h Transit Damage Cover</h2>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Immediate 100% replacement guarantee if your flacon arrives broken or leaking in transit, at zero additional cost.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <Clock className="w-6 h-6 text-black" aria-hidden="true" />
          <h2 className="font-serif text-base text-black font-medium">5-7 Day Fast Refunds</h2>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Refunds for out-of-stock items or pre-dispatch cancellations are directly reversed to your original payment method via Razorpay.
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-8 text-sm text-neutral-700 font-light leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">1. Cosmetic Hygiene Standards & Return Scope</h2>
          <p>
            Under Indian Consumer Protection regulations and international cosmetic hygiene standards, personal fragrance products, attars, and custom perfume blends cannot be returned or re-sold once the tamper-evident packaging seal has been broken or the bottle has been sprayed.
          </p>
          <p className="text-xs text-neutral-600">
            However, we provide an uncompromising replacement and refund guarantee for any shipment affected by transit trauma, leakage, or packaging defects.
          </p>
        </section>

        {/* Section 2: Step-by-Step Claim */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5 text-black">
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-serif text-xl text-black font-medium">
              2. Transit Damage & Replacement Claim Procedure (3 Simple Steps)
            </h2>
          </div>
          <p className="text-xs text-neutral-600">
            If your package shows evidence of leakage, broken flacons, or defective spray atomizers upon delivery, please notify us within <strong>48 hours</strong>:
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-start space-x-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </span>
              <div>
                <strong className="text-black block">Document Delivery Proof:</strong>
                <span className="text-neutral-600">
                  Capture a brief unboxing video or 2-3 clear photographs showing the shipping label, exterior parcel condition, and the damaged or leaking bottle.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </span>
              <div>
                <strong className="text-black block">Send via WhatsApp or Email:</strong>
                <span className="text-neutral-600">
                  Send the proof along with your Order Reference Number (e.g., ALZ-123456) to WhatsApp at <strong>{settings.phone}</strong> or email <strong>contact@aleezperfumes.com</strong>.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </span>
              <div>
                <strong className="text-black block">Instant Replacement Dispatch:</strong>
                <span className="text-neutral-600">
                  Upon rapid verification, Aleez Perfumes will prepare and dispatch an identical replacement bottle via priority air express within 24-48 business hours at <strong>zero additional fee</strong>.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Zero Hidden Fees */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">3. Zero Hidden Fees Guarantee</h2>
          <p>
            When a replacement or refund is approved, we guarantee:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 pl-2">
            <li><strong>Zero Restocking Fees:</strong> We do not assess arbitrary restocking, handling, or inspection deductions.</li>
            <li><strong>Free Replacement Shipping:</strong> You will never be charged for replacement parcel transit.</li>
            <li><strong>100% Reversal:</strong> Approved refunds return the exact amount charged to your account.</li>
          </ul>
        </section>

        {/* Section 4: Cancellation Policy */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">4. Order Cancellation Prior to Dispatch</h2>
          <p>
            Orders can be cancelled free of charge at any time before the parcel is handed over to our courier partners (typically within 12-24 hours of placing the order). Once cancelled, a 100% full refund is initiated immediately.
          </p>
        </section>

        {/* Section 5: Refund Timelines & Razorpay Reversal */}
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">5. Refund Processing Timelines & Methods</h2>
          <p>
            All refunds are reversed directly to the original payment source utilized during checkout via Razorpay:
          </p>
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-200">
              <span>UPI Payments (GPay, PhonePe, Paytm):</span>
              <span className="font-medium text-black">24 to 48 Hours</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-200">
              <span>Credit & Debit Cards (Visa, Mastercard, RuPay):</span>
              <span className="font-medium text-black">5 to 7 Working Days</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Net Banking Transfers:</span>
              <span className="font-medium text-black">3 to 6 Working Days</span>
            </div>
          </div>
        </section>

        {/* Rapid Concierge Action Box */}
        <section className="p-6 bg-white border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg text-black font-medium">Need Assistance with an Active Order?</h3>
            <p className="text-xs text-neutral-600 font-light">
              Our client concierge is ready to assist you via WhatsApp or Email.
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 fill-white" aria-hidden="true" />
              <span>WhatsApp Concierge</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="px-4 py-2.5 bg-white border border-neutral-200 hover:border-black text-black text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors"
            >
              <span>Email Support</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
