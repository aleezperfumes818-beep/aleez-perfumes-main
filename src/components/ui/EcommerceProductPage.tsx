import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Sparkles,
  Share2,
  MessageCircle,
  ZoomIn,
  X,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';
import { ProductCard, inspiredByMap } from '../ProductCard';

interface EcommerceProductPageProps {
  product: Product;
  relatedProducts?: Product[];
}

/**
 * Ecommerce 1: Clean Modern Luxury Perfume Product Experience
 * Minimalist luxury layout focused on typography, imagery, flacon sizing, and conversion.
 */
export const EcommerceProductPage: React.FC<EcommerceProductPageProps> = ({
  product,
  relatedProducts = [],
}) => {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, getWhatsAppUrl } = useSettings();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('50ml');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const isWished = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  // Separate 50ml and 100ml pricing
  const price50 = product.price_50ml ?? product.price;
  const salePrice50 =
    product.sale_price_50ml !== undefined ? product.sale_price_50ml : product.sale_price;

  const price100 = product.price_100ml ?? Math.round(product.price * 1.6);
  const salePrice100 =
    product.sale_price_100ml !== undefined
      ? product.sale_price_100ml
      : product.sale_price
      ? Math.round(product.sale_price * 1.6)
      : null;

  const activeRegularPrice = selectedSize === '50ml' ? price50 : price100;
  const activeSalePrice = selectedSize === '50ml' ? salePrice50 : salePrice100;
  const currentPrice =
    activeSalePrice !== null && activeSalePrice !== undefined
      ? activeSalePrice
      : activeRegularPrice;

  const discountPercent =
    activeSalePrice && activeRegularPrice > activeSalePrice
      ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
      : null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            id: 'default-img',
            image_url:
              'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
            display_order: 1,
            is_primary: true,
          },
        ];

  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity, selectedSize, currentPrice);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2200);
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, currentPrice);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  return (
    <div className="space-y-16 bg-white text-black">
      {/* Breadcrumb Bar */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-500 font-light tracking-wide">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link to="/shop" className="hover:text-black transition-colors">
          Fragrances
        </Link>
        {product.category_name && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link
              to={`/shop?category=${product.category_id}`}
              className="hover:text-black transition-colors"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-black font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE GALLERY                                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
          {/* Main Visual Box */}
          <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-neutral-50 border border-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] group select-none">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 shadow-md">
                35% Pure Extrait
              </span>
              {product.is_bestseller && (
                <span className="bg-white text-black border border-neutral-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1 shadow-sm">
                  ★ Bestseller
                </span>
              )}
              {discountPercent && (
                <span className="bg-neutral-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Floating Action Controls */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(true)}
                className="p-2.5 bg-white/90 hover:bg-black hover:text-white text-neutral-800 border border-neutral-200 backdrop-blur-sm transition-all shadow-sm"
                title="Expand Fullscreen View"
                aria-label="Expand photo"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 bg-white/90 hover:bg-black hover:text-white text-neutral-800 border border-neutral-200 backdrop-blur-sm transition-all shadow-sm relative"
                title="Share Fragrance"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink && (
                  <span className="absolute -bottom-8 right-0 bg-black text-white text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 shadow-md whitespace-nowrap animate-fade-in">
                    Link Copied
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Flacon Specs Pill */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 border border-neutral-200 text-[11px] font-mono text-black shadow-sm flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span className="uppercase tracking-wider font-semibold">
                  Hand-Poured &bull; {selectedSize.toUpperCase()}
                </span>
              </div>
              <div className="bg-black/90 text-white backdrop-blur-md px-3 py-1.5 text-[10px] uppercase tracking-widest font-mono shadow-sm">
                Macerated 60 Days
              </div>
            </div>
          </div>

          {/* Thumbnail Carousel Bar */}
          {images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 sm:w-24 aspect-square overflow-hidden border transition-all flex-shrink-0 bg-neutral-100 ${
                    selectedImageIndex === idx
                      ? 'border-black ring-2 ring-black shadow-md opacity-100 scale-[1.02]'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PRODUCT CONTENT & ACTIONS                                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-8">
          {/* Header & Classification */}
          <div className="border-b border-neutral-200 pb-6 space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500 font-mono">
              <span>{product.category_name || 'Haute Parfumerie'}</span>
              <span className="text-black font-semibold">
                {product.gender || 'Unisex'} Formulation
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-black font-normal leading-tight">
              {product.name}
            </h1>

            {/* Inspired-By Badge */}
            {(product.inspired_by || (product.name && inspiredByMap[product.name])) && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-black bg-neutral-50 border border-neutral-200 px-3.5 py-1.5 rounded-none font-medium shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>
                    {product.inspired_by
                      ? product.inspired_by.toLowerCase().startsWith('inspired by')
                        ? product.inspired_by
                        : `Inspired by ${product.inspired_by}`
                      : inspiredByMap[product.name]}
                  </span>
                </span>
              </div>
            )}

            {product.fragrance_family && (
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 font-medium pt-1">
                Olfactory Family: <span className="text-black">{product.fragrance_family}</span>
              </p>
            )}

            {/* Price & Rating Display */}
            <div className="flex items-baseline space-x-3 pt-2">
              <span className="font-serif text-3xl sm:text-4xl font-semibold text-black">
                {formatPrice(currentPrice)}
              </span>
              {activeSalePrice && (
                <span className="font-mono text-base text-neutral-400 line-through">
                  {formatPrice(activeRegularPrice)}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-semibold text-black bg-neutral-100 px-2.5 py-1 border border-neutral-300">
                  Save ₹{activeRegularPrice - activeSalePrice!} ({discountPercent}%)
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-500 font-light">
              All taxes included. Complimentary luxury express courier dispatch across India.
            </p>
          </div>

          {/* ======================================================================= */}
          {/* 1. FLACON VOLUME SELECTOR (50 ML vs 100 ML)                              */}
          {/* ======================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-[0.2em] text-black font-bold">
                Select Flacon Volume
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {selectedSize === '50ml' ? '~500 Luxury Sprays' : '~1,000 Luxury Sprays'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 50 ML Option */}
              <button
                type="button"
                onClick={() => setSelectedSize('50ml')}
                className={`p-4 border text-left transition-all duration-200 flex flex-col justify-between ${
                  selectedSize === '50ml'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-neutral-200 bg-white text-black hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-serif text-sm font-semibold tracking-wider">50 ML</span>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${
                      selectedSize === '50ml'
                        ? 'bg-neutral-800 text-neutral-200'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Artisanal Flacon
                  </span>
                </div>
                <div className="font-mono text-xs font-semibold pt-2">
                  {formatPrice(salePrice50 ?? price50)}
                  {salePrice50 && (
                    <span className="ml-2 line-through font-normal text-[10px] text-neutral-400">
                      {formatPrice(price50)}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-light mt-1 block ${
                    selectedSize === '50ml' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  4–6 months daily wear
                </span>
              </button>

              {/* 100 ML Option */}
              <button
                type="button"
                onClick={() => setSelectedSize('100ml')}
                className={`p-4 border text-left transition-all duration-200 flex flex-col justify-between ${
                  selectedSize === '100ml'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-neutral-200 bg-white text-black hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-serif text-sm font-semibold tracking-wider">100 ML</span>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-bold ${
                      selectedSize === '100ml'
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                    }`}
                  >
                    Best Value
                  </span>
                </div>
                <div className="font-mono text-xs font-semibold pt-2">
                  {formatPrice(salePrice100 ?? price100)}
                  {salePrice100 && (
                    <span className="ml-2 line-through font-normal text-[10px] text-neutral-400">
                      {formatPrice(price100)}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-light mt-1 block ${
                    selectedSize === '100ml' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  9–12 months daily wear
                </span>
              </button>
            </div>
          </div>

          {/* Stock Indicator */}
          <div>
            {isOutOfStock ? (
              <div className="p-3 bg-neutral-100 border border-neutral-300 text-xs text-neutral-800 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span>Currently Out of Stock. Reserve next harvest bottling on WhatsApp.</span>
              </div>
            ) : product.stock_quantity <= 5 ? (
              <div className="p-3 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span>Limited Reserve: Only {product.stock_quantity} bottles remaining in batch</span>
              </div>
            ) : (
              <div className="text-xs text-neutral-800 font-medium flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span>In Stock &amp; Ready for Express Dispatch in 24h</span>
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* 2. QUANTITY & CONVERSION CTAs                                           */}
          {/* ======================================================================= */}
          <div className="space-y-3 pt-2">
            {/* Desktop CTAs (sm and up) */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* Stepper */}
              <div className="flex items-center border border-neutral-300 bg-neutral-50 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-neutral-600 hover:text-black px-2 text-base font-semibold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-mono text-sm px-3 text-black font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 10, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="text-neutral-600 hover:text-black px-2 text-base font-semibold disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 text-xs uppercase tracking-[0.22em] font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                    : justAdded
                    ? 'bg-neutral-900 text-white'
                    : 'bg-black hover:bg-neutral-800 text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added ({selectedSize.toUpperCase()} Extrait)</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag &bull; {formatPrice(currentPrice * quantity)}</span>
                  </>
                )}
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-4 border transition-colors ${
                  isWished
                    ? 'border-black bg-black text-white shadow-sm'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:text-black hover:border-black'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Mobile CTAs (under sm) - Never cramped, never fumbled */}
            <div className="sm:hidden space-y-3">
              {/* Stepper + Wishlist Row */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-between border border-neutral-300 bg-neutral-50 px-3 py-2 flex-1">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono">Qty</span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-neutral-700 hover:text-black px-2.5 text-base font-semibold"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm px-2 text-black font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 10, q + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="text-neutral-700 hover:text-black px-2.5 text-base font-semibold disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`py-2.5 px-4 border transition-colors flex items-center justify-center space-x-2 text-xs uppercase tracking-wider font-semibold ${
                    isWished
                      ? 'border-black bg-black text-white shadow-sm'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:text-black hover:border-black'
                  }`}
                  aria-label="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWished ? 'fill-white text-white' : ''}`} />
                  <span>{isWished ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>

              {/* Add to Bag: Full Width, Uncompromised Luxury Primary Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-lg active:scale-[0.99] ${
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                    : justAdded
                    ? 'bg-neutral-900 text-white'
                    : 'bg-black hover:bg-neutral-800 text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added ({selectedSize.toUpperCase()} Extrait)</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag &bull; {formatPrice(currentPrice * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Instant Checkout Button */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-white border-2 border-black text-black hover:bg-black hover:text-white text-xs uppercase tracking-[0.22em] font-bold transition-all duration-300 shadow-sm"
              >
                Instant Buy Now ({selectedSize.toUpperCase()})
              </button>
            )}

            {/* WhatsApp Concierge */}
            <a
              href={getWhatsAppUrl(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-black" />
              <span>Consult Perfumer on WhatsApp ({product.name})</span>
            </a>
          </div>

          {/* ======================================================================= */}
          {/* 3. FRAGRANCE ARCHITECTURE / DESCRIPTION                                 */}
          {/* ======================================================================= */}
          <div className="pt-6 border-t border-neutral-200 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black">
              Fragrance Character &amp; Description
            </h3>
            <p className="text-sm text-neutral-700 font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* ======================================================================= */}
          {/* 4. TRUST BADGES & VALUE PILLARS                                         */}
          {/* ======================================================================= */}
          <div className="pt-6 border-t border-neutral-200 space-y-3 text-xs text-neutral-600 font-light">
            <div className="flex items-center space-x-3">
              <Truck className="w-4 h-4 text-black flex-shrink-0" />
              <span>Complimentary insured express delivery across India on orders &gt; ₹999.</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" />
              <span>100% skin-safe IFRA compliant formulation with authenticated botanical absolutes.</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-4 h-4 text-black flex-shrink-0" />
              <span>
                Transit damage replacement guarantee. Review our{' '}
                <Link to="/refund" className="text-black underline hover:text-neutral-500">
                  Refund Policy
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN LIGHT ZOOM MODAL                                               */}
      {/* ========================================================================= */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:text-neutral-300 transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col items-center">
            <img
              src={currentImage.image_url}
              alt={product.name}
              className="max-h-[80vh] w-auto object-contain shadow-2xl"
            />
            <p className="text-white text-xs font-mono uppercase tracking-widest mt-4">
              {product.name} &bull; {selectedSize.toUpperCase()} Extrait De Parfum
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RELATED RECOMMENDATIONS ("YOU MAY ALSO LIKE")                             */}
      {/* ========================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-neutral-200">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold font-mono">
                Master Formulations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-black mt-1 font-medium">
                You May Also Like
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-widest text-black hover:text-neutral-600 transition-colors font-semibold flex items-center space-x-1"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM PURCHASE BAR                                        */}
      {/* Keeps "Add to Bag" visible at all times when scrolling on mobile          */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-serif font-bold text-black truncate">{product.name}</div>
          <div className="text-xs font-mono font-semibold text-neutral-900 flex items-center space-x-1.5">
            <span>{formatPrice(currentPrice * quantity)}</span>
            <span className="text-[10px] text-neutral-500 font-normal">({selectedSize})</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
            isOutOfStock
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
              : justAdded
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-black text-white hover:bg-neutral-800 shadow-md active:scale-95'
          }`}
          aria-label={`Add ${product.name} to bag`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Added</span>
            </>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
