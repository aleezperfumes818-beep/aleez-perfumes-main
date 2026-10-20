import React from 'react';
import { Truck, Clock, Package } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-black">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Client Information
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black mt-1 font-medium">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-neutral-500 font-light mt-1">Last updated: 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <Truck className="w-5 h-5 text-black" />
          <h3 className="font-medium text-black text-sm">Free Express Shipping</h3>
          <p className="text-xs text-neutral-600 font-light">
            Complimentary delivery across India on orders above ₹999. Standard fee of ₹99 applies below threshold.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <Clock className="w-5 h-5 text-black" />
          <h3 className="font-medium text-black text-sm">Transit Timelines</h3>
          <p className="text-xs text-neutral-600 font-light">
            Orders are typically dispatched within 24-48 hours. Metro deliveries arrive in 2-4 business days.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200 space-y-2 shadow-sm">
          <Package className="w-5 h-5 text-black" />
          <h3 className="font-medium text-black text-sm">Discreet Luxury Packaging</h3>
          <p className="text-xs text-neutral-600 font-light">
            Every bottle is encased in shock-absorbent cushioning and signature presentation cartons.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-neutral-600 font-light leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">1. Order Processing</h2>
          <p>
            All online prepaid orders are verified and processed Monday through Saturday, excluding national holidays. Once your payment is verified through Razorpay, a confirmation email with your order reference number is immediately dispatched.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">2. Courier Partners & Tracking</h2>
          <p>
            We partner with premier express logistics providers across India (Bluedart, Delhivery, DTDC). Once dispatched, tracking coordinates are shared via email and WhatsApp.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-black font-medium">3. Non-Delivery & Address Accuracy</h2>
          <p>
            Please ensure phone numbers and PIN codes are accurately entered. If delivery is unsuccessful due to incorrect coordinates, our support team will attempt contact via WhatsApp before initiating return-to-origin.
          </p>
        </section>
      </div>
    </div>
  );
};
