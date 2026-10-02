import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Heart, ShoppingBag, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Product } from '../types';
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
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  if (!product) return null;

  const isWished = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const currentPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', display_order: 1, is_primary: true }];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
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
    addToCart(product, quantity);
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-[#141414]">
      <div
        className="relative bg-white border border-[#EAE5DC] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#666666] hover:text-[#141414] rounded-full bg-white/80 hover:bg-white border border-[#EAE5DC] transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-[#F8F6F2] flex flex-col justify-between border-r border-[#EAE5DC]/60">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-3 border border-[#EAE5DC]">
              <img
                src={images[selectedImageIndex]?.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.is_bestseller && (
                <span className="absolute top-3 left-3 bg-[#B8860B] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
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
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all bg-white ${
                      selectedImageIndex === idx ? 'border-[#B8860B]' : 'border-[#EAE5DC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 flex flex-col justify-between space-y-4 bg-white">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#777777] mb-1">
                <span>{product.category_name || 'Artisanal Perfume'}</span>
                <span>{product.volume_ml} ML</span>
              </div>

              <h2 className="font-serif text-2xl text-[#141414] mb-2 font-medium">{product.name}</h2>

              {/* Price & Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="font-mono text-xl font-bold text-[#B8860B]">
                  {formatPrice(currentPrice)}
                </span>
                {product.sale_price && (
                  <span className="font-mono text-sm text-[#999999] line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-medium ml-auto">
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                </span>
              </div>

              <p className="text-xs text-[#555555] font-light leading-relaxed line-clamp-3 mb-4">
                {product.description}
              </p>

              {/* Fragrance Notes */}
              {(product.top_notes || product.heart_notes || product.base_notes) && (
                <div className="space-y-1.5 p-3 rounded-lg bg-[#FAF9F6] border border-[#EAE5DC] text-[11px] mb-4">
                  {product.top_notes && (
                    <div className="text-[#333333]">
                      <span className="text-[#B8860B] font-semibold">Top:</span> {product.top_notes}
                    </div>
                  )}
                  {product.heart_notes && (
                    <div className="text-[#333333]">
                      <span className="text-[#B8860B] font-semibold">Heart:</span> {product.heart_notes}
                    </div>
                  )}
                  {product.base_notes && (
                    <div className="text-[#333333]">
                      <span className="text-[#B8860B] font-semibold">Base:</span> {product.base_notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2 border-t border-[#EAE5DC]">
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-[#EAE5DC] rounded-lg bg-[#FAF9F6] px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-[#666666] hover:text-[#141414] px-2"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs px-2 text-[#141414] font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="text-[#666666] hover:text-[#141414] px-2"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center space-x-2 ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#B8860B] text-white hover:bg-[#9E7307] shadow-gold-sm'
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

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isWished ? 'text-[#B8860B] border-[#B8860B] bg-[#B8860B]/10' : 'text-[#666666] hover:text-[#141414] border-[#EAE5DC] bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWished ? 'fill-[#B8860B]' : ''}`} />
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-2.5 bg-white border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white rounded-lg text-xs uppercase tracking-widest font-semibold transition-colors shadow-sm"
                >
                  Instant Buy Now
                </button>
              )}

              <div className="flex justify-between items-center text-[11px] text-[#777777] pt-1">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-[#B8860B] hover:underline flex items-center space-x-1 font-medium"
                >
                  <span>View full product page</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#B8860B]" />
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
