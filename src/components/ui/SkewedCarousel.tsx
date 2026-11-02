import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';

interface SkewedCarouselProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  skewAngle?: number;
}

/**
 * SkewedCarousel Component (React Bits Pro Inspired)
 * A skewed carousel of boutique cards that tilt and adjust perspective dynamically as they slide.
 */
export const SkewedCarousel: React.FC<SkewedCarouselProps> = ({
  products,
  onQuickView,
  skewAngle = -3,
}) => {
  const { formatPrice } = useSettings();
  const { addToCart, setIsCartOpen } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const total = products.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide every 4.5 seconds if not paused
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const res = addToCart(product, 1);
    if (res.success) {
      setAddedId(product.id);
      setIsCartOpen(true);
      setTimeout(() => setAddedId(null), 1800);
    }
  };

  if (total === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden py-10 select-none"
    >
      {/* 3D Perspective Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Controls Bar */}
        <div className="flex items-center justify-end space-x-2 mb-6">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-10 h-10 rounded-full border border-neutral-300 bg-white hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center text-black shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-10 h-10 rounded-full border border-neutral-300 bg-white hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center text-black shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skewed Carousel Track Container */}
        <div
          className="relative min-h-[460px] sm:min-h-[500px] flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          <div
            className="w-full flex items-center justify-center transition-transform duration-700 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(2deg) skewY(${skewAngle}deg)`,
            }}
          >
            {products.map((product, index) => {
              // Calculate relative offset from active index (-2, -1, 0, 1, 2, ...)
              let offset = index - currentIndex;
              if (offset < -Math.floor(total / 2)) offset += total;
              if (offset > Math.floor(total / 2)) offset -= total;

              const isCenter = offset === 0;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible) return null;

              // Compute dynamic tilt, translation, and scale based on sliding offset
              const translateX = offset * 280; // px spacing
              const rotateY = -offset * 14; // dynamic tilt as cards slide
              const scale = isCenter ? 1.03 : Math.max(0.86, 1 - Math.abs(offset) * 0.08);
              const zIndex = 30 - Math.abs(offset) * 10;
              const opacity = Math.abs(offset) > 1 ? 0.45 : 1;

              const primaryImage =
                (product.images && product.images[0]?.image_url) ||
                'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={product.id}
                  onClick={() => setCurrentIndex(index)}
                  className="absolute w-[260px] sm:w-[290px] md:w-[320px] transition-all duration-700 ease-out cursor-pointer group"
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${isCenter ? 50 : 0}px) rotateY(${rotateY}deg) scale(${scale})`,
                    zIndex,
                    opacity,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Luxury Card Box with Counter-Skew Content */}
                  <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-[420px] sm:h-[450px]">
                    {/* Visual Photo Area */}
                    <div className="relative h-[240px] sm:h-[260px] overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />

                      {/* Bestseller Badge */}
                      <div className="absolute top-3 left-3 bg-black text-white text-[9px] uppercase tracking-[0.25em] font-semibold px-2.5 py-1 rounded-sm shadow-sm">
                        Bestseller
                      </div>

                      {/* Quick View Button on Card Hover */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickView(product);
                          }}
                          className="px-4 py-2 bg-white hover:bg-neutral-100 text-black text-[10px] uppercase tracking-widest font-semibold rounded-sm transition-transform hover:scale-105 flex items-center space-x-1.5 shadow-md"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick View</span>
                        </button>
                      </div>

                      {/* Rating chip */}
                      {product.rating && (
                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-neutral-200 flex items-center space-x-1 text-[10px] font-semibold text-black shadow-sm">
                          <Star className="w-3 h-3 fill-black text-black" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white">
                      <div>
                        {product.category_name && (
                          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono block mb-1">
                            {product.category_name}
                          </span>
                        )}

                        <h3 className="font-serif text-lg font-medium text-black group-hover:text-neutral-700 transition-colors line-clamp-1">
                          {product.name}
                        </h3>

                        {product.inspired_by && (
                          <p className="text-[11px] text-neutral-500 italic mt-0.5 line-clamp-1 font-light">
                            {product.inspired_by.toLowerCase().startsWith('inspired by')
                              ? product.inspired_by
                              : `Inspired by ${product.inspired_by}`}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Add to Cart Action */}
                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-serif text-lg font-semibold text-black">
                            {formatPrice(product.sale_price || product.price)}
                          </span>
                          {product.sale_price && product.price > product.sale_price && (
                            <span className="text-xs text-neutral-400 line-through font-mono">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-[10px] uppercase tracking-widest font-semibold rounded-sm transition-all duration-300 flex items-center space-x-1.5 shadow-sm active:scale-95"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{addedId === product.id ? 'Added' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center space-x-2 pt-6">
          {products.slice(0, Math.min(products.length, 8)).map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex ? 'w-8 bg-black' : 'w-2 bg-neutral-300 hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
