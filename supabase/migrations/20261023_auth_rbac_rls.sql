-- ==============================================================================
-- ALEEZ PERFUMES - PRODUCTION AUTHENTICATION, RBAC & RLS POLICIES MIGRATION
-- Migration Date: 2026-10-23
-- Idempotent, Non-Destructive Production Migration
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ROLES ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role NOT NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. SECURE IS_ADMIN FUNCTION
-- Evaluates directly against database profiles with search_path secured
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. SECURE NEW USER PROFILE TRIGGER
-- CRITICAL SECURITY FIX: Unconditionally assign 'customer' role.
-- Never trust raw_user_meta_data from client sign-up requests.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'customer'::user_role -- STRICT: Public sign-ups are ALWAYS customer role
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
        phone = CASE WHEN profiles.phone IS NULL OR profiles.phone = '' THEN EXCLUDED.phone ELSE profiles.phone END,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. IMMUTABLE ROLE PROTECTION TRIGGER
-- Prevents clients from updating their own 'role' column via API updates.
CREATE OR REPLACE FUNCTION public.enforce_profile_role_security()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.role IS DISTINCT FROM OLD.role) THEN
        -- Only existing admins or service_role can modify the role column
        IF NOT (public.is_admin() OR (COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role')) THEN
            RAISE EXCEPTION 'Access Denied: Only administrators can modify user roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_role_security();

-- 7. SECURE ADMIN PROMOTION FUNCTION (For Database Owner in Supabase SQL Editor)
-- Allows promoting a verified user to admin safely without opening public endpoints.
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email TEXT)
RETURNS VOID AS $$
DECLARE
    v_clean_email TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(target_email));
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = v_clean_email) THEN
        RAISE EXCEPTION 'User with email % does not exist in auth.users.', v_clean_email;
    END IF;

    UPDATE public.profiles
    SET role = 'admin'::user_role, updated_at = timezone('utc'::text, now())
    WHERE LOWER(email) = v_clean_email;

    RAISE NOTICE 'User % successfully promoted to administrator.', v_clean_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing overlapping policies to prevent conflicts
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
    DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
    DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
    DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
    DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
    DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
    DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
    DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
    DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
    DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
    DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
    DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
    DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist;
    DROP POLICY IF EXISTS "Users can add to wishlist" ON public.wishlist;
    DROP POLICY IF EXISTS "Users can delete from wishlist" ON public.wishlist;
    DROP POLICY IF EXISTS "Anyone can read store settings" ON public.store_settings;
    DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;
EXCEPTION WHEN undefined_table THEN null;
END $$;

-- --- PROFILES POLICIES ---
-- Customers can view only their own profile; admins can view all profiles
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

-- Customers can update only their own profile details (role protected by trigger)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());

-- System or admin full control
CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL 
USING (public.is_admin());

-- --- CATEGORIES POLICIES ---
CREATE POLICY "Anyone can view active categories" 
ON public.categories FOR SELECT 
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (public.is_admin());

-- --- PRODUCTS POLICIES ---
-- Public visitors can read active products; Admins can read all and perform mutations
CREATE POLICY "Anyone can view active products" 
ON public.products FOR SELECT 
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
USING (public.is_admin());

-- --- PRODUCT IMAGES POLICIES ---
CREATE POLICY "Anyone can view product images" 
ON public.product_images FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage product images" 
ON public.product_images FOR ALL 
USING (public.is_admin());

-- --- ORDERS POLICIES ---
-- Customers can read ONLY their own orders; Admins can read all orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

-- Orders can be inserted during checkout (associating authenticated user_id if present)
CREATE POLICY "Anyone can create order" 
ON public.orders FOR INSERT 
WITH CHECK (
    user_id IS NULL OR 
    auth.uid() = user_id OR 
    public.is_admin()
);

-- Only verified admins can update order status/tracking/payment
CREATE POLICY "Admins can update orders" 
ON public.orders FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete orders" 
ON public.orders FOR DELETE 
USING (public.is_admin());

-- --- ORDER ITEMS POLICIES ---
-- Customers can read items belonging only to their own orders; Admins can read all
CREATE POLICY "Users can view own order items" 
ON public.order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
);

CREATE POLICY "Anyone can create order items" 
ON public.order_items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL OR public.is_admin())
    )
);

CREATE POLICY "Admins can manage order items" 
ON public.order_items FOR ALL 
USING (public.is_admin());

-- --- WISHLIST POLICIES ---
CREATE POLICY "Users can view own wishlist" 
ON public.wishlist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" 
ON public.wishlist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from wishlist" 
ON public.wishlist FOR DELETE 
USING (auth.uid() = user_id);

-- --- STORE SETTINGS POLICIES ---
CREATE POLICY "Anyone can read store settings" 
ON public.store_settings FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage store settings" 
ON public.store_settings FOR ALL 
USING (public.is_admin());

-- 9. STORAGE BUCKET RLS POLICIES (product-images)
DO $$ BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Upload to product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Update to product-images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Delete from product-images" ON storage.objects;

    CREATE POLICY "Public Access to product-images" ON storage.objects
        FOR SELECT USING (bucket_id = 'product-images');

    CREATE POLICY "Admin Upload to product-images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

    CREATE POLICY "Admin Update to product-images" ON storage.objects
        FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin());

    CREATE POLICY "Admin Delete from product-images" ON storage.objects
        FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin());
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Storage policies skipped: %', SQLERRM;
END $$;
