import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
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

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#EAE5DC] text-[#141414] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#EAE5DC] flex items-center justify-between bg-[#FCFBF9]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#B8860B]" />
              <h2 className="font-serif text-lg tracking-wider text-[#141414] font-medium">Your Shopping Bag</h2>
              <span className="text-xs text-[#7A5B10] bg-[#B8860B]/10 px-2 py-0.5 rounded-full font-mono font-medium">
                {cart.reduce((n, i) => n + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#666666] hover:text-[#141414] rounded-full hover:bg-[#F5F2EB] transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3 bg-[#F6F2EB] border-b border-[#EAE4D9]">
            <div className="flex items-center justify-between text-xs text-[#444444] mb-1.5 font-light">
              <span className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>
                  {amountNeededForFreeShipping > 0
                    ? `Add ${formatPrice(amountNeededForFreeShipping)} more for FREE Luxury Shipping`
                    : 'You have unlocked Complimentary Express Shipping!'}
                </span>
              </span>
              <span className="font-mono text-[#B8860B] font-semibold">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E0D8CB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#A67C1E] to-[#B8860B] transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#EAE5DC] flex items-center justify-center text-[#B8860B]">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#141414]">Your bag is currently empty</h3>
                  <p className="text-xs text-[#777777] max-w-xs font-light">
                    Explore our curated collection of haute perfumery, attars, and artisanal oud.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-[#B8860B] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#9E7307] transition-colors shadow-sm"
                >
                  Explore Fragrances
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const currentPrice =
                  item.product.sale_price !== null && item.product.sale_price !== undefined
                    ? item.product.sale_price
                    : item.product.price;

                const primaryImage =
                  item.product.images[0]?.image_url ||
                  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80';

                return (
                  <div
                    key={item.product.id}
                    className="flex space-x-4 p-3 bg-[#FAF9F6] border border-[#EAE5DC] rounded-xl group"
                  >
                    <img
                      src={primaryImage}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-[#F5F2EB] flex-shrink-0 cursor-pointer border border-[#EAE5DC]"
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
                            className="text-sm font-medium text-[#141414] hover:text-[#B8860B] cursor-pointer truncate transition-colors"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[#999999] hover:text-red-600 p-1 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#777777] font-light mt-0.5">
                          {item.product.volume_ml} ml • {item.product.category_name || 'Fragrance'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Counter */}
                        <div className="flex items-center space-x-2 border border-[#EAE5DC] rounded-md px-2 py-0.5 bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="text-[#555555] hover:text-[#141414] p-0.5"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono px-2 text-[#141414] font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                            className={`p-0.5 ${
                              item.quantity >= item.product.stock_quantity
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[#555555] hover:text-[#141414]'
                            }`}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#B8860B] font-mono">
                            {formatPrice(currentPrice * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-[#888888] font-mono">
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
            <div className="p-5 bg-[#FCFBF9] border-t border-[#EAE5DC] space-y-4">
              <div className="space-y-2 text-xs text-[#555555] font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#141414] font-mono font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luxury Shipping</span>
                  <span className="text-[#141414] font-mono font-medium">
                    {shippingCharge === 0 ? (
                      <span className="text-emerald-700 uppercase tracking-wider text-[11px] font-semibold">Free</span>
                    ) : (
                      formatPrice(shippingCharge)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EAE5DC] flex justify-between text-base font-serif text-[#141414]">
                  <span>Estimated Total</span>
                  <span className="text-[#B8860B] font-mono font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-lg shadow-gold-sm transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-[#777777] font-light">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Prepaid online checkout via Razorpay • No COD</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
