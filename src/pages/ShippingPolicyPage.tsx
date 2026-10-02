import React from 'react';
import { Truck, ShieldCheck, Clock, Package } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-[#141414]">
      <div className="border-b border-[#EAE5DC] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
          Client Information
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mt-1 font-medium">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-[#777777] font-light mt-1">Last updated: 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white border border-[#EAE5DC] space-y-2 shadow-card">
          <Truck className="w-5 h-5 text-[#B8860B]" />
          <h3 className="font-medium text-[#141414] text-sm">Free Express Shipping</h3>
          <p className="text-xs text-[#666666] font-light">
            Complimentary delivery across India on orders above ₹999. Standard fee of ₹99 applies below threshold.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#EAE5DC] space-y-2 shadow-card">
          <Clock className="w-5 h-5 text-[#B8860B]" />
          <h3 className="font-medium text-[#141414] text-sm">Transit Timelines</h3>
          <p className="text-xs text-[#666666] font-light">
            Orders are typically dispatched within 24-48 hours. Metro deliveries arrive in 2-4 business days.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#EAE5DC] space-y-2 shadow-card">
          <Package className="w-5 h-5 text-[#B8860B]" />
          <h3 className="font-medium text-[#141414] text-sm">Discreet Luxury Packaging</h3>
          <p className="text-xs text-[#666666] font-light">
            Every bottle is encased in shock-absorbent cushioning and bespoke presentation cartons.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-[#444444] font-light leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#141414] font-medium">1. Order Processing</h2>
          <p>
            All online prepaid orders are verified and processed Monday through Saturday, excluding national holidays. Once your payment is verified through Razorpay, a confirmation email with your order reference number is immediately dispatched.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#141414] font-medium">2. Courier Partners & Tracking</h2>
          <p>
            We partner with premier express logistics providers across India (Bluedart, Delhivery, DTDC). Once dispatched, tracking coordinates are shared via email and WhatsApp.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-[#141414] font-medium">3. Non-Delivery & Address Accuracy</h2>
          <p>
            Please ensure phone numbers and PIN codes are accurately entered. If delivery is unsuccessful due to incorrect coordinates, our support team will attempt contact via WhatsApp before initiating return-to-origin.
          </p>
        </section>
      </div>
    </div>
  );
};
