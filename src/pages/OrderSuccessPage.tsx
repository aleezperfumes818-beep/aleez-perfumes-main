import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, Truck, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { dbService } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState(!order);
  const { formatPrice, settings } = useSettings();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B8860B', '#FAF8F5', '#C5A059'],
      });
    } catch {
      // ignore
    }

    if (!order && orderNumber) {
      dbService.getOrderById(orderNumber).then((found) => {
        setOrder(found);
        setLoading(false);
      });
    }
  }, [order, orderNumber]);

  const whatsAppTrackingMessage = `Hi Aleez Perfumes, I have placed Order #${orderNumber}. Could you please share dispatch and tracking updates?`;
  const whatsAppUrl = `https://wa.me/919345526905?text=${encodeURIComponent(whatsAppTrackingMessage)}`;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in text-[#141414]">
      {/* Success Badge */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#B8860B]/15 text-[#B8860B] border border-[#B8860B]/40 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-[#B8860B] font-semibold">
          Payment Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#141414] font-medium">
          Thank You For Your Order
        </h1>
        <p className="text-sm text-[#555555] font-light max-w-md mx-auto">
          Your order has been received and verified. Our perfumers are preparing your bespoke package for dispatch.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAE5DC] gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#777777] block font-medium">
              Order Reference
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#B8860B]">
              {order?.order_number || orderNumber}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#777777] block font-medium">
              Payment Status
            </span>
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Paid via Razorpay</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#777777] block font-medium">
              Order Status
            </span>
            <span className="text-xs uppercase tracking-wider text-[#141414] font-semibold">
              {order?.order_status || 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#555555] font-light">
            <div>
              <span className="uppercase tracking-wider text-[#777777] font-semibold block mb-1">
                Recipient Details
              </span>
              <p className="font-medium text-[#141414]">{order.customer_name}</p>
              <p>{order.customer_email}</p>
              <p>{order.customer_phone}</p>
            </div>

            <div>
              <span className="uppercase tracking-wider text-[#777777] font-semibold block mb-1">
                Shipping Destination
              </span>
              <p className="text-[#141414]">{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
              </p>
              <p className="text-[#B8860B] text-[11px] mt-1 font-medium">Express Pan-India Courier</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        {order?.items && order.items.length > 0 && (
          <div className="pt-4 border-t border-[#EAE5DC] space-y-3">
            <span className="uppercase tracking-wider text-[#777777] text-xs font-semibold block">
              Ordered Fragrances
            </span>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-2 bg-[#FAF9F6] px-3 rounded-lg border border-[#EAE5DC]"
                >
                  <div className="flex items-center space-x-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt=""
                        className="w-10 h-10 object-cover rounded-md bg-[#F5F2EB]"
                      />
                    )}
                    <div>
                      <span className="text-[#141414] font-medium block">{item.product_name}</span>
                      <span className="text-[#777777]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[#B8860B] font-semibold">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-[#EAE5DC] flex justify-between text-sm">
              <span className="text-[#141414] font-medium">Total Paid</span>
              <span className="font-mono text-[#B8860B] font-bold text-base">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-6 border-t border-[#EAE5DC] flex flex-col sm:flex-row gap-4">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Track Order on WhatsApp</span>
          </a>

          <Link
            to="/shop"
            className="flex-1 py-3.5 rounded-xl bg-white border border-[#EAE5DC] hover:border-[#B8860B] text-[#141414] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
