import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Printer, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSettings } from '../context/SettingsContext';
import { dbService } from '../lib/supabase';
import { Order } from '../types';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState<boolean>(!order && !!orderNumber);
  const { formatPrice, settings } = useSettings();

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#737373', '#a3a3a3', '#d4d4d4'],
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in text-black print:p-0 print:m-0">
      {/* Success Badge */}
      <div className="text-center space-y-4 print:hidden">
        <div className="w-16 h-16 bg-neutral-100 text-black border border-neutral-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-semibold">
          Payment Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-black font-medium">
          Thank You For Your Order
        </h1>
        <p className="text-sm text-neutral-600 font-light max-w-md mx-auto">
          Your order has been received and verified. Our perfumers are preparing your fragrance package for dispatch.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block font-medium">
              Order Reference
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-black">
              {order?.order_number || orderNumber}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block font-medium">
              Payment Status
            </span>
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-black bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Paid via Razorpay</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block font-medium">
              Order Status
            </span>
            <span className="text-xs uppercase tracking-wider text-black font-semibold">
              {order?.order_status || 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-600 font-light">
            <div>
              <span className="uppercase tracking-wider text-neutral-700 font-semibold block mb-1">
                Recipient Details
              </span>
              <p className="font-medium text-black">{order.customer_name}</p>
              <p>{order.customer_email}</p>
              <p>{order.customer_phone}</p>
            </div>

            <div>
              <span className="uppercase tracking-wider text-neutral-700 font-semibold block mb-1">
                Shipping Destination
              </span>
              <p className="text-black">{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
              </p>
              <p className="text-neutral-500 text-[11px] mt-1 font-medium">Express Pan-India Courier</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        {order?.items && order.items.length > 0 && (
          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <span className="uppercase tracking-wider text-neutral-700 text-xs font-semibold block">
              Ordered Fragrances
            </span>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-2 bg-neutral-50 px-3 rounded-lg border border-neutral-200"
                >
                  <div className="flex items-center space-x-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={`Flacon of ${item.product_name}`}
                        className="w-10 h-10 object-cover rounded-md bg-neutral-100"
                      />
                    )}
                    <div>
                      <span className="text-black font-medium block">{item.product_name}</span>
                      <span className="text-neutral-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-mono text-black font-semibold">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm">
              <div>
                <span className="text-black font-medium block">Total Paid</span>
                <span className="text-[11px] text-neutral-500 font-light">Inclusive of all taxes (GST) • Zero hidden fees</span>
              </div>
              <span className="font-mono text-black font-bold text-base">
                {formatPrice(order.total_amount)}
              </span>
            </div>

            {/* Email Receipt & Unsubscribe Notice */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 space-y-1">
              <span className="font-semibold text-black block">Official Email Receipt Dispatched</span>
              <p className="font-light leading-relaxed">
                A formal invoice and receipt have been dispatched to <strong>{order.customer_email}</strong>. You may manage communication preferences or{' '}
                <Link to="/unsubscribe" className="text-black underline hover:text-neutral-600">
                  unsubscribe from marketing announcements
                </Link>{' '}
                at any time without affecting essential order and delivery tracking updates.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3 print:hidden">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Track Order on WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            type="button"
            className="px-5 py-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2 shadow-sm border border-neutral-200"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <Link
            to="/shop"
            className="flex-1 py-3.5 rounded-xl bg-white border border-neutral-300 hover:border-black text-black text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
