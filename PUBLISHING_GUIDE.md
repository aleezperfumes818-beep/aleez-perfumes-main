# 🚀 Aleez Perfumes — Production Publishing & Deployment Guide

This document is your step-by-step guide to take **Aleez Perfumes** from development to a live, publicly accessible luxury ecommerce store accepting real payments into your bank account.

---

## 📋 Checklist Overview

1. [Set up Production Supabase Database](#1-set-up-production-supabase-database)
2. [Get Razorpay Live Production Keys](#2-get-razorpay-live-production-keys)
3. [Push Code to GitHub](#3-push-code-to-github)
4. [Deploy to Render / Railway (Recommended One-Click Host)](#4-deploy-to-render-recommended)
5. [Connect Custom Domain (e.g., aleezperfumes.com) & SSL](#5-connect-your-custom-domain)
6. [Run Real ₹1 Test Transaction](#6-run-real-test-transaction)

---

## 1. Set Up Production Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `aleez-perfumes-db`.
3. Choose your database password and select **South Asia (Mumbai)** for optimal speed in India.
4. Once the project finishes provisioning:
   - Navigate to **SQL Editor** in the left menu.
   - Open and copy the contents of `supabase/schema.sql` from your project folder.
   - Click **Run** to execute the schema (creates tables, RLS policies, triggers, and storage bucket).
   - Next, open and copy `supabase/seed.sql` and click **Run** to load the initial fragrance catalog.
5. In Supabase, go to **Project Settings > API**:
   - Copy **Project URL** (`https://xyz.supabase.co`)
   - Copy **anon public** key
   - Copy **service_role** secret key (keep confidential)

---

## 2. Get Razorpay Live Production Keys

1. Sign up / Log in to [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Complete your **Business KYC**:
   - Provide business name (Aleez Perfumes), PAN, GST (if registered), and the Indian bank account where customer payments will be deposited.
3. Once activated:
   - Toggle from **Test Mode** to **Live Mode** in the top header.
   - Go to **Account & Settings > API Keys**.
   - Click **Generate Live Key**.
   - Copy your:
     - `Key ID` (looks like `rzp_live_xxxxxxxxxxxxxx`)
     - `Key Secret` (looks like `xxxxxxxxxxxxxxxxxxxxxxxx`)

---

## 3. Push Code to GitHub

Open a terminal or command prompt in your project folder:

```bash
git init
git add .
git commit -m "Aleez Perfumes Production Release"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/aleez-perfumes.git
git push -u origin main
```

*(Note: `.env` is automatically in `.gitignore` so your secret keys won't be pushed publicly).*

---

## 4. Deploy to Render (Recommended)

[Render.com](https://render.com) is the easiest platform because it hosts the Express backend and React frontend together in one place with automatic free SSL:

1. Sign up at [https://render.com](https://render.com) with your GitHub account.
2. Click **New + > Web Service**.
3. Select your `aleez-perfumes` repository.
4. Render will detect the included `render.yaml` automatically, or configure manually:
   - **Name**: `aleez-perfumes`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `RAZORPAY_KEY_ID`: Your `rzp_live_...` Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Secret
   - `VITE_RAZORPAY_KEY_ID`: Your `rzp_live_...` Key ID
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
6. Click **Create Web Service**. Render will build and launch your boutique in ~2 minutes with a live URL like `https://aleez-perfumes.onrender.com`.

---

## 5. Connect Your Custom Domain

1. Buy your domain (e.g. `aleezperfumes.com` or `aleezparfums.in`) on GoDaddy, Namecheap, or Hostinger.
2. In Render, go to **Settings > Custom Domains** and add `aleezperfumes.com` and `www.aleezperfumes.com`.
3. In your DNS provider (GoDaddy / Namecheap):
   - Add a `CNAME` record: Host `www` → points to `aleez-perfumes.onrender.com`
   - Add an `A` record or `ALIAS` for `@` pointing to Render's IP address (shown in Render's dashboard).
4. Render automatically provisions a free SSL Certificate (HTTPS) within ~10 minutes.

---

## 6. Run Real ₹1 Test Transaction

To verify the live pipeline:
1. Log into your Admin Dashboard (`/admin`) and edit a product or create a temporary "Test Sample" fragrance priced at ₹1.
2. Go to the public store, add it to cart, and checkout with your own UPI app or credit card.
3. Verify:
   - Razorpay modal opens with UPI options.
   - Payment succeeds.
   - Green confetti and Order Confirmation page appear.
   - The ₹1 appears in your Razorpay Dashboard under **Transactions** with settlement to your bank account.
   - The order appears in your Admin Portal under **Orders** with full client coordinates.
4. Delete or unpublish the ₹1 test sample product.

Your store is now fully live and accepting orders! 🎉
