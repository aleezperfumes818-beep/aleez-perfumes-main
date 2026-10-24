import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Sender address: Uses custom verified domain if provided, otherwise Resend default test sender
const DEFAULT_SENDER = process.env.RESEND_FROM_EMAIL || 'ALEEZ PERFUMES <onboarding@resend.dev>';
const STORE_ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'aleez.perfumes818@gmail.com';

/**
 * Base Luxury HTML Email Template
 */
const renderEmailShell = (title, contentHtml) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111111;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f7f7;
      padding: 40px 15px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #eaeaea;
      border-radius: 4px;
      overflow: hidden;
    }
    .header {
      padding: 35px 25px 25px;
      text-align: center;
      border-bottom: 1px solid #f0f0f0;
    }
    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      letter-spacing: 0.25em;
      font-weight: 700;
      color: #000000;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 10px;
      letter-spacing: 0.35em;
      color: #777777;
      text-transform: uppercase;
      margin-top: 4px;
      font-weight: 500;
    }
    .content {
      padding: 35px 30px;
      font-size: 14px;
      line-height: 1.65;
      color: #222222;
    }
    .footer {
      padding: 25px 30px;
      background-color: #fafafa;
      border-top: 1px solid #f0f0f0;
      text-align: center;
      font-size: 11px;
      color: #888888;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      border-radius: 2px;
      margin: 20px 0;
    }
    .divider {
      height: 1px;
      background-color: #eeeeee;
      margin: 25px 0;
    }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    .order-table th {
      text-align: left;
      padding: 10px 0;
      border-bottom: 1px solid #000000;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .order-table td {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .total-row td {
      border-top: 1px solid #000000;
      border-bottom: none;
      font-weight: 700;
      font-size: 14px;
      padding-top: 14px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">ALEEZ</h1>
        <div class="brand-subtitle">Perfumes • Luxury Attars &amp; Parfums</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px;">&copy; ${new Date().getFullYear()} ALEEZ PERFUMES. Handcrafted with bespoke artistry.</p>
        <p style="margin: 0;">Calicut, Kerala, India &bull; Concierge: aleez.perfumes818@gmail.com</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * 1. Send Welcome Email upon registration / first login
 */
export const sendWelcomeEmail = async ({ email, name }) => {
  if (!resend) {
    console.warn('[EmailService] RESEND_API_KEY is not configured. Skipping welcome email to:', email);
    return { success: false, error: 'Resend API key not configured' };
  }

  const recipientName = name ? name.split(' ')[0] : 'Connoisseur';
  const html = renderEmailShell(
    'Welcome to Aleez Perfumes',
    `
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: normal; margin-top: 0; color: #000;">
        Welcome to the Fragrance Club, ${recipientName}
      </h2>
      <p>
        It is our distinct privilege to welcome you to <strong>ALEEZ PERFUMES</strong>.
      </p>
      <p>
        We craft ultra-concentrated, artisanal fragrances and private reserve attars designed to leave an unforgettable, long-lasting impression.
      </p>
      
      <div style="background-color: #fafafa; border: 1px solid #eeeeee; padding: 18px 20px; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #000;">
          Your Private Privileges
        </h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #444;">
          <li style="margin-bottom: 6px;">Priority access to limited batch extraits &amp; macerated attars.</li>
          <li style="margin-bottom: 6px;">Seamless order tracking and bespoke wishlist history.</li>
          <li>Complimentary luxury discovery samples with all boutique orders over &#8377;999.</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="https://aleez-perfumes-main-61o4.vercel.app/shop" class="btn">Explore The Collection</a>
      </div>

      <p style="font-size: 12px; color: #666; margin-top: 25px;">
        Need personalized fragrance recommendations? Reach our concierge anytime at <a href="mailto:aleez.perfumes818@gmail.com" style="color: #000; text-decoration: underline;">aleez.perfumes818@gmail.com</a>.
      </p>
    `
  );

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: email,
      subject: 'Welcome to Aleez Perfumes — Artisanal Luxury Parfums',
      html,
    });

    if (error) {
      console.error('[EmailService] Resend welcome error:', error);
      return { success: false, error };
    }

    console.log(`[EmailService] Welcome email sent to ${email} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Unexpected error sending welcome email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * 2. Send Order Confirmation Email to Customer
 */
export const sendOrderConfirmationEmail = async ({ order, items = [], customer, shippingAddress }) => {
  if (!resend) {
    console.warn('[EmailService] RESEND_API_KEY is not configured. Skipping order email for:', order.order_number);
    return { success: false, error: 'Resend API key not configured' };
  }

  const itemsRows = items.map((it) => `
    <tr>
      <td style="padding: 10px 0;">
        <strong>${it.product_name}</strong><br>
        <span style="font-size: 11px; color: #666;">Qty: ${it.quantity} &bull; &#8377;${it.unit_price.toLocaleString('en-IN')} each</span>
      </td>
      <td style="text-align: right; padding: 10px 0; font-weight: 500;">
        &#8377;${it.total_price.toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const html = renderEmailShell(
    `Order Confirmed: ${order.order_number}`,
    `
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="display: inline-block; padding: 5px 12px; background-color: #000; color: #fff; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600;">
          Payment Confirmed
        </span>
        <h2 style="font-family: Georgia, serif; font-size: 22px; margin: 15px 0 5px; color: #000;">
          Thank You For Your Order
        </h2>
        <p style="margin: 0; color: #666; font-size: 13px;">
          Order Reference: <strong style="color: #000;">#${order.order_number}</strong>
        </p>
      </div>

      <p>
        Dear ${customer.name || 'Valued Customer'},
      </p>
      <p>
        We have received your order and our artisan perfumers are preparing your fragrances for expedited dispatch.
      </p>

      <table class="order-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
          <tr>
            <td style="padding: 10px 0; color: #666;">Subtotal</td>
            <td style="text-align: right; padding: 10px 0;">&#8377;${(order.subtotal || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">Shipping</td>
            <td style="text-align: right; padding: 10px 0;">${order.shipping_charge === 0 ? 'FREE' : `&#8377;${order.shipping_charge}`}</td>
          </tr>
          <tr class="total-row">
            <td>Total Paid</td>
            <td style="text-align: right;">&#8377;${(order.total_amount || 0).toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #fafafa; border: 1px solid #eeeeee; padding: 16px; margin: 20px 0; border-radius: 4px; font-size: 13px;">
        <strong style="text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
          Shipping Destination:
        </strong>
        <p style="margin: 0; line-height: 1.5; color: #444;">
          ${customer.name}<br>
          ${shippingAddress.address}<br>
          ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
          Phone: ${customer.phone}
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://aleez-perfumes-main-61o4.vercel.app/account" class="btn">View Order In Account</a>
      </div>
    `
  );

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: customer.email,
      subject: `Order Confirmed: #${order.order_number} — Aleez Perfumes`,
      html,
    });

    if (error) {
      console.error('[EmailService] Resend order email error:', error);
      return { success: false, error };
    }

    console.log(`[EmailService] Order confirmation sent to ${customer.email} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Unexpected error sending order email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * 3. Send Notification Email to Store Owner/Admin
 */
export const sendAdminOrderNotificationEmail = async ({ order, items = [], customer }) => {
  if (!resend) return { success: false, error: 'Resend API key not configured' };

  const itemsList = items.map((i) => `<li>${i.quantity}x ${i.product_name} (&#8377;${i.total_price})</li>`).join('');

  const html = renderEmailShell(
    `New Order Received #${order.order_number}`,
    `
      <h2 style="font-family: Georgia, serif; font-size: 20px; color: #000; margin-top: 0;">
        🚨 New Store Order Received!
      </h2>
      <p>
        A new customer order has been paid and confirmed on Aleez Perfumes.
      </p>

      <div style="background-color: #fafafa; border: 1px solid #e0e0e0; padding: 16px; margin: 18px 0; border-radius: 4px; font-size: 13px;">
        <p style="margin: 0 0 6px;"><strong>Order Number:</strong> #${order.order_number}</p>
        <p style="margin: 0 0 6px;"><strong>Customer:</strong> ${customer.name} (${customer.email}, ${customer.phone})</p>
        <p style="margin: 0 0 6px;"><strong>Total Amount:</strong> &#8377;${(order.total_amount || 0).toLocaleString('en-IN')}</p>
        <p style="margin: 0 0 6px;"><strong>Payment Gateway:</strong> Razorpay (ID: ${order.razorpay_payment_id || 'N/A'})</p>
        <p style="margin: 0;"><strong>Destination:</strong> ${order.shipping_city}, ${order.shipping_state}</p>
      </div>

      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Items Ordered:</h3>
      <ul style="font-size: 13px; color: #333;">
        ${itemsList}
      </ul>

      <div style="text-align: center; margin-top: 25px;">
        <a href="https://aleez-perfumes-main-61o4.vercel.app/admin" class="btn">Open Admin Dashboard</a>
      </div>
    `
  );

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: STORE_ADMIN_EMAIL,
      subject: `[NEW ORDER] #${order.order_number} — &#8377;${order.total_amount} from ${customer.name}`,
      html,
    });
    return { success: !error, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Admin order notification error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * 4. Send Password Recovery Email via Resend
 */
export const sendRecoveryEmail = async ({ email, recoveryUrl }) => {
  if (!resend) {
    console.warn('[EmailService] RESEND_API_KEY is not configured.');
    return { success: false, error: 'Resend API key not configured' };
  }

  const html = renderEmailShell(
    'Reset Your Password — Aleez Perfumes',
    `
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: normal; margin-top: 0; color: #000;">
        Reset Your Password
      </h2>
      <p>
        We received a request to reset the password associated with your <strong>ALEEZ PERFUMES</strong> account.
      </p>
      <p style="font-size: 13px; color: #444;">
        Click the secure button below to choose a new password. This recovery link is valid for 24 hours.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${recoveryUrl}" class="btn">Reset Password</a>
      </div>

      <p style="font-size: 11px; color: #888; margin-top: 25px; line-height: 1.5;">
        If you did not make this request, you can safely ignore this email. Your password will remain unchanged.<br>
        Button not working? Copy and paste this URL into your browser:<br>
        <span style="color: #555; word-break: break-all;">${recoveryUrl}</span>
      </p>
    `
  );

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: email,
      subject: 'Reset your password — ALEEZ PERFUMES',
      html,
    });

    if (error) {
      console.warn('[EmailService] Resend recovery error:', error);
      return { success: false, error };
    }

    console.log(`[EmailService] Recovery email sent to ${email} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Unexpected error sending recovery email:', err);
    return { success: false, error: err.message };
  }
};
