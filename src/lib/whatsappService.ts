import { Order } from '../types';

export type WhatsAppTrigger = 'ORDER_PLACED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'ABANDONED_CART';

export interface WhatsAppNotificationPayload {
  customerName: string;
  customerPhone: string;
  orderNumber?: string;
  totalAmount?: number;
  items?: Array<{ name?: string; product_name?: string; quantity: number }>;
  courierName?: string;
  awbCode?: string;
  trackingUrl?: string;
  checkoutUrl?: string;
}

export function buildWhatsAppTemplate(type: WhatsAppTrigger, data: WhatsAppNotificationPayload): string {
  const brandName = 'Aleez Perfumes';
  const customerName = (data.customerName || 'Valued Client').trim().split(' ')[0];
  const orderId = data.orderNumber || '';
  const total = data.totalAmount || 0;
  const courier = data.courierName || 'Delhivery Surface';
  const awb = data.awbCode || '';
  const trackingUrl = data.trackingUrl || `https://shiprocket.co/tracking/${awb}`;
  const checkoutUrl = data.checkoutUrl || `${window.location.origin}/checkout`;

  let itemsSummary = '';
  if (data.items && data.items.length > 0) {
    itemsSummary = data.items
      .map((it) => `${it.product_name || it.name} (x${it.quantity || 1})`)
      .slice(0, 3)
      .join(', ');
  } else {
    itemsSummary = 'Bespoke Luxury Fragrance';
  }

  switch (type) {
    case 'ORDER_PLACED':
      return (
        `✨ *${brandName.toUpperCase()}* — Order Confirmed!\n\n` +
        `Dear ${customerName},\n` +
        `Thank you for choosing ${brandName}. Your order *#${orderId}* has been successfully confirmed.\n\n` +
        `📦 *Order Details:*\n` +
        `• Flacons: ${itemsSummary}\n` +
        `• Total Paid: ₹${Number(total).toLocaleString('en-IN')}\n` +
        `• Status: Preparing for Express Dispatch\n\n` +
        `We are carefully bottling and packaging your fragrance. You will receive your AWB courier tracking link as soon as it is dispatched.\n\n` +
        `Need help? Reply directly to this WhatsApp concierge or visit aleezperfumes.com.`
      );

    case 'ORDER_SHIPPED':
      return (
        `🚚 *${brandName.toUpperCase()}* — Your Fragrance Has Dispatched!\n\n` +
        `Dear ${customerName},\n` +
        `Your flacon order *#${orderId}* has been securely packed and handed over for courier delivery.\n\n` +
        `📍 *Tracking Information:*\n` +
        `• Courier Partner: *${courier}*\n` +
        `• AWB Tracking Code: *${awb}*\n` +
        `• Track Live Parcel: ${trackingUrl}\n\n` +
        `Expected delivery is within 3–5 business days across India.\n\n` +
        `Warm regards,\n*The ${brandName} Atelier*`
      );

    case 'ORDER_DELIVERED':
      return (
        `🌟 *${brandName.toUpperCase()}* — Order Delivered!\n\n` +
        `Dear ${customerName},\n` +
        `Your luxury fragrance order *#${orderId}* has been delivered to your destination!\n\n` +
        `🪄 *Perfumer Tip:* Let the flacon rest at room temperature away from direct sunlight for the first 24 hours to allow the concentrated aromatic oils to settle.\n\n` +
        `We hope your new scent brings you timeless presence. Share your fragrance journey with us on Instagram *@aleez.parfums*!`
      );

    case 'ORDER_CANCELLED':
      return (
        `ℹ️ *${brandName.toUpperCase()}* — Order Cancellation Notice\n\n` +
        `Dear ${customerName},\n` +
        `Your order *#${orderId}* has been cancelled as requested.\n\n` +
        `If you have already paid online via Razorpay, a 100% full refund has been initiated back to your original source payment method (typically credited within 3–5 working days).\n\n` +
        `If this was done in error or you need help choosing another scent, feel free to reply right here.`
      );

    case 'ABANDONED_CART':
      return (
        `💎 *${brandName.toUpperCase()}* — Your Signature Scent is Waiting\n\n` +
        `Hello ${customerName},\n` +
        `We noticed you left ${itemsSummary} in your shopping bag.\n\n` +
        `Our artisanal batches are hand-blended in small quantities. Complete your order today and enjoy *complimentary luxury express shipping* across India.\n\n` +
        `👉 *Resume Order:* ${checkoutUrl}\n\n` +
        `Have questions about notes, sillage, or longevity? Reply here to consult directly with our master perfumer.`
      );

    default:
      return `Hello ${customerName}, update regarding your order #${orderId} from ${brandName}.`;
  }
}

export const whatsappService = {
  /**
   * Generate 1-Click WhatsApp Direct Link for Admin / Web
   */
  getDirectWhatsAppUrl(type: WhatsAppTrigger, data: WhatsAppNotificationPayload): string {
    const phone = (data.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const msg = buildWhatsAppTemplate(type, data);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  },

  /**
   * Send automated background message through backend API
   */
  async sendAutomatedMessage(type: WhatsAppTrigger, data: WhatsAppNotificationPayload): Promise<{ success: boolean; directLink?: string; error?: string }> {
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload: data }),
      });
      return await res.json();
    } catch (err: any) {
      console.warn('Backend WhatsApp API unreachable, generating direct link fallback:', err);
      return {
        success: true,
        directLink: this.getDirectWhatsAppUrl(type, data),
      };
    }
  },

  /**
   * Record abandoned cart lead when customer fills details but exits
   */
  async recordAbandonedCart(lead: { name: string; phone: string; email: string; items: any[]; total: number }): Promise<void> {
    try {
      await fetch('/api/whatsapp/record-abandoned-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    } catch {
      // Non-blocking telemetry
    }
  },
};
