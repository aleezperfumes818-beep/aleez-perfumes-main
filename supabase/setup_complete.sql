-- ==============================================================================
-- ALEEZ PERFUMES - PRODUCTION DATABASE SCHEMA FOR SUPABASE
-- Luxury Perfume E-commerce Database Structure
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
    description TEXT NOT NULL,
    fragrance_family TEXT,              -- e.g. Oriental Woody, Floral Amber, Fresh Citrus
    top_notes TEXT,                     -- e.g. Bergamot, Saffron, Pink Pepper
    heart_notes TEXT,                   -- e.g. Damask Rose, Amberwood, Jasmine
    base_notes TEXT,                    -- e.g. Agarwood (Oud), Vanilla, Musk
    volume_ml INTEGER DEFAULT 50 CHECK (volume_ml > 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT UNIQUE,
    is_bestseller BOOLEAN DEFAULT false NOT NULL,
    is_new_arrival BOOLEAN DEFAULT false NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.9 NOT NULL,
    review_count INTEGER DEFAULT 18 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    shipping_charge NUMERIC(10,2) DEFAULT 0 NOT NULL CHECK (shipping_charge >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT DEFAULT 'razorpay' NOT NULL,
    payment_status payment_status_type DEFAULT 'pending' NOT NULL,
    order_status order_status_type DEFAULT 'pending' NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- 8. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 9. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);

-- 10. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. HELPER FUNCTIONS & TRIGGERS
-- Function to check if the current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at auto-trigger
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update their own, Admins can view all
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Categories: Anyone can read active categories, Admins can manage all
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products: Anyone can read active products, Admins can manage all
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin());

-- Product Images: Anyone can view, Admins can manage
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (public.is_admin());

-- Orders: Users can read their own orders; Admins can read & update all; Anyone can insert an order (checkout)
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items: Users can view their own items; Admins can view all; Anyone can insert
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Wishlist: Authenticated users can manage their own wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Store Settings: Anyone can read, only Admins can update
CREATE POLICY "Anyone can read store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage store settings" ON public.store_settings FOR ALL USING (public.is_admin());

-- 13. STORAGE BUCKET CONFIGURATION (for Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
CREATE POLICY "Public Access to product-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload to product-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin Update to product-images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin Delete from product-images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin());
-- ==============================================================================
-- ALEEZ PERFUMES - SEED DATA
-- Default Categories, Store Settings, and Initial Luxury Perfumes
-- ==============================================================================

-- 1. STORE SETTINGS
INSERT INTO public.store_settings (key, value)
VALUES 
('general', '{
    "brand_name": "Aleez Perfumes",
    "tagline": "Discover Your Signature Scent",
    "description": "Premium fragrances crafted for every moment. Haute perfumery and artisanal scents.",
    "phone": "+91 9345526905",
    "whatsapp": "+919345526905",
    "email": "aleez.perfumes818@gmail.com",
    "instagram": "@aleez.parfums",
    "instagram_url": "https://instagram.com/aleez.parfums",
    "currency": "INR",
    "currency_symbol": "₹",
    "free_shipping_threshold": 999,
    "standard_shipping_fee": 99,
    "announcement_bar": "Complimentary luxury shipping across India on all orders above ₹999",
    "is_store_open": true
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active)
VALUES
('c1111111-1111-1111-1111-111111111111', 'Eau de Parfum', 'eau-de-parfum', 'Exquisite concentrated spray fragrances with exceptional longevity and projection.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', 1, true),
('c2222222-2222-2222-2222-222222222222', 'Artisanal Attars', 'artisanal-attars', 'Non-alcoholic traditional and modern perfume oils blended to absolute perfection.', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80', 2, true),
('c3333333-3333-3333-3333-333333333333', 'Pure Oud Collection', 'pure-oud-collection', 'Rare and authentic oud extractions aged with patience and mastered by artisan distillers.', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', 3, true),
('c4444444-4444-4444-4444-444444444444', 'Oriental & Woody', 'oriental-woody', 'Rich, deep, and magnetic compositions featuring aged sandalwood, amber, and spice.', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80', 4, true),
('c5555555-5555-5555-5555-555555555555', 'Floral & Fresh', 'floral-fresh', 'Crisp morning blossoms, uplifting Italian citruses, and ethereal clean musks.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', 5, true),
('c6666666-6666-6666-6666-666666666666', 'Luxury Gift Sets', 'luxury-gift-sets', 'Bespoke presentation boxes crafted for the discerning connoisseur.', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80', 6, true)
ON CONFLICT (id) DO NOTHING;

-- 3. INITIAL DEMO PRODUCTS
INSERT INTO public.products (
    id, name, slug, category_id, price, sale_price, description, 
    fragrance_family, top_notes, heart_notes, base_notes, volume_ml, 
    stock_quantity, sku, is_bestseller, is_new_arrival, is_featured, is_active, rating, review_count
) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'Royal Amber Royale',
    'royal-amber-royale',
    'c4444444-4444-4444-4444-444444444444',
    2499.00,
    1999.00,
    'Royal Amber Royale is a coronation of warm, resinous golden amber and spicy bergamot. Layered with velvety vanilla, tonka bean, and creamy Indian sandalwood, it leaves an unforgettable trail of royal sophistication.',
    'Oriental Amber Woody',
    'Calabrian Bergamot, Pink Peppercorn, Cardamom',
    'Golden Amber Resin, Bulgarian Rose, Patchouli',
    'Madagascar Vanilla, Creamy Sandalwood, Tonka Bean',
    50,
    35,
    'ALZ-RAR-050',
    true,
    false,
    true,
    true,
    4.9,
    42
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Velvet Oud Noir',
    'velvet-oud-noir',
    'c3333333-3333-3333-3333-333333333333',
    3299.00,
    2799.00,
    'An intoxicating blend of wild Cambodian agarwood and smoky leather, wrapped in mysterious dark damask rose. Velvet Oud Noir radiates nocturnal power and opulent luxury.',
    'Dark Woody Oud',
    'Saffron, Cinnamon Bark, Nutmeg',
    'Damask Rose, Incense, Cedarwood',
    'Cambodian Agarwood (Oud), Black Leather, Ambergris',
    50,
    20,
    'ALZ-VON-050',
    true,
    true,
    true,
    true,
    5.0,
    58
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Santal Imperial',
    'santal-imperial',
    'c4444444-4444-4444-4444-444444444444',
    2699.00,
    2199.00,
    'A tranquil masterpiece centered on sustainably harvested Mysore sandalwood, laced with soothing cardamom, powdered iris, and subtle hints of violet leaf.',
    'Woody Floral Musk',
    'Cardamom, Violet Leaves, Papyrus',
    'Florentine Iris, White Cedar, Amber',
    'Mysore Sandalwood, Cashmere Wood, Soft Musk',
    50,
    25,
    'ALZ-SIM-050',
    false,
    true,
    true,
    true,
    4.8,
    29
),
(
    'a4444444-4444-4444-4444-444444444444',
    'Elysian Rose Attar',
    'elysian-rose-attar',
    'c2222222-2222-2222-2222-222222222222',
    1499.00,
    1199.00,
    'Pure concentrated botanical perfumed oil distilled from freshly handpicked Taif roses blended into an aged sandalwood base. 100% alcohol-free with 24-hour lasting potency.',
    'Pure Floral Oil',
    'Taif Rose Petals, Dewy Greens',
    'Damascena Absolute, Geranium Bourbon',
    'White Amber Oil, Aged Sandalwood Foundation',
    12,
    40,
    'ALZ-ERA-012',
    true,
    false,
    false,
    true,
    4.9,
    63
),
(
    'a5555555-5555-5555-5555-555555555555',
    'Midnight Saffron',
    'midnight-saffron',
    'c1111111-1111-1111-1111-111111111111',
    2899.00,
    2399.00,
    'The golden spice of Kashmir saffron collides with spicy black pepper, sweet tobacco flower, and smoked bourbon vanilla. A magnetic evening fragrance designed to turn heads.',
    'Spicy Gourmand Leather',
    'Kashmiri Saffron, Black Pepper, Coriander',
    'Tobacco Blossom, Cocoa Butter, Dried Plum',
    'Bourbon Vanilla, Leather, Guaiac Wood',
    50,
    18,
    'ALZ-MDS-050',
    false,
    true,
    true,
    true,
    4.7,
    31
),
(
    'a6666666-6666-6666-6666-666666666666',
    'Aqua Celestia',
    'aqua-celestia',
    'c5555555-5555-5555-5555-555555555555',
    1999.00,
    1699.00,
    'A crisp, invigorating breeze captured in crystal glass. Bright Sicilian lime, sparkling sea salt, and refreshing mint flow into sun-drenched neroli and mineral driftwood.',
    'Aquatic Citrus Floral',
    'Sicilian Lime, Sea Salt, Spearmint',
    'Tunisian Neroli, Hedione, Petitgrain',
    'Driftwood, White Musk, Haitian Vetiver',
    50,
    45,
    'ALZ-AQC-050',
    false,
    false,
    false,
    true,
    4.8,
    22
)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCT IMAGES
INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', 'Royal Amber Royale Luxury Bottle', 1, true),
('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80', 'Royal Amber Royale Packaging', 2, false),

('a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', 'Velvet Oud Noir Luxury Flacon', 1, true),
('a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', 'Velvet Oud Noir Detail', 2, false),

('a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80', 'Santal Imperial Bottle', 1, true),

('a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80', 'Elysian Rose Artisanal Attar Bottle', 1, true),

('a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80', 'Midnight Saffron Flacon', 1, true),

('a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80', 'Aqua Celestia Bottle', 1, true)
ON CONFLICT (id) DO NOTHING;
