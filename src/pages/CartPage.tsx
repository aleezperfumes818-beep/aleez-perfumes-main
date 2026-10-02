import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export const CartPage: React.FC = () => {
  const {
    cart,
    subtotal,
    shippingCharge,
    total,
    updateQuantity,
    removeFromCart,
    freeShippingThreshold,
    progressToFreeShipping,
  } = useCart();

  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#141414]">
      <div className="border-b border-[#EAE5DC] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
          Your Fragrance Bag
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mt-1 font-medium">
          Shopping Bag
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#EAE5DC] p-8 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#EAE5DC] flex items-center justify-center mx-auto text-[#B8860B]">
            <ShoppingBag className="w-7 h-7 opacity-70" />
          </div>
          <h2 className="font-serif text-2xl text-[#141414]">Your bag is currently empty</h2>
          <p className="text-xs text-[#666666] font-light">
            You haven't added any fragrances to your bag yet.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 bg-[#B8860B] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#9E7307] transition-colors mt-2 shadow-sm"
          >
            Explore Fragrances
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-4 bg-white border border-[#EAE5DC] rounded-xl space-y-2 shadow-card">
              <div className="flex justify-between items-center text-xs text-[#444444]">
                <span className="flex items-center space-x-1.5 font-light">
                  <Truck className="w-4 h-4 text-[#B8860B]" />
                  <span>
                    {amountNeeded > 0
                      ? `Add ${formatPrice(amountNeeded)} more to qualify for Free Luxury Shipping`
                      : 'You have unlocked Free Luxury Shipping across India!'}
                  </span>
                </span>
                <span className="font-mono text-[#B8860B] font-semibold">{progressToFreeShipping}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#EAE4D9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B8860B] transition-all duration-500 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {cart.map((item) => {
                const currentPrice =
                  item.product.sale_price !== null && item.product.sale_price !== undefined
                    ? item.product.sale_price
                    : item.product.price;

                const primaryImage =
                  item.product.images && item.product.images.length > 0
                    ? item.product.images[0].image_url
                    : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={item.product.id}
                    className="p-4 bg-white border border-[#EAE5DC] rounded-xl flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 shadow-card"
                  >
                    <img
                      src={primaryImage}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg bg-[#F5F2EB] flex-shrink-0 border border-[#EAE5DC]"
                    />

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#777777] block">
                        {item.product.category_name || 'Haute Parfumerie'} • {item.product.volume_ml} ML
                      </span>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-lg text-[#141414] hover:text-[#B8860B] transition-colors block font-medium"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-xs font-mono text-[#B8860B] font-semibold block">
                        {formatPrice(currentPrice)} each
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-[#EAE5DC] rounded-lg bg-[#FAF9F6] px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-[#666666] hover:text-[#141414] p-1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm px-3 text-[#141414] font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="text-[#666666] hover:text-[#141414] p-1 disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-[#999999] hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right sm:w-28">
                      <span className="font-mono text-base font-bold text-[#B8860B]">
                        {formatPrice(currentPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 space-y-6 sticky top-28 shadow-card">
              <h2 className="font-serif text-xl text-[#141414] border-b border-[#EAE5DC] pb-3 font-medium">
                Bag Summary
              </h2>

              <div className="space-y-3 text-xs text-[#555555] font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#141414] font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-mono text-[#141414] font-medium">
                    {shippingCharge === 0 ? (
                      <span className="text-emerald-700 uppercase tracking-wider text-[11px] font-semibold">Free</span>
                    ) : (
                      formatPrice(shippingCharge)
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#EAE5DC] flex justify-between text-base font-serif text-[#141414]">
                  <span>Total</span>
                  <span className="text-[#B8860B] font-mono font-bold text-lg">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-gold-sm transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-2 text-center pt-2">
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#777777] font-light">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Razorpay Verified • Online Prepaid Only</span>
                </div>
                <p className="text-[10px] text-[#888888]">
                  Complimentary luxury box packaging included with every bottle.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
