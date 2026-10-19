import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Heart, ShoppingBag, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { inspiredByMap } from './ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('50ml');
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  // Keyboard navigation: Escape key closes modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isWished = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const price50 = product.price_50ml ?? product.price;
  const salePrice50 = product.sale_price_50ml !== undefined ? product.sale_price_50ml : product.sale_price;

  const price100 = product.price_100ml ?? Math.round(product.price * 1.6);
  const salePrice100 = product.sale_price_100ml !== undefined ? product.sale_price_100ml : (product.sale_price ? Math.round(product.sale_price * 1.6) : null);

  const activeRegularPrice = selectedSize === '50ml' ? price50 : price100;
  const activeSalePrice = selectedSize === '50ml' ? salePrice50 : salePrice100;
  const currentPrice = activeSalePrice !== null && activeSalePrice !== undefined ? activeSalePrice : activeRegularPrice;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true }];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity, selectedSize, currentPrice);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        onClose();
        setIsCartOpen(true);
      }, 700);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, currentPrice);
    onClose();
    navigate('/checkout');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view of ${product.name}`}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-black"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-neutral-200 rounded-sm max-w-3xl w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-600 hover:text-black rounded-full bg-white/90 hover:bg-neutral-100 border border-neutral-200 transition-colors shadow-sm focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-neutral-50 flex flex-col justify-between border-r border-neutral-200">
            <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-white mb-3 border border-neutral-200">
              <img
                src={images[selectedImageIndex]?.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.is_bestseller && (
                <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm">
                  Bestseller
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-sm overflow-hidden border flex-shrink-0 transition-all bg-white ${
                      selectedImageIndex === idx ? 'border-black ring-1 ring-black' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 flex flex-col justify-between space-y-4 bg-white">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500 mb-1">
                <span>{product.category_name || 'Haute Parfumerie'}</span>
                <span className="font-mono text-neutral-600 font-medium">{selectedSize.toUpperCase()} Extrait</span>
              </div>

              <h2 className="font-serif text-2xl text-black mb-1 font-normal">{product.name}</h2>

              {/* Inspired By Formulation Tag */}
              {(product.inspired_by || (product.name && inspiredByMap[product.name])) && (
                <div className="mb-2">
                  <span className="inline-block text-[10px] uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-sm font-medium">
                    {product.inspired_by
                      ? product.inspired_by.toLowerCase().startsWith('inspired by')
                        ? product.inspired_by
                        : `Inspired by ${product.inspired_by}`
                      : inspiredByMap[product.name]}
                  </span>
                </div>
              )}

              {/* Price & Stock */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="font-mono text-xl font-bold text-black">
                  {formatPrice(currentPrice)}
                </span>
                {activeSalePrice && (
                  <span className="font-mono text-sm text-neutral-400 line-through">
                    {formatPrice(activeRegularPrice)}
                  </span>
                )}
                <span className="text-xs text-neutral-600 font-medium ml-auto">
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                </span>
              </div>

              {/* Size Selector (50 ML vs 100 ML) */}
              <div className="mb-3 space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold">
                  Select Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSize('50ml')}
                    className={`py-2 px-3 rounded-sm border text-xs flex justify-between items-center transition-all ${
                      selectedSize === '50ml'
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 bg-white text-black hover:border-black'
                    }`}
                  >
                    <span className="font-serif font-semibold">50 ML</span>
                    <span className="font-mono font-medium">
                      {formatPrice(salePrice50 !== null && salePrice50 !== undefined ? salePrice50 : price50)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSize('100ml')}
                    className={`py-2 px-3 rounded-sm border text-xs flex justify-between items-center transition-all ${
                      selectedSize === '100ml'
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 bg-white text-black hover:border-black'
                    }`}
                  >
                    <span className="font-serif font-semibold">100 ML</span>
                    <span className="font-mono font-medium">
                      {formatPrice(salePrice100 !== null && salePrice100 !== undefined ? salePrice100 : price100)}
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 font-light leading-relaxed line-clamp-2 mb-3">
                {product.description}
              </p>

              {/* Fragrance Notes */}
              {(product.top_notes || product.heart_notes || product.base_notes) && (
                <div className="space-y-1 p-2.5 rounded-sm bg-neutral-50 border border-neutral-200 text-[11px] mb-3">
                  {product.top_notes && (
                    <div className="text-neutral-700">
                      <span className="text-black font-semibold">Top:</span> {product.top_notes}
                    </div>
                  )}
                  {product.heart_notes && (
                    <div className="text-neutral-700">
                      <span className="text-black font-semibold">Heart:</span> {product.heart_notes}
                    </div>
                  )}
                  {product.base_notes && (
                    <div className="text-neutral-700">
                      <span className="text-black font-semibold">Base:</span> {product.base_notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-200">
              <div className="flex items-center space-x-2">
                <div className="flex items-center border border-neutral-300 rounded-sm bg-neutral-50 px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-neutral-600 hover:text-black px-2 text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs px-2 text-black font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="text-neutral-600 hover:text-black px-2 text-xs"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                    isOutOfStock
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                      : justAdded
                      ? 'bg-neutral-900 text-white'
                      : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
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

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-sm border transition-colors ${
                    isWished ? 'text-white border-black bg-black' : 'text-neutral-600 hover:text-black border-neutral-300 bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWished ? 'fill-white' : ''}`} />
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-2 bg-white border border-black text-black hover:bg-black hover:text-white rounded-sm text-xs uppercase tracking-widest font-semibold transition-colors shadow-sm"
                >
                  Instant Buy Now ({selectedSize.toUpperCase()})
                </button>
              )}

              <div className="flex justify-between items-center text-[11px] text-neutral-500 pt-1">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-black hover:underline flex items-center space-x-1 font-medium"
                >
                  <span>View full product page</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-black" />
                  <span>Pan-India Delivery</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
