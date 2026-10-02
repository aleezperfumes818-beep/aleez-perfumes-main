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
    'p1111111-1111-1111-1111-111111111111',
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
    'p2222222-2222-2222-2222-222222222222',
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
    'p3333333-3333-3333-3333-333333333333',
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
    'p4444444-4444-4444-4444-444444444444',
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
    'p5555555-5555-5555-5555-555555555555',
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
    'p6666666-6666-6666-6666-666666666666',
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
('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', 'Royal Amber Royale Luxury Bottle', 1, true),
('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80', 'Royal Amber Royale Packaging', 2, false),

('p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', 'Velvet Oud Noir Luxury Flacon', 1, true),
('p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', 'Velvet Oud Noir Detail', 2, false),

('p3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80', 'Santal Imperial Bottle', 1, true),

('p4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80', 'Elysian Rose Artisanal Attar Bottle', 1, true),

('p5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80', 'Midnight Saffron Flacon', 1, true),

('p6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80', 'Aqua Celestia Bottle', 1, true)
ON CONFLICT (id) DO NOTHING;
