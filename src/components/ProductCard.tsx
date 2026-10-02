import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const inspiredByMap: Record<string, string> = {
  'Royal Amber Royale': 'Inspired by Baccarat Rouge 540',
  'Velvet Oud Noir': 'Inspired by Tom Ford Ombré Leather',
  'Santal Imperial': 'Inspired by Le Labo Santal 33',
  'Elysian Rose Attar': 'Inspired by MFK Oud Satin Mood',
  'Midnight Saffron': 'Inspired by Byredo Black Saffron',
  'Aqua Celestia': 'Inspired by Acqua Di Gio Profondo',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isWished = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].image_url
      : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80';

  const secondaryImage =
    product.images && product.images.length > 1
      ? product.images[1].image_url
      : primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    setIsAdding(true);
    const result = addToCart(product, 1);
    if (result.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
    setIsAdding(false);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const discountPercent =
    product.sale_price && product.price > product.sale_price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : null;

  return (
    <div className="group relative bg-white border border-[#EAE5DC] hover:border-[#B8860B]/60 rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-card hover:shadow-luxury">
      {/* Product Image & Badges Container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#F7F5F0] block">
        {/* Primary & Hover Images */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            secondaryImage !== primaryImage ? 'group-hover:opacity-0' : ''
          }`}
          loading="lazy"
        />

        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} preview`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.is_bestseller && (
            <span className="bg-[#B8860B] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              Bestseller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-white/95 backdrop-blur-sm text-[#7A5B10] border border-[#B8860B]/40 text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              New
            </span>
          )}
          {discountPercent && (
            <span className="bg-rose-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-800 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Top Right Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border ${
            isWished
              ? 'bg-[#B8860B] text-white border-[#B8860B] shadow-sm'
              : 'bg-white/90 text-[#444444] border-[#EAE5DC] hover:text-[#B8860B] hover:bg-white shadow-sm'
          }`}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={handleQuickView}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#EAE5DC] text-[#222222] hover:text-[#B8860B] hover:border-[#B8860B] text-[11px] uppercase tracking-wider font-light opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex items-center space-x-1.5 shadow-md"
          >
            <Eye className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>Quick View</span>
          </button>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Volume */}
          <div className="flex items-center justify-between text-[11px] text-[#777777] uppercase tracking-widest mb-1 font-light">
            <span className="truncate">{product.category_name || 'Haute Parfumerie'}</span>
            <span>{product.volume_ml}ml</span>
          </div>

          {/* Inspired By Formulation Tag */}
          {inspiredByMap[product.name] && (
            <div className="mb-1.5">
              <span className="inline-block text-[10px] uppercase tracking-wider text-[#7A5B10] bg-[#F7F3EB] border border-[#E8DFD0] px-2 py-0.5 rounded-full font-medium">
                {inspiredByMap[product.name]}
              </span>
            </div>
          )}

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-base sm:text-lg text-[#141414] group-hover:text-[#B8860B] transition-colors duration-200 leading-snug line-clamp-1 font-medium">
              {product.name}
            </h3>
          </Link>

          {/* Fragrance Notes hint if available */}
          {product.top_notes && (
            <p className="text-[11px] text-[#666666] mt-1 line-clamp-1 font-light italic">
              {product.top_notes}
            </p>
          )}
        </div>

        {/* Price & Add to Bag Row */}
        <div className="pt-3 mt-3 border-t border-[#EAE5DC]/80 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-base font-semibold text-[#B8860B]">
              {formatPrice(product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price)}
            </span>
            {product.sale_price && (
              <span className="font-mono text-xs text-[#999999] line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center space-x-1.5 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#B8860B]/10 text-[#8C6D23] border border-[#B8860B]/30 hover:bg-[#B8860B] hover:text-white shadow-sm'
            }`}
            aria-label={`Add ${product.name} to bag`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
