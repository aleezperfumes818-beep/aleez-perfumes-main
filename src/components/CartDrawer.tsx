import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingCharge,
    total,
    freeShippingThreshold,
    progressToFreeShipping,
  } = useCart();

  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  // Escape key handler to close cart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-black shadow-2xl flex flex-col border-l border-neutral-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="font-serif text-lg tracking-wider font-medium text-black">
                Your Fragrance Bag
              </h2>
              <span className="text-xs bg-neutral-100 text-black px-2 py-0.5 rounded-sm font-mono border border-neutral-200">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors focus:outline-none"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs">
            <div className="flex justify-between items-center mb-1.5 text-neutral-700">
              <span className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-black" />
                <span>
                  {amountNeededForFreeShipping > 0
                    ? `Add ${formatPrice(amountNeededForFreeShipping)} more for FREE Express Shipping`
                    : 'You have unlocked Complimentary Express Shipping!'}
                </span>
              </span>
              <span className="font-mono text-black font-semibold">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-black font-normal">Your bag is currently empty</h3>
                  <p className="text-xs text-neutral-500 max-w-xs font-light">
                    Explore our curated collection of haute perfumery, attars, and artisanal oud.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  Explore Fragrances
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemSize = item.selected_size || '50ml';
                const currentPrice = item.selected_price ?? (
                  itemSize === '100ml'
                    ? (item.product.sale_price_100ml ?? item.product.price_100ml ?? Math.round(item.product.price * 1.6))
                    : (item.product.sale_price_50ml ?? item.product.price_50ml ?? item.product.sale_price ?? item.product.price)
                );

                const primaryImage =
                  item.product.images[0]?.image_url ||
                  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80';

                return (
                  <div
                    key={`${item.product.id}-${itemSize}`}
                    className="flex space-x-4 p-3 bg-neutral-50 border border-neutral-200 rounded-sm group"
                  >
                    <img
                      src={primaryImage}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-sm bg-white flex-shrink-0 cursor-pointer border border-neutral-200"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate(`/product/${item.product.slug}`);
                      }}
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4
                            onClick={() => {
                              setIsCartOpen(false);
                              navigate(`/product/${item.product.slug}`);
                            }}
                            className="text-sm font-medium text-black hover:text-neutral-600 cursor-pointer truncate transition-colors"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, itemSize)}
                            className="text-neutral-400 hover:text-black p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[11px] font-semibold uppercase px-1.5 py-0.2 bg-black text-white rounded-xs">
                            {itemSize.toUpperCase()}
                          </span>
                          <span className="text-xs text-neutral-500 font-light truncate">
                            {item.product.category_name || 'Haute Parfumerie'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Counter */}
                        <div className="flex items-center space-x-2 border border-neutral-300 rounded-sm px-2 py-0.5 bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, itemSize)}
                            className="text-neutral-600 hover:text-black p-0.5 text-xs"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono px-2 text-black font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, itemSize)}
                            disabled={item.quantity >= item.product.stock_quantity}
                            className={`p-0.5 text-xs ${
                              item.quantity >= item.product.stock_quantity
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-neutral-600 hover:text-black'
                            }`}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-sm font-semibold text-black font-mono">
                            {formatPrice(currentPrice * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-neutral-500 font-mono">
                              ({formatPrice(currentPrice)} each)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 bg-neutral-50 border-t border-neutral-200 space-y-4">
              <div className="space-y-2 text-xs text-neutral-600 font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-black font-mono font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luxury Shipping</span>
                  <span className="text-black font-mono font-medium">
                    {shippingCharge === 0 ? (
                      <span className="text-black uppercase tracking-wider text-[11px] font-semibold">Free</span>
                    ) : (
                      formatPrice(shippingCharge)
                    )}
                  </span>
                </div>
                <div className="pt-1 text-[11px] text-neutral-500 font-light flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-black flex-shrink-0" aria-hidden="true" />
                  <span>All taxes included • Zero hidden fees</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-serif text-black">
                  <span>Estimated Total</span>
                  <span className="text-black font-mono font-bold text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm shadow-sm transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 font-light">
                <ShieldCheck className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                <span>Prepaid online checkout via Razorpay • No COD</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
