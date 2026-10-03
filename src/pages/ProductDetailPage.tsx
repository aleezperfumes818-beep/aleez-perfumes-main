import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Sparkles,
  MessageCircle,
  ChevronRight,
  Star,
  Share2,
} from 'lucide-react';
import { Product } from '../types';
import { dbService } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { ProductCard, inspiredByMap } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings, formatPrice, getWhatsAppUrl } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        const allProducts = await dbService.getProducts();
        const found = allProducts.find((p) => p.slug === slug);

        if (found) {
          setProduct(found);
          document.title = `${found.name} | Aleez Perfumes`;
          setSelectedImageIndex(0);
          setQuantity(1);

          const related = allProducts
            .filter((p) => p.id !== found.id && p.is_active && (p.category_id === found.category_id || p.is_bestseller))
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = 'Aleez Perfumes | Discover Your Signature Scent';
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-[#141414]">Fragrance Not Found</h2>
        <p className="text-[#666666] font-light text-sm">
          The requested perfume may be retired or currently unavailable.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-4 px-6 py-2.5 bg-[#B8860B] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#9E7307] transition-colors shadow-sm"
        >
          Explore All Fragrances
        </Link>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const currentPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'img-1', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80', display_order: 1, is_primary: true }];

  const discountPercent =
    product.sale_price && product.price > product.sale_price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-[#777777] font-light">
        <Link to="/" className="hover:text-[#B8860B] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-[#AAAAAA]" />
        <Link to="/shop" className="hover:text-[#B8860B] transition-colors">
          Fragrances
        </Link>
        <ChevronRight className="w-3 h-3 text-[#AAAAAA]" />
        <span className="text-[#141414] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#EAE5DC] shadow-sm">
            <img
              src={images[selectedImageIndex]?.image_url}
              alt={images[selectedImageIndex]?.alt_text || product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_bestseller && (
                <span className="bg-[#B8860B] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow">
                  Bestseller
                </span>
              )}
              {product.is_new_arrival && (
                <span className="bg-white/95 backdrop-blur-sm text-[#7A5B10] border border-[#B8860B]/40 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                  New Arrival
                </span>
              )}
              {discountPercent && (
                <span className="bg-rose-700 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Floating Share Button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#444444] hover:text-[#B8860B] border border-[#EAE5DC] transition-colors shadow-sm"
              title="Share Fragrance"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="absolute top-16 right-4 bg-[#B8860B] text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-md animate-fade-in">
                Link Copied!
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={img.id || index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 sm:w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                    selectedImageIndex === index
                      ? 'border-[#B8860B] shadow-sm opacity-100'
                      : 'border-[#EAE5DC] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#EAE5DC] pb-6 space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#777777]">
              <span>{product.category_name || 'Haute Parfumerie'}</span>
              <span className="font-mono text-[#444444] font-medium">{product.volume_ml} ML / 1.7 FL. OZ.</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] font-medium leading-tight">
              {product.name}
            </h1>

            {/* Inspired By Formulation Tag */}
            {(product.inspired_by || (product.name && inspiredByMap[product.name])) && (
              <div className="pt-1 pb-1">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#7A5B10] bg-[#F7F3EB] border border-[#E8DFD0] px-3 py-1 rounded-full font-medium shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                  {product.inspired_by
                    ? product.inspired_by.toLowerCase().startsWith('inspired by')
                      ? product.inspired_by
                      : `Inspired by ${product.inspired_by}`
                    : inspiredByMap[product.name]}
                </span>
              </div>
            )}

            {product.fragrance_family && (
              <p className="text-xs uppercase tracking-widest text-[#B8860B] font-semibold">
                {product.fragrance_family}
              </p>
            )}

            {/* Price & Rating */}
            <div className="flex items-baseline space-x-3 pt-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#B8860B]">
                {formatPrice(currentPrice)}
              </span>
              {product.sale_price && (
                <span className="font-mono text-base text-[#999999] line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1 text-xs text-[#666666]">
              <div className="flex text-[#B8860B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#B8860B]" />
                ))}
              </div>
              <span className="font-mono font-semibold text-[#141414]">{product.rating}</span>
              <span>•</span>
              <span>{product.review_count} verified client reviews</span>
            </div>
          </div>

          {/* Stock Indicator */}
          <div>
            {isOutOfStock ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Currently Out of Stock. Reserve your bottle on WhatsApp.</span>
              </div>
            ) : product.stock_quantity <= 5 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Rare Batch: Only {product.stock_quantity} bottles remaining in stock</span>
              </div>
            ) : (
              <div className="text-xs text-emerald-700 font-medium flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>In Stock & Ready for Immediate Dispatch</span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Purchase CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-[#EAE5DC] rounded-xl bg-[#FAF9F6] px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-[#666666] hover:text-[#141414] px-2 text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-mono text-sm px-3 text-[#141414] font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="text-[#666666] hover:text-[#141414] px-2 text-sm disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : justAdded
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#B8860B] hover:bg-[#9E7307] text-white shadow-gold-sm'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isWished
                    ? 'border-[#B8860B] bg-[#B8860B]/10 text-[#B8860B] shadow-sm'
                    : 'border-[#EAE5DC] bg-white text-[#555555] hover:text-[#141414] hover:border-[#999999]'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-[#B8860B]' : ''}`} />
              </button>
            </div>

            {/* Instant Buy Now Button */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl bg-white border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-sm"
              >
                Instant Buy Now
              </button>
            )}

            {/* WhatsApp Link */}
            <a
              href={getWhatsAppUrl(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Inquire about this Scent on WhatsApp</span>
            </a>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-[#EAE5DC] space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414]">
              Fragrance Character
            </h3>
            <p className="text-sm text-[#444444] font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Fragrance Pyramid */}
          {(product.top_notes || product.heart_notes || product.base_notes) && (
            <div className="pt-4 border-t border-[#EAE5DC] space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414] flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>The Olfactory Pyramid</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5 text-xs bg-[#F8F5EF] border border-[#EAE4D9] p-4 rounded-xl">
                {product.top_notes && (
                  <div>
                    <span className="text-[#B8860B] font-semibold uppercase tracking-wider block text-[10px]">
                      Top Notes
                    </span>
                    <span className="text-[#333333] font-light">{product.top_notes}</span>
                  </div>
                )}
                {product.heart_notes && (
                  <div className="pt-2 border-t border-[#EAE4D9]">
                    <span className="text-[#B8860B] font-semibold uppercase tracking-wider block text-[10px]">
                      Heart Notes
                    </span>
                    <span className="text-[#333333] font-light">{product.heart_notes}</span>
                  </div>
                )}
                {product.base_notes && (
                  <div className="pt-2 border-t border-[#EAE4D9]">
                    <span className="text-[#B8860B] font-semibold uppercase tracking-wider block text-[10px]">
                      Base Notes
                    </span>
                    <span className="text-[#333333] font-light">{product.base_notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping & Return Highlights */}
          <div className="pt-4 border-t border-[#EAE5DC] space-y-2.5 text-xs text-[#555555] font-light">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
              <span>Complimentary express delivery on orders over ₹999 across India.</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
              <span>Prepaid online payment secured with Razorpay 256-bit encryption.</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
              <span>Damage-in-transit replacement guarantee with unboxing video proof.</span>
            </div>
          </div>
        </div>
      </div>

      {/* "You May Also Like" Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#EAE5DC]">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
                Discover More
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#141414] mt-1 font-medium">
                You May Also Like
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-widest text-[#B8860B] hover:text-[#141414] transition-colors font-medium"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
