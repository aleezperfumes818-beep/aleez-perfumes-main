import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Shield,
  Award,
  Clock,
  Star,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShoppingBag,
  Heart,
  Eye,
  Check,
  Flame,
  Truck,
  Droplets,
  MessageCircle,
  Compass,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Product, Category } from '../types';
import { dbService } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

export const HomePage: React.FC = () => {
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
  const { settings, formatPrice } = useSettings();
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
        const [prodData, catData] = await Promise.all([
          dbService.getProducts(),
          dbService.getCategories(),
        ]);
        setProducts(prodData.filter((p) => p.is_active));
        setCategories(catData.filter((c) => c.is_active));
      } catch (err) {
        console.warn('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Spotlight product: Velvet Oud Noir or first bestseller
  const spotlightProduct =
    products.find((p) => p.slug === 'velvet-oud-noir') ||
    products.find((p) => p.is_bestseller) ||
    products[0];

  const handleAddSpotlightToCart = () => {
    if (!spotlightProduct) return;
    const res = addToCart(spotlightProduct, 1);
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
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden bg-[#FAF9F6]">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Full-Screen Cinematic Looping Video - Aleez Perfumes)     */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-[#EAE5DC] bg-black">
        {/* High-Definition Royalty-Free Video Background with Cinematic Vignette */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            key="aleez-signature-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover object-center scale-[1.12] origin-center transition-transform duration-1000 ease-out"
          >
            <source src="/videos/aleez-signature.mp4" type="video/mp4" />
          </video>

          {/* Balanced Luxury Vignette Overlay (Leaves video vividly visible while text is crisp) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pt-10">
          <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full border border-[#D4AF37]/70 bg-black/50 backdrop-blur-md shadow-2xl animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-[#F5D77F] animate-pulse" />
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#F5E9BF] font-semibold">
              ALEEZ PARFUMS • HAUTE PARFUMERIE ATELIER
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#F5D77F] animate-pulse" />
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-wide text-white leading-[1.08] animate-slide-up drop-shadow-xl">
            Discover Your <br />
            <span className="italic font-light text-[#E5C378]">Signature Scent</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-stone-200 font-light leading-relaxed tracking-wide animate-fade-in drop-shadow">
            Handcrafted artisanal formulations macerated for unmatched projection and longevity. Rare oud distillations, ethereal floral absolutes, and magnetic oriental blends.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-9 py-4 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-lg shadow-gold-md hover:shadow-gold-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/create-your-fragrance"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-black border border-white/70 text-xs uppercase tracking-[0.2em] font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Create Your Fragrance</span>
            </Link>
          </div>
        </div>

        {/* Ambient Video Control Badge (Bottom Right - Yusuf Bhai Style) */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-2.5 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl text-white">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            title={isPlaying ? 'Pause video' : 'Play video'}
            className="p-1 hover:text-[#E5C378] transition-colors focus:outline-none"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <span className="h-3 w-px bg-white/20" />
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-1 hover:text-[#E5C378] transition-colors focus:outline-none"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[10px] uppercase tracking-widest text-[#E5C378] font-medium pl-1 hidden sm:inline">
            Aleez Film
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Bottom subtle scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center space-y-2 opacity-70 text-white">
          <span className="text-[9px] uppercase tracking-[0.3em] text-stone-300">Scroll to explore</span>
          <div className="w-4 h-7 rounded-full border border-white/40 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 bg-[#E5C378] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FRAGRANCE OF THE WEEK (Yusuf Bhai's Signature Spotlight Section)       */}
      {/* ========================================================================= */}
      {spotlightProduct && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF3E0] border border-[#DFC38A] text-[#7A5B10] text-[11px] uppercase tracking-[0.2em] font-semibold">
              <Flame className="w-3.5 h-3.5 text-[#B8860B]" />
              <span>Weekly Curation</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141414]">
              Fragrance of the Week
            </h2>
            <p className="text-sm text-[#555555] font-light">
              Discover this week's handpicked master formulation, macerated for 60 days to reach peak harmonic sillage.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE5DC] p-6 sm:p-10 lg:p-12 shadow-card hover:shadow-luxury transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Product Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#F7F5F0] border border-[#EAE5DC] shadow-sm group">
                  <img
                    src={
                      spotlightProduct.images && spotlightProduct.images[0]
                        ? spotlightProduct.images[0].image_url
                        : 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={spotlightProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 bg-[#B8860B] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded shadow-sm">
                    Spotlight Scent
                  </div>
                  {spotlightProduct.rating && (
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#EAE5DC] flex items-center space-x-1.5 text-xs shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-[#B8860B] text-[#B8860B]" />
                      <span className="font-bold text-[#141414]">{spotlightProduct.rating.toFixed(1)}</span>
                      <span className="text-[#777777]">({spotlightProduct.review_count || 68} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details & Scent Profile */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#7A5B10] font-medium mb-1">
                    <span>{spotlightProduct.category_name || 'Pure Oud Collection'}</span>
                    <span>•</span>
                    <span>Inspired by Tom Ford Ombré Leather</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#141414] font-medium">
                    {spotlightProduct.name}
                  </h3>
                  <p className="text-sm sm:text-base text-[#555555] font-light mt-3 leading-relaxed">
                    {spotlightProduct.description}
                  </p>
                </div>

                {/* Scent Notes Breakdown (Yusuf Bhai Scent Pyramid) */}
                <div className="bg-[#FAF9F6] border border-[#EAE5DC] rounded-xl p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-[#B8860B] font-semibold">
                    Harmonic Note Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="border-l-2 border-[#B8860B] pl-3 py-0.5">
                      <span className="font-semibold text-[#141414] block">Top Notes</span>
                      <span className="text-[#666666] font-light">
                        {spotlightProduct.top_notes || 'Kashmiri Saffron, Cinnamon'}
                      </span>
                    </div>
                    <div className="border-l-2 border-[#B8860B] pl-3 py-0.5">
                      <span className="font-semibold text-[#141414] block">Heart Notes</span>
                      <span className="text-[#666666] font-light">
                        {spotlightProduct.heart_notes || 'Damask Rose, Frankincense'}
                      </span>
                    </div>
                    <div className="border-l-2 border-[#B8860B] pl-3 py-0.5">
                      <span className="font-semibold text-[#141414] block">Base Notes</span>
                      <span className="text-[#666666] font-light">
                        {spotlightProduct.base_notes || 'Cambodian Oud, Tuscan Leather'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Longevity & Concentration Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#444444]">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>24+ Hours Projection</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>35% Extrait De Parfum</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                    ✓ Handcrafted in Small Batches
                  </span>
                </div>

                {/* Price & Size Selector */}
                <div className="pt-2 border-t border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-baseline space-x-3">
                    <span className="font-serif text-3xl font-semibold text-[#B8860B]">
                      {formatPrice(
                        spotlightProduct.sale_price || spotlightProduct.price
                      )}
                    </span>
                    {spotlightProduct.sale_price && (
                      <span className="text-base text-[#999999] line-through font-mono">
                        {formatPrice(spotlightProduct.price)}
                      </span>
                    )}
                    <span className="text-xs text-emerald-700 font-medium uppercase tracking-wider">
                      Save ₹{spotlightProduct.price - (spotlightProduct.sale_price || spotlightProduct.price)}
                    </span>
                  </div>

                  {/* Size buttons */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider text-[#777777]">Size:</span>
                    <button
                      onClick={() => setSelectedSpotlightSize('50ml')}
                      className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        selectedSpotlightSize === '50ml'
                          ? 'bg-[#B8860B] text-white border-[#B8860B]'
                          : 'bg-white text-[#333333] border-[#EAE5DC] hover:border-[#B8860B]'
                      }`}
                    >
                      50 ml
                    </button>
                    <button
                      onClick={() => setSelectedSpotlightSize('100ml')}
                      className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        selectedSpotlightSize === '100ml'
                          ? 'bg-[#B8860B] text-white border-[#B8860B]'
                          : 'bg-white text-[#333333] border-[#EAE5DC] hover:border-[#B8860B]'
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
                    className="w-full sm:flex-1 py-4 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-gold-sm transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {spotlightAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add To Cart • {selectedSpotlightSize}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setQuickViewProduct(spotlightProduct)}
                    className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-[#F5F2EB] text-[#141414] border border-[#EAE5DC] hover:border-[#B8860B] text-xs uppercase tracking-[0.15em] font-medium rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4 text-[#B8860B]" />
                    <span>Quick View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. THE ICONIC SPECIALTIES (Like Yusuf Bhai's "THE ICONIC DUO" & "Delights") */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
            Atelier Specialties
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#141414]">
            Our True Masterclass Into Handpicked Formulations
          </h2>
          <p className="text-sm text-[#555555] font-light">
            Distinctive fragrance architectures crafted for lasting poise, presence, and magnetic remembrance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Pour Homme */}
          <Link
            to="/shop?category=oriental-woody"
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-card hover:shadow-luxury transition-all duration-500 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80"
              alt="Pour Homme"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#E5C378] font-mono">
                The Iconic Masculine
              </span>
              <h3 className="font-serif text-2xl font-normal group-hover:text-[#F5E9BF] transition-colors">
                Pour Homme
              </h3>
              <p className="text-xs text-stone-300 font-light line-clamp-2">
                Magnetic woods, smoked leather, and crisp bergamot distilled for regal presence.
              </p>
              <div className="pt-2 text-xs uppercase tracking-widest text-[#E5C378] flex items-center space-x-1 font-medium">
                <span>Explore Scent</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Pour Femme */}
          <Link
            to="/shop?category=floral-fresh"
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-card hover:shadow-luxury transition-all duration-500 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80"
              alt="Pour Femme"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#E5C378] font-mono">
                The Iconic Feminine
              </span>
              <h3 className="font-serif text-2xl font-normal group-hover:text-[#F5E9BF] transition-colors">
                Pour Femme
              </h3>
              <p className="text-xs text-stone-300 font-light line-clamp-2">
                Luminous florals, delicate rose absolutes, and golden Madagascar vanilla.
              </p>
              <div className="pt-2 text-xs uppercase tracking-widest text-[#E5C378] flex items-center space-x-1 font-medium">
                <span>Explore Scent</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Signature Royal Oud */}
          <Link
            to="/shop?category=pure-oud-collection"
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-card hover:shadow-luxury transition-all duration-500 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"
              alt="Royal Oud"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#E5C378] font-mono">
                Pure Agarwood
              </span>
              <h3 className="font-serif text-2xl font-normal group-hover:text-[#F5E9BF] transition-colors">
                Noble Oud
              </h3>
              <p className="text-xs text-stone-300 font-light line-clamp-2">
                Wild harvested agarwood aged for decades, radiating oriental smoke and dignity.
              </p>
              <div className="pt-2 text-xs uppercase tracking-widest text-[#E5C378] flex items-center space-x-1 font-medium">
                <span>Explore Scent</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 4: Artisanal Attars */}
          <Link
            to="/shop?category=artisanal-attars"
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-card hover:shadow-luxury transition-all duration-500 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80"
              alt="Artisanal Attars"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#E5C378] font-mono">
                Alcohol-Free Concentrates
              </span>
              <h3 className="font-serif text-2xl font-normal group-hover:text-[#F5E9BF] transition-colors">
                Artisanal Attars
              </h3>
              <p className="text-xs text-stone-300 font-light line-clamp-2">
                100% pure botanical and amber perfume oils delivering intimate skin longevity.
              </p>
              <div className="pt-2 text-xs uppercase tracking-widest text-[#E5C378] flex items-center space-x-1 font-medium">
                <span>Explore Scent</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BRAND INSPIRATIONS & BESTSELLERS (Like Yusuf Bhai's "Brand Inspirations") */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#EAE5DC]">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
              Masterclass Formulations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141414] mt-1">
              Brand Inspirations & Bestsellers
            </h2>
            <p className="text-sm text-[#666666] font-light mt-1">
              Handcrafted interpretations inspired by the world's most prestigious perfume houses.
            </p>
          </div>
          <Link
            to="/shop?filter=bestseller"
            className="mt-4 sm:mt-0 text-xs uppercase tracking-widest text-[#B8860B] hover:text-[#141414] flex items-center space-x-1.5 transition-colors font-semibold"
          >
            <span>View All Inspirations</span>
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
      {/* 5. THE BESPOKE PERFUME ATELIER (Yusuf Bhai's "Create Your Fragrance")      */}
      {/* ========================================================================= */}
      <section id="bespoke-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#181818] rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#DFC38A]/40 text-white relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#B8860B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/50 bg-white/5 backdrop-blur-md text-[#E5C378] text-xs uppercase tracking-[0.2em] font-medium">
              <Compass className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Bespoke Perfumery Counter</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide text-white leading-tight">
              Can't Find Your Exact Scent? <br />
              <span className="italic text-[#E5C378]">Create Your Bespoke Fragrance</span>
            </h2>

            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
              Just like our atelier masters, our perfumers can formulate a signature, one-of-one custom fragrance tailored specifically to your skin chemistry and olfactory preferences.
            </p>

            {/* Interactive Scent Notes Selector */}
            <div className="pt-4 space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#E5C378] font-medium block">
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
                      className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                        isSelected
                          ? 'bg-[#B8860B] text-white border border-[#B8860B] shadow-sm'
                          : 'bg-white/10 text-stone-300 border border-white/20 hover:border-[#E5C378]'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions: Launch Full Studio Builder & Direct WhatsApp Concierge */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create-your-fragrance"
                className="w-full sm:w-auto px-8 py-4 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-gold-md hover:shadow-gold-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <Sparkles className="w-4 h-4 text-[#F5E9BF]" />
                <span>Launch Interactive Scent Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href={`https://wa.me/919345526905?text=${encodeURIComponent(
                  `Hi Aleez Perfumes, I would like to create a bespoke custom fragrance with the following notes: ${selectedCustomNotes.join(
                    ', '
                  )}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white text-white hover:text-black border border-white/60 text-xs uppercase tracking-[0.18em] font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consult on WhatsApp</span>
              </a>
            </div>
            <p className="text-[11px] text-stone-400 mt-3 font-light text-center">
              Direct consultation with our Master Perfumer • Phone / WhatsApp: +91 9345526905
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. THE 4 ARTISANAL PILLARS (Yusuf Bhai's "text_with_icons")                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-[#EAE5DC]">
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-[#EAE5DC]/60 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF3E0] border border-[#DFC38A] flex items-center justify-center flex-shrink-0 text-[#B8860B]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-[#141414] font-medium">
                Express Shipping
              </h4>
              <p className="text-xs text-[#666666] font-light mt-1">
                Complimentary luxury shipping across India on orders above ₹999.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-[#EAE5DC]/60 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF3E0] border border-[#DFC38A] flex items-center justify-center flex-shrink-0 text-[#B8860B]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-[#141414] font-medium">
                18-24h Projection
              </h4>
              <p className="text-xs text-[#666666] font-light mt-1">
                35% Extrait De Parfum oil concentration for unmatched longevity.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-[#EAE5DC]/60 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF3E0] border border-[#DFC38A] flex items-center justify-center flex-shrink-0 text-[#B8860B]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-[#141414] font-medium">
                Pure & Skin-Safe
              </h4>
              <p className="text-xs text-[#666666] font-light mt-1">
                100% hypoallergenic organic bases, non-toxic, and IFRA certified.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-[#EAE5DC]/60 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FAF3E0] border border-[#DFC38A] flex items-center justify-center flex-shrink-0 text-[#B8860B]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-[#141414] font-medium">
                Secure Checkout
              </h4>
              <p className="text-xs text-[#666666] font-light mt-1">
                256-Bit SSL encryption & verified Razorpay gateway protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. VIP ATELIER NEWSLETTER                                                 */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
          Private Reserve Access
        </span>
        <h3 className="font-serif text-3xl text-[#141414]">
          Join the Aleez Parfums Circle
        </h3>
        <p className="text-sm text-[#555555] font-light max-w-md mx-auto">
          Subscribe for complimentary 10% off your initial order, bespoke formulation drops, and private harvest releases.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Welcome to the Aleez Parfums Circle! Check your email for your 10% privilege code.');
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2"
        >
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="w-full px-4 py-3 bg-white border border-[#EAE5DC] rounded-xl text-xs focus:outline-none focus:border-[#B8860B] text-[#141414] shadow-sm"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all shadow-sm flex-shrink-0"
          >
            Subscribe
          </button>
        </form>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
