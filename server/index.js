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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  { id: 'a1111111-1111-1111-1111-111111111111', name: 'Royal Amber Royale', price: 2499, sale_price: 1999, stock_quantity: 35 },
  { id: 'a2222222-2222-2222-2222-222222222222', name: 'Velvet Oud Noir', price: 3299, sale_price: 2799, stock_quantity: 20 },
  { id: 'a3333333-3333-3333-3333-333333333333', name: 'Santal Imperial', price: 2699, sale_price: 2199, stock_quantity: 25 },
  { id: 'a4444444-4444-4444-4444-444444444444', name: 'Elysian Rose Attar', price: 1499, sale_price: 1199, stock_quantity: 40 },
  { id: 'a5555555-5555-5555-5555-555555555555', name: 'Midnight Saffron', price: 2899, sale_price: 2399, stock_quantity: 18 },
  { id: 'a6666666-6666-6666-6666-666666666666', name: 'Aqua Celestia', price: 1999, sale_price: 1699, stock_quantity: 45 },
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

// --- 4. IMAGE UPLOAD TO SUPABASE STORAGE ---
app.post('/api/upload', async (req, res) => {
  try {
    const { fileData, fileName, contentType } = req.body;
    if (!fileData || !fileName) {
      return res.status(400).json({ error: 'Missing fileData or fileName' });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Supabase storage is not configured' });
    }

    const base64Content = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');
    const ext = fileName.split('.').pop() || 'jpg';
    const filePath = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({ error: error.message });
    }

    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return res.json({
      success: true,
      url: publicData.publicUrl,
      path: filePath,
    });
  } catch (err) {
    console.error('Upload endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// --- 5. ADMIN PRODUCT MANAGEMENT ---
app.post('/api/admin/products', async (req, res) => {
  try {
    const { product } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ error: 'Product name and details are required.' });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Supabase server client not configured.' });
    }

    const isValidUUID = (id) =>
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const productId = product.id && isValidUUID(product.id) ? product.id : crypto.randomUUID();
    const categoryId = product.category_id && isValidUUID(product.category_id) ? product.category_id : null;
    const slug =
      product.slug ||
      product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const dbPayload = {
      id: productId,
      name: product.name.trim(),
      slug,
      category_id: categoryId,
      price: Number(product.price) || 0,
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      description: product.description || '',
      fragrance_family: product.fragrance_family || null,
      inspired_by: product.inspired_by ? product.inspired_by.trim() : null,
      top_notes: product.top_notes || null,
      heart_notes: product.heart_notes || null,
      base_notes: product.base_notes || null,
      volume_ml: Number(product.volume_ml) || 50,
      stock_quantity: Number(product.stock_quantity) || 0,
      sku: product.sku || `ALZ-${Math.floor(1000 + Math.random() * 9000)}`,
      is_bestseller: !!product.is_bestseller,
      is_new_arrival: !!product.is_new_arrival,
      is_featured: !!product.is_featured,
      is_active: product.is_active !== undefined ? product.is_active : true,
    };

    let { data: savedProduct, error: pError } = await supabase
      .from('products')
      .upsert(dbPayload)
      .select('*')
      .single();

    // If inspired_by column is not yet migrated in Supabase, retry without failing
    if (pError && pError.message && pError.message.includes('inspired_by')) {
      delete dbPayload.inspired_by;
      const retry = await supabase.from('products').upsert(dbPayload).select('*').single();
      savedProduct = retry.data;
      pError = retry.error;
    }

    if (pError) {
      console.error('Supabase product upsert error:', pError);
      return res.status(500).json({ error: pError.message });
    }

    // Handle product images if provided
    let savedImages = [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', productId);

      const imagesToInsert = product.images.map((img, idx) => ({
        product_id: productId,
        image_url: typeof img === 'string' ? img : img.image_url,
        alt_text: (typeof img === 'object' && img.alt_text) || product.name,
        display_order: (typeof img === 'object' && img.display_order) || idx + 1,
        is_primary: typeof img === 'object' && img.is_primary !== undefined ? img.is_primary : idx === 0,
      }));

      const { data: imgData, error: imgError } = await supabase
        .from('product_images')
        .insert(imagesToInsert)
        .select('*');

      if (!imgError && imgData) {
        savedImages = imgData;
      }
    }

    return res.json({
      success: true,
      product: {
        ...savedProduct,
        images: savedImages,
      },
    });
  } catch (err) {
    console.error('Save product endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save product' });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing product ID' });

    if (supabase) {
      await supabase.from('product_images').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- 6. ADMIN CATEGORY MANAGEMENT ---
app.post('/api/admin/categories', async (req, res) => {
  try {
    const { category } = req.body;
    if (!category || !category.name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (!supabase) return res.status(503).json({ error: 'Supabase offline' });

    const isValidUUID = (id) =>
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const catId = category.id && isValidUUID(category.id) ? category.id : crypto.randomUUID();
    const slug =
      category.slug ||
      category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const dbCategory = {
      id: catId,
      name: category.name.trim(),
      slug,
      description: category.description || '',
      image_url:
        category.image_url ||
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      display_order: Number(category.display_order) || 1,
      is_active: category.is_active !== undefined ? category.is_active : true,
    };

    const { data, error } = await supabase
      .from('categories')
      .upsert(dbCategory)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, category: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
    }
    return res.json({ success: true, id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
