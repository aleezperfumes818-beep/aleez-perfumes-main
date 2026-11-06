/**
 * ==============================================================================
 * ALEEZ PERFUMES - AUTOMATED WHATSAPP NOTIFICATION SERVICE
 * Dispatches automated order lifecycle updates & abandoned cart recovery alerts.
 * ==============================================================================
 */

/**
 * Message Templates for Luxury Fragrance Notifications
 */
export function buildWhatsAppTemplate(type, data) {
  const brandName = data.brandName || 'Aleez Perfumes';
  const customerName = (data.customerName || 'Valued Client').trim().split(' ')[0];
  const orderId = data.orderNumber || data.order_number || '';
  const total = data.totalAmount || data.total_amount || 0;
  const courier = data.courierName || data.courier_name || 'Delhivery Surface';
  const awb = data.awbCode || data.awb_code || '';
  const trackingUrl = data.trackingUrl || data.tracking_url || `https://shiprocket.co/tracking/${awb}`;
  const checkoutUrl = data.checkoutUrl || 'https://aleezperfumes.com/checkout';

  // Format line items preview
  let itemsSummary = '';
  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
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
        `Thank you for choosing ${brandName}. Your order *#${orderId}* has been successfully confirmed and received by our atelier.\n\n` +
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

/**
 * Send automated message via configured WhatsApp Gateway (Meta Cloud API, Interakt, or AiSensy)
 */
export async function sendWhatsAppNotification(type, payload, config = {}) {
  const phone = (payload.customerPhone || payload.customer_phone || '').replace(/[^0-9]/g, '');
  if (!phone || phone.length < 10) {
    return { success: false, reason: 'Invalid or missing customer phone number' };
  }

  // Ensure 91 country code prefix for India
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
  const messageText = buildWhatsAppTemplate(type, payload);

  const provider = config.provider || process.env.WHATSAPP_PROVIDER || 'meta'; // 'meta' | 'interakt' | 'aisensy' | 'generic'
  const metaToken = config.token || process.env.WHATSAPP_ACCESS_TOKEN;
  const metaPhoneId = config.phoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  // 1. Official Meta / WhatsApp Cloud API
  if (provider === 'meta' && metaToken && metaPhoneId && !metaToken.includes('your_token')) {
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${metaToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { preview_url: true, body: messageText },
        }),
      });

      const data = await res.json();
      return { success: res.ok, data, provider: 'meta' };
    } catch (err) {
      console.error('[WhatsApp Service] Meta Cloud API Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Interakt / AiSensy / Indian BSP Webhook API
  const bspApiKey = config.bspApiKey || process.env.WHATSAPP_BSP_API_KEY;
  const bspEndpoint = config.bspEndpoint || process.env.WHATSAPP_BSP_ENDPOINT;

  if (bspEndpoint && bspApiKey) {
    try {
      const res = await fetch(bspEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${bspApiKey}`,
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          message: messageText,
          campaign: type,
        }),
      });

      const data = await res.json();
      return { success: res.ok, data, provider: 'bsp' };
    } catch (err) {
      console.error('[WhatsApp Service] BSP API Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. Simulated Fallback Mode (Logs for dev/test and generates 1-click wa.me link)
  const encodedMessage = encodeURIComponent(messageText);
  const directLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  return {
    success: true,
    isMock: true,
    type,
    recipient: formattedPhone,
    directLink,
    message: messageText,
    notice: 'Simulated dispatch. Connect WhatsApp Cloud API or Indian BSP keys to automate background sending.',
  };
}
