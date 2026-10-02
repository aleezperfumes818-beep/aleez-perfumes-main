import React from 'react';
import { RotateCcw, ShieldCheck, AlertCircle } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-[#141414]">
      <div className="border-b border-[#EAE5DC] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
          Client Protection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mt-1 font-medium">
          Refund & Replacement Policy
        </h1>
        <p className="text-xs text-[#777777] font-light mt-1">Last updated: 2026</p>
      </div>

      <div className="p-6 rounded-xl bg-white border border-[#EAE5DC] space-y-3 shadow-card">
        <div className="flex items-center space-x-2 text-[#B8860B]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-semibold text-[#141414] text-sm">Hygiene & Authenticity Standard</h3>
        </div>
        <p className="text-xs text-[#555555] font-light leading-relaxed">
          Due to the personal nature of fine fragrance oils and cosmetics, perfumes cannot be returned or refunded once opened or used. However, we offer an uncompromising replacement guarantee for items damaged or defective in transit.
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#444444] font-light leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#141414] font-medium">1. Transit Damage or Leakage Guarantee</h2>
          <p>
            If your perfume arrives broken, leaked, or visibly defective, please notify us within 48 hours of delivery. We kindly require an unboxing video or photographs clearly showing the package seal and defective bottle.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#141414] font-medium">2. Replacement Procedure</h2>
          <p>
            Upon verifying the damage via WhatsApp (+91 9345526905) or email (aleez.perfumes818@gmail.com), Aleez Perfumes will dispatch a replacement bottle at zero additional cost within 24-48 business hours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#141414] font-medium">3. Refunds for Out-of-Stock Batches</h2>
          <p>
            In the rare event that a damaged bottle belongs to a limited batch that has completely sold out, a 100% full refund will be reversed to your original payment method via Razorpay within 5-7 working days.
          </p>
        </section>
      </div>
    </div>
  );
};
