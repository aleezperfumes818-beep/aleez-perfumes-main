import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Product } from '../types';
import { dbService } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { ProductCard, inspiredByMap } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('50ml');
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, getWhatsAppUrl } = useSettings();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        const currentProd = await dbService.getProductBySlug(slug);
        setProduct(currentProd);

        if (currentProd) {
          const allProds = await dbService.getProducts();
          const related = allProds
            .filter(
              (p) =>
                p.id !== currentProd.id &&
                p.category_id === currentProd.category_id &&
                p.is_active
            )
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    setSelectedImageIndex(0);
    setQuantity(1);
    setSelectedSize('50ml');
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4 bg-white">
        <h2 className="font-serif text-3xl text-black">Fragrance Not Found</h2>
        <p className="text-neutral-500 font-light text-sm">
          The requested perfume may be retired or currently unavailable.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-4 px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-sm"
        >
          Explore All Fragrances
        </Link>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  // Separate 50ml and 100ml prices
  const price50 = product.price_50ml ?? product.price;
  const salePrice50 = product.sale_price_50ml !== undefined ? product.sale_price_50ml : product.sale_price;

  const price100 = product.price_100ml ?? Math.round(product.price * 1.6);
  const salePrice100 = product.sale_price_100ml !== undefined ? product.sale_price_100ml : (product.sale_price ? Math.round(product.sale_price * 1.6) : null);

  const activeRegularPrice = selectedSize === '50ml' ? price50 : price100;
  const activeSalePrice = selectedSize === '50ml' ? salePrice50 : salePrice100;
  const currentPrice = activeSalePrice !== null && activeSalePrice !== undefined ? activeSalePrice : activeRegularPrice;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'img-1', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80', display_order: 1, is_primary: true }];

  const discountPercent =
    activeSalePrice && activeRegularPrice > activeSalePrice
      ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity, selectedSize, currentPrice);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
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
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 bg-white text-black">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-500 font-light">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <Link to="/shop" className="hover:text-black transition-colors">
          Fragrances
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <span className="text-black font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-sm overflow-hidden bg-neutral-50 border border-neutral-200 shadow-sm">
            <img
              src={images[selectedImageIndex]?.image_url}
              alt={images[selectedImageIndex]?.alt_text || product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_bestseller && (
                <span className="bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-sm">
                  Bestseller
                </span>
              )}
              {product.is_new_arrival && (
                <span className="bg-white text-black border border-neutral-300 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-sm shadow-sm">
                  New Arrival
                </span>
              )}
              {discountPercent && (
                <span className="bg-black text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Floating Share Button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-sm bg-white/95 hover:bg-black hover:text-white text-neutral-700 border border-neutral-200 transition-colors shadow-sm"
              title="Share Fragrance"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="absolute top-16 right-4 bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm shadow-md animate-fade-in">
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
                  className={`relative w-20 sm:w-24 aspect-square rounded-sm overflow-hidden border transition-all flex-shrink-0 bg-white ${
                    selectedImageIndex === index
                      ? 'border-black ring-1 ring-black shadow-sm opacity-100'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-neutral-200 pb-6 space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500">
              <span>{product.category_name || 'Haute Parfumerie'}</span>
              <span className="font-mono text-neutral-600 font-medium">{selectedSize.toUpperCase()} Extrait</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-black font-normal leading-tight">
              {product.name}
            </h1>

            {/* Inspired By Formulation Tag */}
            {(product.inspired_by || (product.name && inspiredByMap[product.name])) && (
              <div className="pt-1 pb-1">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-black bg-neutral-100 border border-neutral-300 px-3 py-1 rounded-sm font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  {product.inspired_by
                    ? product.inspired_by.toLowerCase().startsWith('inspired by')
                      ? product.inspired_by
                      : `Inspired by ${product.inspired_by}`
                    : inspiredByMap[product.name]}
                </span>
              </div>
            )}

            {product.fragrance_family && (
              <p className="text-xs uppercase tracking-widest text-neutral-600 font-medium">
                {product.fragrance_family}
              </p>
            )}

            {/* Price & Rating */}
            <div className="flex items-baseline space-x-3 pt-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-black">
                {formatPrice(currentPrice)}
              </span>
              {activeSalePrice && (
                <span className="font-mono text-base text-neutral-400 line-through">
                  {formatPrice(activeRegularPrice)}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-semibold text-black bg-neutral-100 px-2.5 py-0.5 rounded-sm border border-neutral-300">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-500 font-light">
              All prices inclusive of GST. No hidden handling or gateway fees.
            </p>

            <div className="flex items-center space-x-2 pt-1 text-xs text-neutral-600 font-mono">
              <span className="uppercase tracking-wider font-semibold text-black">35% Extrait De Parfum</span>
              <span>•</span>
              <span>Small-Batch Maceration</span>
            </div>
          </div>

          {/* SIZES SELECTOR (50 ML vs 100 ML with Individual Prices) */}
          <div className="space-y-2.5">
            <label className="block text-xs uppercase tracking-wider text-black font-semibold">
              Select Size &amp; Flacon Volume
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* 50 ML Option */}
              <button
                type="button"
                onClick={() => setSelectedSize('50ml')}
                className={`p-3.5 rounded-sm border text-left transition-all duration-200 flex flex-col justify-between ${
                  selectedSize === '50ml'
                    ? 'border-black bg-black text-white shadow-sm'
                    : 'border-neutral-200 bg-white text-black hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-serif text-sm font-semibold tracking-wider">50 ML</span>
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    selectedSize === '50ml' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    Standard
                  </span>
                </div>
                <div className="font-mono text-xs font-semibold">
                  {formatPrice(salePrice50 !== null && salePrice50 !== undefined ? salePrice50 : price50)}
                  {salePrice50 && (
                    <span className={`ml-1.5 line-through font-normal text-[10px] ${
                      selectedSize === '50ml' ? 'text-neutral-400' : 'text-neutral-400'
                    }`}>
                      {formatPrice(price50)}
                    </span>
                  )}
                </div>
              </button>

              {/* 100 ML Option */}
              <button
                type="button"
                onClick={() => setSelectedSize('100ml')}
                className={`p-3.5 rounded-sm border text-left transition-all duration-200 flex flex-col justify-between ${
                  selectedSize === '100ml'
                    ? 'border-black bg-black text-white shadow-sm'
                    : 'border-neutral-200 bg-white text-black hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-serif text-sm font-semibold tracking-wider">100 ML</span>
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    selectedSize === '100ml' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    Best Value
                  </span>
                </div>
                <div className="font-mono text-xs font-semibold">
                  {formatPrice(salePrice100 !== null && salePrice100 !== undefined ? salePrice100 : price100)}
                  {salePrice100 && (
                    <span className={`ml-1.5 line-through font-normal text-[10px] ${
                      selectedSize === '100ml' ? 'text-neutral-400' : 'text-neutral-400'
                    }`}>
                      {formatPrice(price100)}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Stock Indicator */}
          <div>
            {isOutOfStock ? (
              <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-sm text-xs text-neutral-800 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span>Currently Out of Stock. Reserve your bottle on WhatsApp.</span>
              </div>
            ) : product.stock_quantity <= 5 ? (
              <div className="p-3 bg-neutral-50 border border-neutral-300 rounded-sm text-xs text-neutral-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span>Rare Batch: Only {product.stock_quantity} bottles remaining in stock</span>
              </div>
            ) : (
              <div className="text-xs text-neutral-800 font-medium flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span>In Stock &amp; Ready for Immediate Dispatch</span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Purchase CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-neutral-300 rounded-sm bg-neutral-50 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-neutral-600 hover:text-black px-2 text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-mono text-sm px-3 text-black font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="text-neutral-600 hover:text-black px-2 text-sm disabled:opacity-30"
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
                className={`flex-1 py-3.5 rounded-sm text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                    : justAdded
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-black hover:bg-neutral-800 text-white shadow-sm'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added ({selectedSize.toUpperCase()})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag • {formatPrice(currentPrice * quantity)}</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-sm border transition-colors ${
                  isWished
                    ? 'border-black bg-black text-white shadow-sm'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:text-black hover:border-black'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Instant Buy Now Button */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-sm bg-white border-2 border-black text-black hover:bg-black hover:text-white text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-sm"
              >
                Instant Buy Now ({selectedSize.toUpperCase()})
              </button>
            )}

            {/* WhatsApp Link */}
            <a
              href={getWhatsAppUrl(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-sm bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-black" />
              <span>Inquire about {product.name} ({selectedSize}) on WhatsApp</span>
            </a>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-neutral-200 space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-black">
              Fragrance Character
            </h3>
            <p className="text-sm text-neutral-700 font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Fragrance Pyramid */}
          {(product.top_notes || product.heart_notes || product.base_notes) && (
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-black flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>The Olfactory Pyramid</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5 text-xs bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                {product.top_notes && (
                  <div>
                    <span className="text-neutral-500 font-semibold uppercase tracking-wider block text-[10px]">
                      Top Notes
                    </span>
                    <span className="text-black font-light">{product.top_notes}</span>
                  </div>
                )}
                {product.heart_notes && (
                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-neutral-500 font-semibold uppercase tracking-wider block text-[10px]">
                      Heart Notes
                    </span>
                    <span className="text-black font-light">{product.heart_notes}</span>
                  </div>
                )}
                {product.base_notes && (
                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-neutral-500 font-semibold uppercase tracking-wider block text-[10px]">
                      Base Notes
                    </span>
                    <span className="text-black font-light">{product.base_notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping & Return Highlights */}
          <div className="pt-4 border-t border-neutral-200 space-y-2.5 text-xs text-neutral-600 font-light">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-black flex-shrink-0" aria-hidden="true" />
              <span>Complimentary express delivery on orders over ₹999 across India.</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" aria-hidden="true" />
              <span>Prepaid online payment secured with Razorpay 256-bit encryption.</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-black flex-shrink-0" aria-hidden="true" />
              <span>
                Transit damage replacement guarantee. Review our{' '}
                <Link to="/refund" className="text-black underline hover:text-neutral-600">
                  Refund Policy
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "You May Also Like" Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-neutral-200">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
                Discover More
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-black mt-1 font-medium">
                You May Also Like
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-widest text-black hover:text-neutral-600 transition-colors font-medium"
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
