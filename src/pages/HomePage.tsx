import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Award,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  Eye,
  Check,
  Truck,
  Droplets,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Product, Category, HomepageContent } from '../types';
import { dbService } from '../lib/supabase';
import { initialHomepageContent } from '../lib/initialData';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

const pillarIcons: Record<string, React.FC<{ className?: string }>> = {
  Truck,
  Clock,
  Droplets,
  Shield,
  Award,
  Sparkles,
};

export const HomePage: React.FC = () => {
  const [content, setContent] = useState<HomepageContent>(initialHomepageContent);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSpotlightSize, setSelectedSpotlightSize] = useState<'50ml' | '100ml'>('50ml');
  const [spotlightAdded, setSpotlightAdded] = useState(false);
  const [selectedCustomNotes, setSelectedCustomNotes] = useState<string[]>(['Rich Oud & Amber']);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { formatPrice } = useSettings();
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay policy handled gracefully
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData, homeData] = await Promise.all([
          dbService.getProducts(),
          dbService.getCategories(),
          dbService.getHomepageContent(),
        ]);
        setProducts(prodData.filter((p) => p.is_active));
        setCategories(catData.filter((c) => c.is_active));
        if (homeData) {
          setContent(homeData);
        }
      } catch (err) {
        console.warn('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Spotlight product: selected product by ID, or Velvet Oud Noir, or first bestseller
  const spotlightProduct =
    (content.spotlight?.product_id ? products.find((p) => p.id === content.spotlight.product_id) : null) ||
    products.find((p) => p.slug === 'velvet-oud-noir') ||
    products.find((p) => p.is_bestseller) ||
    products[0];

  // Dynamic overrides for spotlight
  const spotlightName = content.spotlight?.custom_name || spotlightProduct?.name || 'Velvet Oud Noir';
  const spotlightCategory = content.spotlight?.custom_category || spotlightProduct?.category_name || 'Pure Extrait Collection';
  const spotlightInspiredBy = content.spotlight?.custom_inspired_by !== undefined
    ? content.spotlight.custom_inspired_by
    : (spotlightProduct?.inspired_by || '');
  const spotlightDescription = content.spotlight?.custom_description || spotlightProduct?.description || 'A majestic blend of aged Cambodian oud, spiced saffron, and smoky leather formulated at a potent 35% concentration.';
  const spotlightImage = content.spotlight?.custom_image_url || (spotlightProduct?.images && spotlightProduct.images[0]?.image_url) || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80';
  const spotlightPrice = content.spotlight?.custom_price || spotlightProduct?.price || 1499;
  const spotlightSalePrice = content.spotlight?.custom_sale_price ?? spotlightProduct?.sale_price;
  const topNotes = content.spotlight?.top_notes || spotlightProduct?.top_notes || 'Kashmiri Saffron, Cinnamon';
  const heartNotes = content.spotlight?.heart_notes || spotlightProduct?.heart_notes || 'Damask Rose, Frankincense';
  const baseNotes = content.spotlight?.base_notes || spotlightProduct?.base_notes || 'Cambodian Oud, Tuscan Leather';
  const concentrationText = content.spotlight?.concentration_text || '35% Extrait De Parfum';
  const bottleSizeText = content.spotlight?.bottle_size_text || '50 ML';
  const buttonText = content.spotlight?.button_text || 'Add To Cart';

  const handleAddSpotlightToCart = () => {
    const productToAdd: Product = spotlightProduct ? {
      ...spotlightProduct,
      name: spotlightName,
      price: spotlightPrice,
      sale_price: spotlightSalePrice ?? null,
      category_name: spotlightCategory,
      images: [{ id: 'spotlight-img', product_id: spotlightProduct.id, image_url: spotlightImage, is_primary: true, display_order: 0 }],
    } : {
      id: 'spotlight-product',
      name: spotlightName,
      slug: 'weekly-spotlight',
      category_id: 'cat-spotlight',
      category_name: spotlightCategory,
      price: spotlightPrice,
      sale_price: spotlightSalePrice ?? null,
      description: spotlightDescription,
      top_notes: topNotes,
      heart_notes: heartNotes,
      base_notes: baseNotes,
      volume_ml: 50,
      sku: 'ALZ-SPOTLIGHT',
      is_bestseller: true,
      is_new_arrival: false,
      is_featured: true,
      is_active: true,
      stock_quantity: 50,
      rating: 5.0,
      review_count: 1,
      images: [{ id: 'spotlight-img', product_id: 'spotlight-product', image_url: spotlightImage, is_primary: true, display_order: 0 }],
      created_at: new Date().toISOString(),
    };

    const res = addToCart(productToAdd, 1);
    if (res.success) {
      setSpotlightAdded(true);
      setIsCartOpen(true);
      setTimeout(() => setSpotlightAdded(false), 2000);
    }
  };

  const toggleCustomNote = (note: string) => {
    setSelectedCustomNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const bestsellers = products.filter((p) => p.is_bestseller).slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden bg-white text-black">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Clean Cinematic Video Banner - Minimal High Fashion)     */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-neutral-200 bg-black">
        {/* High-Definition Royalty-Free Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            key={content.hero.video_url || 'aleez-signature-video'}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            poster={content.hero.fallback_image_url}
            className="w-full h-full object-cover object-center scale-[1.08] origin-center transition-transform duration-1000 ease-out"
          >
            <source src={content.hero.video_url || '/videos/aleez-signature.mp4'} type="video/mp4" />
          </video>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 pointer-events-none" />
        </div>

        {/* Hero Content - Clean Headline (No floating eyebrow badges) */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pt-10">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-wide text-white leading-[1.08] animate-slide-up drop-shadow-xl">
            {content.hero.title_line1} <br />
            <span className="italic font-light text-neutral-200">{content.hero.title_line2}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed tracking-wide animate-fade-in drop-shadow">
            {content.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in">
            <Link
              to={content.hero.primary_btn_link || '/shop'}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs uppercase tracking-[0.22em] font-semibold rounded-sm transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <span>{content.hero.primary_btn_text}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={content.hero.secondary_btn_link || '/create-your-fragrance'}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white text-white hover:text-black border border-white text-xs uppercase tracking-[0.22em] font-semibold rounded-sm transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>{content.hero.secondary_btn_text}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ambient Video Control Badge */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-2.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-sm border border-neutral-700 shadow-xl text-white">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            title={isPlaying ? 'Pause video' : 'Play video'}
            className="p-1 hover:text-neutral-300 transition-colors focus:outline-none"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <span className="h-3 w-px bg-neutral-700" />
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-1 hover:text-neutral-300 transition-colors focus:outline-none"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-medium pl-1 hidden sm:inline">
            Aleez Studio
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>

        {/* Bottom subtle scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center space-y-2 opacity-70 text-white">
          <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-300">Scroll to explore</span>
          <div className="w-4 h-7 rounded-sm border border-neutral-400 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 bg-white rounded-sm animate-bounce" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FRAGRANCE OF THE WEEK (Fully Editable Dynamic Spotlight Section)       */}
      {/* ========================================================================= */}
      {content.spotlight.enabled !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl text-black">
              {content.spotlight.title || 'Fragrance of the Week'}
            </h2>
            <p className="text-sm text-neutral-600 font-light">
              {content.spotlight.subtitle || 'Our master perfumer’s featured creation of the week.'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Product Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm group">
                  <img
                    src={spotlightImage}
                    alt={spotlightName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 bg-black text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-sm shadow-sm">
                    Spotlight
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-neutral-200 flex items-center space-x-2 text-xs shadow-sm">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-black font-semibold">{concentrationText}</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-[10px] text-neutral-600 font-mono">{bottleSizeText}</span>
                  </div>
                </div>
              </div>

              {/* Product Details & Scent Profile */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 font-medium mb-1">
                    <span>{spotlightCategory}</span>
                    {spotlightInspiredBy && (
                      <>
                        <span>•</span>
                        <span>{spotlightInspiredBy.toLowerCase().startsWith('inspired by') ? spotlightInspiredBy : `Inspired by ${spotlightInspiredBy}`}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl text-black font-medium">
                    {spotlightName}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 font-light mt-3 leading-relaxed">
                    {spotlightDescription}
                  </p>
                </div>

                {/* Scent Notes Breakdown */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-black font-semibold">
                    Harmonic Note Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="border-l-2 border-black pl-3 py-0.5">
                      <span className="font-semibold text-black block">Top Notes</span>
                      <span className="text-neutral-600 font-light">
                        {topNotes}
                      </span>
                    </div>
                    <div className="border-l-2 border-black pl-3 py-0.5">
                      <span className="font-semibold text-black block">Heart Notes</span>
                      <span className="text-neutral-600 font-light">
                        {heartNotes}
                      </span>
                    </div>
                    <div className="border-l-2 border-black pl-3 py-0.5">
                      <span className="font-semibold text-black block">Base Notes</span>
                      <span className="text-neutral-600 font-light">
                        {baseNotes}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Longevity & Concentration Badges */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-800">
                  <span className="px-3 py-1 rounded-sm bg-neutral-100 text-black border border-neutral-200 font-medium flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-black" />
                    <span>All-Day Projection</span>
                  </span>
                  <span className="px-3 py-1 rounded-sm bg-neutral-100 text-black border border-neutral-200 font-medium flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-black" />
                    <span>{concentrationText}</span>
                  </span>
                  <span className="px-3 py-1 rounded-sm bg-neutral-100 text-black border border-neutral-200 font-medium flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>Small-Batch Bottled</span>
                  </span>
                </div>

                {/* Price & Size Selector */}
                <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-baseline space-x-3">
                    <span className="font-serif text-3xl font-semibold text-black">
                      {formatPrice(spotlightSalePrice || spotlightPrice)}
                    </span>
                    {spotlightSalePrice && spotlightPrice > spotlightSalePrice && (
                      <span className="text-base text-neutral-400 line-through font-mono">
                        {formatPrice(spotlightPrice)}
                      </span>
                    )}
                    {spotlightSalePrice && spotlightPrice > spotlightSalePrice && (
                      <span className="text-xs text-neutral-900 font-medium uppercase tracking-wider border border-neutral-300 px-2 py-0.5 rounded-sm">
                        Save ₹{spotlightPrice - spotlightSalePrice}
                      </span>
                    )}
                  </div>

                  {/* Size buttons */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider text-neutral-600 font-medium">Size:</span>
                    <button
                      onClick={() => setSelectedSpotlightSize('50ml')}
                      className={`px-3 py-1 text-xs rounded-sm border font-medium transition-all ${
                        selectedSpotlightSize === '50ml'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                      }`}
                    >
                      50 ml
                    </button>
                    <button
                      onClick={() => setSelectedSpotlightSize('100ml')}
                      className={`px-3 py-1 text-xs rounded-sm border font-medium transition-all ${
                        selectedSpotlightSize === '100ml'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                      }`}
                    >
                      100 ml
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={handleAddSpotlightToCart}
                    className="w-full sm:flex-1 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {spotlightAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{buttonText} • {selectedSpotlightSize}</span>
                      </>
                    )}
                  </button>

                  {spotlightProduct && (
                    <button
                      onClick={() => setQuickViewProduct(spotlightProduct)}
                      className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-neutral-100 text-black border border-neutral-300 hover:border-black text-xs uppercase tracking-[0.15em] font-medium rounded-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4 text-black" />
                      <span>Quick View</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. ATELIER SPECIALTIES (4 Clean High-Fashion Cards)                        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl text-black">
            {content.specialties.title}
          </h2>
          <p className="text-sm text-neutral-600 font-light">
            {content.specialties.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.specialties.cards.map((card) => (
            <Link
              key={card.id}
              to={card.link || '/shop'}
              className="group relative aspect-[3/4] rounded-sm overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col justify-end p-6"
            >
              <img
                src={card.image_url}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="relative z-10 text-white space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-mono">
                  {card.subtitle}
                </span>
                <h3 className="font-serif text-2xl font-normal group-hover:text-neutral-200 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-neutral-300 font-light line-clamp-2">
                  {card.description}
                </p>
                <div className="pt-2 text-xs uppercase tracking-widest text-white flex items-center space-x-1 font-medium">
                  <span>Explore Scent</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BRAND INSPIRATIONS & BESTSELLERS                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-neutral-200">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-black">
              {content.bestsellers_section.title}
            </h2>
            <p className="text-sm text-neutral-600 font-light mt-1">
              {content.bestsellers_section.subtitle}
            </p>
          </div>
          <Link
            to="/shop?filter=bestseller"
            className="mt-4 sm:mt-0 text-xs uppercase tracking-widest text-black hover:text-neutral-600 flex items-center space-x-1.5 transition-colors font-semibold"
          >
            <span>{content.bestsellers_section.cta_text}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CUSTOM PERFUMERY STUDIO                                                */}
      {/* ========================================================================= */}
      {content.bespoke_studio.enabled !== false && (
        <section id="custom-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black rounded-md p-8 sm:p-12 lg:p-16 border border-neutral-800 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide text-white leading-tight">
                {content.bespoke_studio.title_line1} <br />
                <span className="italic text-neutral-300">{content.bespoke_studio.title_line2}</span>
              </h2>

              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                {content.bespoke_studio.description}
              </p>

              {/* Interactive Scent Notes Selector */}
              <div className="pt-4 space-y-3">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium block">
                  Select Notes You Love:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    'Rich Oud & Amber',
                    'Calabrian Bergamot & Citrus',
                    'Bulgarian Damask Rose',
                    'Madagascar Vanilla & Tonka',
                    'Smoked Leather & Tobacco',
                    'Creamy Mysore Sandalwood',
                    'Cardamom & Warm Saffron',
                  ].map((note) => {
                    const isSelected = selectedCustomNotes.includes(note);
                    return (
                      <button
                        key={note}
                        onClick={() => toggleCustomNote(note)}
                        className={`px-3 py-1.5 rounded-sm text-xs transition-all flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-white text-black border border-white font-semibold'
                            : 'bg-white/10 text-neutral-300 border border-white/20 hover:border-white'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-black mr-1" />
                        ) : (
                          <span className="font-mono text-neutral-400 mr-1">+</span>
                        )}
                        <span>{note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions: Launch Full Studio Builder & Direct WhatsApp Concierge */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/create-your-fragrance"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs uppercase tracking-[0.2em] font-semibold rounded-sm transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>{content.bespoke_studio.button_text || 'Launch Scent Studio'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href={`https://wa.me/919345526905?text=${encodeURIComponent(
                    `Hi Aleez Perfumes, I would like to create a signature custom fragrance with the following notes: ${selectedCustomNotes.join(
                      ', '
                    )}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 bg-transparent hover:bg-white text-white hover:text-black border border-white text-xs uppercase tracking-[0.18em] font-semibold rounded-sm transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{content.bespoke_studio.whatsapp_consult_text || 'Consult on WhatsApp'}</span>
                </a>
              </div>
              <p className="text-[11px] text-neutral-400 mt-3 font-light text-center">
                Direct consultation with our Master Perfumer • Phone / WhatsApp: +91 9345526905
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. ARTISANAL PILLARS                                                      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-neutral-200">
          {content.pillars.map((pillar) => {
            const IconComponent = pillarIcons[pillar.icon] || Shield;
            return (
              <div key={pillar.id} className="flex items-start space-x-4 p-4 rounded-sm bg-neutral-50 border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 rounded-sm bg-neutral-200 border border-neutral-300 flex items-center justify-center flex-shrink-0 text-black">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base text-black font-medium">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-neutral-600 font-light mt-1">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. NEWSLETTER                                                             */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h3 className="font-serif text-3xl text-black">
          {content.newsletter.title}
        </h3>
        <p className="text-sm text-neutral-600 font-light max-w-md mx-auto">
          {content.newsletter.subtitle}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Welcome to the Aleez Parfums Circle! Check your email for your 10% privilege code.');
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2"
        >
          <input
            id="newsletter-email"
            type="email"
            required
            aria-label="Email address for VIP newsletter"
            placeholder="Enter your email address"
            className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black shadow-sm"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-sm flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Subscribe
          </button>
        </form>
        <p className="text-[11px] text-neutral-500 font-light max-w-md mx-auto pt-1">
          By subscribing, you agree to our{' '}
          <Link to="/privacy" className="text-black underline hover:text-neutral-600">Privacy Policy</Link>.
          You can <Link to="/unsubscribe" className="text-black underline hover:text-neutral-600">unsubscribe at any time</Link> via the link in our emails or website footer.
        </p>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
