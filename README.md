# ALEEZ PERFUMES — Luxury E-Commerce Platform

A production-ready, mobile-first luxury perfume e-commerce web application engineered for **ALEEZ PERFUMES**.

---

## 1. Brand Details
* **Brand Name**: Aleez Perfumes
* **WhatsApp / Phone**: `+91 9345526905`
* **Email**: `aleez.perfumes818@gmail.com`
* **Instagram**: `@aleez.parfums` ([https://instagram.com/aleez.parfums](https://instagram.com/aleez.parfums))
* **Store Model**: Exclusively online luxury fragrance atelier (no physical storefront).
* **Payment Architecture**: Online Prepaid Payments via **Razorpay** exclusively (No COD).

---

## 2. Technology Stack & Architecture
* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
* **Design Aesthetic**: Luxury noir palette (Deep Black `#0A0A0A`, Charcoal `#121212`, Warm Gold `#D4AF37`, Ivory Cream), Cormorant Garamond serif headings, and clean modern body typography.
* **Database & Auth**: Supabase (PostgreSQL with Row Level Security, Storage Buckets, Triggers, and Auth)
* **Backend Server**: Node.js & Express (dedicated API server for Razorpay order generation, HMAC-SHA256 signature verification, server-side price & stock verification)
* **Resilient Dual-Mode Operation**: The application runs seamlessly out-of-the-box in development simulation mode, and connects automatically to Supabase and Razorpay as soon as live API credentials are configured in `.env`.

---

## 3. Key Features

### Customer Experience
* **Mobile-First Responsive Layout**: Optimized across 360px, 375px, 412px, tablets, and wide desktop screens with zero horizontal overflow.
* **Sticky Luxury Header**: Compact scroll transition, global search overlay, customer account access, wishlist counter, and cart badge.
* **Global Search Overlay**: Instant search matching fragrance names, category families, and olfactory notes (e.g. Oud, Taif Rose, Amber, Saffron, Vanilla).
* **Boutique Shop**:
  * Category filtering (Eau de Parfum, Artisanal Attars, Pure Oud, Oriental & Woody, Floral & Fresh, Gift Sets)
  * Filter by Bestsellers, New Arrivals, and Featured fragrances
  * Price range filter and multiple sorting modes (Price low-high, high-low, newest, ratings)
  * Quick View popup modal for instant note inspection and bag addition
* **Product Detail Pages**:
  * Multi-angle high-resolution image gallery with thumbnail preview
  * Dynamic Olfactory Pyramid (Top, Heart, and Base notes)
  * Real-time stock availability indicators ("Rare Batch: Only X left" or "In Stock")
  * Quantity selector with stock ceiling limits
  * "Add to Bag", "Instant Buy Now", and Wishlist toggle
  * Direct WhatsApp inquiry button with pre-filled fragrance name
  * "You May Also Like" curated recommendations
* **Shopping Bag & Slide-over Drawer**:
  * Real-time stock validation preventing orders exceeding inventory
  * Free Luxury Express Shipping progress tracker (threshold: ₹999)
  * Persistent storage across sessions
* **Secured Checkout**:
  * Single-page streamlined checkout collecting recipient coordinates
  * Complete server-side price validation (prices are verified on the server, not trusted from frontend)
  * Razorpay payment gateway integration with 256-bit encryption
* **Order Confirmation**: Celebratory confetti, order reference number, invoice breakdown, and direct "Track on WhatsApp" link.
* **Floating WhatsApp Concierge**: Fixed button (+91 9345526905) for instant scent consultations.

---

## 4. Protected Admin Dashboard (`/admin`)

Customers cannot access the admin portal. Accessible at `/admin` with Supabase authentication.

### Admin Dashboard Overview (`/admin`)
* **Live KPIs**: Total Sales (INR ₹), Total Orders, Paid Orders, Pending Orders, Low Stock Alerts, and Total Products in catalog.
* **Quick Navigation Tiles**: Add Product, Manage Products, Categories, Orders, and Settings.
* **Recent Orders Table**: Real-time overview of customer purchases.

### Product Management (`/admin/products`)
* Add, edit, delete, and duplicate fragrances.
* Multi-image uploads directly to Supabase Storage with preview and reordering (Set Primary).
* Configure pricing, sale pricing, volume (ML), SKU, and stock inventory.
* Define fragrance family and olfactory notes (Top, Heart, Base).
* Toggles for **Active / Inactive**, **Bestseller**, **New Arrival**, and **Featured**.

### Category Management (`/admin/categories`)
* Create, rename, edit cover images, reorder, and toggle visibility.
* All categories are database-driven (not hardcoded).

### Order Management (`/admin/orders`)
* Inspect customer contact details, phone, email, and shipping address.
* View purchased items, unit prices, and quantities.
* Inline status updater (`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` → `Cancelled`).
* Direct WhatsApp client communication link with pre-filled order status inquiry.

### Store Settings (`/admin/settings`)
* Brand name, tagline, description, and announcement bar.
* WhatsApp number, customer care email, and Instagram profile.
* Free shipping threshold and standard shipping fee.
* Store status toggle (Open / Closed).

---

## 5. Getting Started & Running Locally

### Prerequisites
* Node.js v18+ and npm installed

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Start the application
npm start
```
The application will launch at **`http://localhost:5000`**.

For development with Vite hot-reloading:
```bash
npm run dev
```

---

## 6. Default Admin Credentials (Development / Demo Mode)
When testing the `/admin` portal without live Supabase credentials:
* **Admin Portal URL**: `http://localhost:5000/admin`
* **Email**: `admin@aleezperfumes.com` (or `aleez.perfumes818@gmail.com`)
* **Password**: `AleezAdmin2026!`

---

## 7. Connecting Production Supabase & Razorpay

### 1. Database Setup
1. Log into your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. Copy and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Run the initial data seed script from [`supabase/seed.sql`](./supabase/seed.sql).
5. In Supabase Storage, verify that the `product-images` bucket exists with public read access.

### 2. Environment Variables Configuration
Update your `.env` file with your production keys:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_yourRazorpayKeyId
RAZORPAY_KEY_SECRET=yourRazorpaySecretKey
VITE_RAZORPAY_KEY_ID=rzp_live_yourRazorpayKeyId

# Server Configuration
PORT=5000
NODE_ENV=production
```

### 3. Promoting an Admin User in Supabase
In Supabase SQL Editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'aleez.perfumes818@gmail.com';
```

---

## 8. Security & Best Practices
* **No Secret Exposure**: Razorpay secret key and Supabase service role key reside strictly on the server (`server/index.js`).
* **Server-side Price Calculation**: All order subtotals and Razorpay amounts are derived by looking up product records on the server; prices transmitted from the client are never trusted.
* **Stock Decrementing**: Product stock is decremented only after successful HMAC-SHA256 signature verification.
* **RLS Policies**: Products and categories are publicly viewable when active; mutations are restricted to authenticated admins.

---

© 2026 Aleez Perfumes. All rights reserved.
