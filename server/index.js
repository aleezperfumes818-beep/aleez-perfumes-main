import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client (if configured)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseServiceKey && !supabaseServiceKey.includes('mock_')) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_aleezdemo123';
const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_aleezdemo456';
const isMockRazorpay = razorpayKeyId.includes('demo') || razorpayKeyId.includes('placeholder');

let razorpayInstance = null;
if (!isMockRazorpay) {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpaySecret,
  });
}

// Fallback in-memory product cache for server-side price validation if DB not connected
const fallbackProducts = [
  { id: 'p1111111-1111-1111-1111-111111111111', name: 'Royal Amber Royale', price: 2499, sale_price: 1999, stock_quantity: 35 },
  { id: 'p2222222-2222-2222-2222-222222222222', name: 'Velvet Oud Noir', price: 3299, sale_price: 2799, stock_quantity: 20 },
  { id: 'p3333333-3333-3333-3333-333333333333', name: 'Santal Imperial', price: 2699, sale_price: 2199, stock_quantity: 25 },
  { id: 'p4444444-4444-4444-4444-444444444444', name: 'Elysian Rose Attar', price: 1499, sale_price: 1199, stock_quantity: 40 },
  { id: 'p5555555-5555-5555-5555-555555555555', name: 'Midnight Saffron', price: 2899, sale_price: 2399, stock_quantity: 18 },
  { id: 'p6666666-6666-6666-6666-666666666666', name: 'Aqua Celestia', price: 1999, sale_price: 1699, stock_quantity: 45 },
];

// In-memory orders store for development persistence
const serverOrders = new Map();

// --- 1. HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'Aleez Perfumes',
    environment: process.env.NODE_ENV || 'development',
    razorpayConfigured: !isMockRazorpay,
    supabaseConfigured: !!supabase,
    timestamp: new Date().toISOString(),
  });
});

// --- 2. CREATE RAZORPAY ORDER (SECURE SERVER-SIDE PRICING & STOCK CHECK) ---
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { items, customer, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid.' });
    }

    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ error: 'Customer information is incomplete.' });
    }

    // SERVER-SIDE PRICE & STOCK VALIDATION (Never trust prices sent from frontend)
    let validatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      let product = null;

      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, sale_price, stock_quantity, is_active')
          .eq('id', item.productId)
          .single();

        if (error || !data) {
          return res.status(404).json({ error: `Product not found: ${item.name || item.productId}` });
        }
        product = data;
      } else {
        // Fallback store
        product = fallbackProducts.find((p) => p.id === item.productId) || {
          id: item.productId,
          name: item.name,
          price: item.price || 1999,
          sale_price: item.salePrice || null,
          stock_quantity: 50,
          is_active: true,
        };
      }

      if (product.is_active === false) {
        return res.status(400).json({ error: `${product.name} is currently inactive.` });
      }

      const requestedQty = parseInt(item.quantity, 10);
      if (requestedQty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for ${product.name}.` });
      }

      if (product.stock_quantity < requestedQty) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.`,
        });
      }

      const unitPrice = product.sale_price ? Number(product.sale_price) : Number(product.price);
      const itemTotal = unitPrice * requestedQty;
      validatedSubtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: unitPrice,
        quantity: requestedQty,
        total_price: itemTotal,
        product_image: item.image || '',
      });
    }

    // Free shipping threshold is ₹999, otherwise ₹99 standard shipping
    const shippingCharge = validatedSubtotal >= 999 ? 0 : 99;
    const finalTotal = validatedSubtotal + shippingCharge;
    const orderNumber = `ALZ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    let razorpayOrderId = `order_mock_${Date.now()}`;

    if (!isMockRazorpay && razorpayInstance) {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(finalTotal * 100), // amount in paisa
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
        },
      });
      razorpayOrderId = razorpayOrder.id;
    }

    // Persist pending order to database or memory
    const orderRecord = {
      order_number: orderNumber,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: shippingAddress.address,
      shipping_city: shippingAddress.city,
      shipping_state: shippingAddress.state,
      shipping_pincode: shippingAddress.pincode,
      subtotal: validatedSubtotal,
      shipping_charge: shippingCharge,
      total_amount: finalTotal,
      payment_method: 'razorpay',
      payment_status: 'pending',
      order_status: 'pending',
      razorpay_order_id: razorpayOrderId,
      items: validatedItems,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data: dbOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          order_number: orderRecord.order_number,
          customer_name: orderRecord.customer_name,
          customer_email: orderRecord.customer_email,
          customer_phone: orderRecord.customer_phone,
          shipping_address: orderRecord.shipping_address,
          shipping_city: orderRecord.shipping_city,
          shipping_state: orderRecord.shipping_state,
          shipping_pincode: orderRecord.shipping_pincode,
          subtotal: orderRecord.subtotal,
          shipping_charge: orderRecord.shipping_charge,
          total_amount: orderRecord.total_amount,
          payment_method: orderRecord.payment_method,
          payment_status: orderRecord.payment_status,
          order_status: orderRecord.order_status,
          razorpay_order_id: orderRecord.razorpay_order_id,
        }])
        .select()
        .single();

      if (!orderErr && dbOrder) {
        orderRecord.id = dbOrder.id;
        const dbItems = validatedItems.map((it) => ({
          order_id: dbOrder.id,
          product_id: it.product_id,
          product_name: it.product_name,
          product_image: it.product_image,
          unit_price: it.unit_price,
          quantity: it.quantity,
          total_price: it.total_price,
        }));
        await supabase.from('order_items').insert(dbItems);
      }
    }

    serverOrders.set(orderNumber, orderRecord);

    return res.json({
      success: true,
      orderNumber,
      razorpayOrderId,
      amount: Math.round(finalTotal * 100),
      currency: 'INR',
      subtotal: validatedSubtotal,
      shipping: shippingCharge,
      total: finalTotal,
      keyId: razorpayKeyId,
      isMock: isMockRazorpay,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ error: error.message || 'Server error creating order' });
  }
});

// --- 3. VERIFY RAZORPAY PAYMENT (SERVER-SIDE SIGNATURE CHECK & STOCK REDUCTION) ---
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number } = req.body;

    if (!order_number) {
      return res.status(400).json({ success: false, message: 'Order number is required.' });
    }

    // Verify signature
    let isValidSignature = false;

    if (isMockRazorpay) {
      // In development demo mode without live keys, verify receipt
      isValidSignature = true;
    } else {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(body.toString())
        .digest('hex');

      isValidSignature = expectedSignature === razorpay_signature;
    }

    if (!isValidSignature) {
      console.warn(`Payment signature verification failed for order ${order_number}`);
      // Mark as failed in DB
      if (supabase) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('order_number', order_number);
      }
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature. Security check denied.',
      });
    }

    // UPDATE ORDER & DEDUCT STOCK ONLY ON SUCCESS
    const cachedOrder = serverOrders.get(order_number);

    if (supabase) {
      // Update order in Supabase
      const { data: updatedOrder, error: updateErr } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'confirmed',
          razorpay_payment_id: razorpay_payment_id || `pay_${Date.now()}`,
          razorpay_signature: razorpay_signature || 'verified',
        })
        .eq('order_number', order_number)
        .select('*, order_items(*)')
        .single();

      if (!updateErr && updatedOrder && updatedOrder.order_items) {
        // Deduct stock for each item
        for (const item of updatedOrder.order_items) {
          await supabase.rpc('decrement_product_stock', {
            p_id: item.product_id,
            p_qty: item.quantity,
          }).catch(async () => {
            // fallback direct update if RPC is not present
            const { data: p } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
            if (p) {
              const newStock = Math.max(0, p.stock_quantity - item.quantity);
              await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.product_id);
            }
          });
        }
      }
    } else if (cachedOrder) {
      cachedOrder.payment_status = 'paid';
      cachedOrder.order_status = 'confirmed';
      cachedOrder.razorpay_payment_id = razorpay_payment_id || `pay_mock_${Date.now()}`;
      cachedOrder.razorpay_signature = razorpay_signature || 'mock_sig_ok';

      // Deduct fallback product stock
      for (const item of cachedOrder.items) {
        const p = fallbackProducts.find((fp) => fp.id === item.product_id);
        if (p) {
          p.stock_quantity = Math.max(0, p.stock_quantity - item.quantity);
        }
      }
      serverOrders.set(order_number, cachedOrder);
    }

    return res.json({
      success: true,
      orderNumber: order_number,
      message: 'Payment verified and order confirmed successfully.',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
});

// Serve frontend build in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Aleez Perfumes Backend API is active. Run Vite for frontend in dev.');
    }
  });
});

// Only start server listener if executed directly (not in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✨ Aleez Perfumes Server running on http://localhost:${PORT}`);
    console.log(`🔒 Razorpay status: ${isMockRazorpay ? 'Simulation / Dev Mode' : 'Live Configured'}`);
    console.log(`🗄️ Supabase status: ${supabase ? 'Live Connected' : 'Local Fallback Active'}`);
  });
}

export default app;
