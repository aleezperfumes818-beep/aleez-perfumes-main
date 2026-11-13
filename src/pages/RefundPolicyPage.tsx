import React from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  ShieldAlert,
  MessageSquare,
  Truck,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
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
          Refund &amp; Exchange Policy
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Customer Protection &amp; Transparency
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black font-medium">
          Refund, Return &amp; Exchange Policy
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Aleez Perfumes • Last Updated 2026
        </p>
      </div>

      {/* Intro Note */}
      <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-sm text-neutral-800 leading-relaxed font-light">
        <p className="font-medium text-black">
          At Aleez Perfumes, we strive to provide you with high-quality artisanal fragrances and a seamless shopping experience.
        </p>
        <p className="text-xs text-neutral-600">
          Please review our return and exchange policy carefully before making a purchase. All approved returns are issued as confidential Store Credit (Private Coupon Code valid for 6 months). We do not provide cash/bank refunds to original payment methods.
        </p>
      </div>

      {/* Primary 3 Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <RotateCcw className="w-6 h-6 text-black" aria-hidden="true" />
          <h2 className="font-serif text-base text-black font-medium">3-Day Return Window</h2>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Returns accepted within 3 days of delivery. ₹100 return fee deducted; balance issued as Store Credit.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <RefreshCw className="w-6 h-6 text-black" aria-hidden="true" />
          <h2 className="font-serif text-base text-black font-medium">₹250 Exchange Option</h2>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Exchanges available for a fee of ₹250 for changes in size, product, or variant (10-12 business days).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <Lock className="w-6 h-6 text-purple-700" aria-hidden="true" />
          <h2 className="font-serif text-base text-black font-medium">6-Month Store Credit</h2>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            Credits are issued as private coupon codes directly to you, valid for 6 months on any online purchase.
          </p>
        </div>
      </div>

      {/* Core Policy Clauses */}
      <div className="space-y-8 text-sm text-neutral-700 font-light leading-relaxed">
        {/* Section 1: Return Policy */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5 text-black">
            <RotateCcw className="w-5 h-5 text-black" aria-hidden="true" />
            <h2 className="font-serif text-xl text-black font-medium">
              1. Return Policy
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs text-neutral-700 list-disc list-inside pl-1">
            <li>
              <strong>Returns are accepted within 3 days of delivery.</strong> Requests initiated beyond 3 days cannot be accepted.
            </li>
            <li>
              <strong>A return is chargeable at ₹100</strong>, which will be deducted from your store credit balance to cover reverse courier logistics and inspection handling.
            </li>
            <li>
              <strong>Upon receiving and inspecting the returned item</strong>, the net balance will be credited as <strong>Store Credit (issued as a confidential Private Coupon Code)</strong>, which can be applied for future purchases at checkout.
            </li>
            <li>
              <strong className="text-black">Refunds to original payment methods (bank accounts, UPI, debit/credit cards) are not available.</strong>
            </li>
          </ul>
        </section>

        {/* Section 2: Exchange Policy */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5 text-black">
            <RefreshCw className="w-5 h-5 text-black" aria-hidden="true" />
            <h2 className="font-serif text-xl text-black font-medium">
              2. Exchange Policy
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs text-neutral-700 list-disc list-inside pl-1">
            <li>
              <strong>Exchanges are available for a flat charge of ₹250</strong>, applicable for changes in size (e.g., 50ml to 100ml), fragrance variant, or piece.
            </li>
            <li>
              <strong>The exchange process typically takes 10-12 business days</strong> from the date of reverse courier pickup to final delivery.
            </li>
            <li>
              <strong>Exchanges are subject to live stock availability.</strong> If the desired fragrance or flacon is unavailable or out of stock, store credit will be issued instead.
            </li>
            <li>
              <strong className="text-black">Refunds to original payment methods are not available.</strong>
            </li>
          </ul>
        </section>

        {/* Section 3: Damaged / Wrong Product */}
        <section className="bg-purple-50/50 border border-purple-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5 text-purple-950">
            <Truck className="w-5 h-5 text-purple-700" aria-hidden="true" />
            <h2 className="font-serif text-xl font-medium">
              3. Damaged or Wrong Product Delivered (Free Exchange)
            </h2>
          </div>
          <p className="text-xs text-purple-900 leading-relaxed">
            If a damaged, broken, leaking, or incorrect product is delivered, we will provide you with a <strong>100% FREE exchange</strong> at zero additional charge.
          </p>
          <div className="space-y-2 text-xs text-purple-900 pl-1">
            <p>
              • <strong>Please reach us within 24 hours after delivery</strong> with unboxing proof (photos and/or video) showing the packaging label and defect.
            </p>
            <p>
              • <strong>New product will be shipped</strong> after our team receives and verifies the exchange product <strong>(WE DO NOT REFUND TO PAYMENT METHODS)</strong>.
            </p>
            <p>
              • Any <strong>STORE CREDIT</strong> issued will be credited to your account as a private code and will be valid for <strong>6 MONTHS</strong>.
            </p>
          </div>
        </section>

        {/* Section 4: General Terms & Conditions */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl text-black font-medium">
            4. General Terms &amp; Conditions
          </h2>
          <ul className="space-y-2 text-xs text-neutral-700 list-disc list-inside pl-1">
            <li>
              <strong>Original Condition:</strong> Items must be returned in their original condition: un-sprayed, unused, with the tamper-evident security seal intact, and in undamaged original presentation packaging.
            </li>
            <li>
              <strong>Quality Check Rights:</strong> Aleez Perfumes reserves the right to reject returns or exchanges if the returned item does not meet our quality check standards or shows evidence of prior use.
            </li>
            <li>
              <strong>Non-Transferable Store Credit:</strong> Store credits are non-refundable, non-transferable, and can only be used on future purchases on <a href="https://www.aleezperfumes.in" className="text-black underline font-medium">aleezperfumes.in</a>.
            </li>
            <li>
              <strong>Address &amp; Mobile Number Accuracy:</strong> If registered mobile number or address provided during checkout is incorrect or incomplete, Aleez Perfumes will not be held responsible for courier delay or return-to-origin transit issues.
            </li>
          </ul>
        </section>

        {/* Section 5: How Store Credit Works */}
        <section className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-black">
            <Lock className="w-5 h-5 text-purple-700" aria-hidden="true" />
            <h2 className="font-serif text-xl text-black font-medium">
              5. How Your Private Store Credit Code Works
            </h2>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            When your return is approved, our concierge delivers a unique, confidential <strong>Private Store Credit Coupon Code</strong> (e.g., <code className="font-mono bg-white px-1.5 py-0.5 border border-neutral-300 rounded text-black font-bold">CREDIT-ALZ-XXXX</code>) via WhatsApp or email:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
              <span className="font-bold text-black block">1. 100% Confidential</span>
              <span className="text-neutral-500 font-light">
                Private codes are never displayed in public checkout lists. Only you have access.
              </span>
            </div>
            <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
              <span className="font-bold text-black block">2. Seamless Checkout</span>
              <span className="text-neutral-500 font-light">
                Enter the private code in the "Have a Promo Code?" field on cart or checkout to deduct credit instantly.
              </span>
            </div>
            <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
              <span className="font-bold text-black block">3. Valid for 6 Months</span>
              <span className="text-neutral-500 font-light">
                You have 180 days to explore our fragrance catalogue and apply your credit to any artisanal flacon.
              </span>
            </div>
          </div>
        </section>

        {/* Rapid Concierge Action Box */}
        <section className="p-6 bg-white border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg text-black font-medium">
              Need Assistance with a Return or Exchange?
            </h3>
            <p className="text-xs text-neutral-600 font-light">
              Reach our customer support concierge via WhatsApp: <strong>+91 9345526905</strong>
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href="https://wa.me/919345526905?text=Hi%20Aleez%20Perfumes%2C%20I%20would%20like%20to%20request%20assistance%20regarding%20a%20return%20or%20exchange."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 fill-white" aria-hidden="true" />
              <span>WhatsApp Support</span>
            </a>
            <a
              href={`mailto:${settings.email || 'aleez.perfumes818@gmail.com'}`}
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
