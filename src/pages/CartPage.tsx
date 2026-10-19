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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-black bg-white">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Your Fragrance Bag
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black mt-1 font-normal">
          Shopping Bag
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-sm border border-neutral-200 p-8 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto text-black">
            <ShoppingBag className="w-7 h-7 opacity-70" />
          </div>
          <h2 className="font-serif text-2xl text-black font-normal">Your bag is currently empty</h2>
          <p className="text-xs text-neutral-500 font-light">
            You haven't added any fragrances to your bag yet.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-neutral-800 transition-colors mt-2 shadow-sm"
          >
            Explore Fragrances
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-xs text-neutral-600">
                <span className="flex items-center space-x-1.5 font-light">
                  <Truck className="w-4 h-4 text-black" />
                  <span>
                    {amountNeeded > 0
                      ? `Add ${formatPrice(amountNeeded)} more to qualify for Free Luxury Shipping`
                      : 'You have unlocked Free Luxury Shipping across India!'}
                  </span>
                </span>
                <span className="font-mono text-black font-semibold">{progressToFreeShipping}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {cart.map((item) => {
                const itemSize = item.selected_size || '50ml';
                const currentPrice = item.selected_price ?? (
                  itemSize === '100ml'
                    ? (item.product.sale_price_100ml ?? item.product.price_100ml ?? Math.round(item.product.price * 1.6))
                    : (item.product.sale_price_50ml ?? item.product.price_50ml ?? item.product.sale_price ?? item.product.price)
                );

                const primaryImage =
                  item.product.images && item.product.images.length > 0
                    ? item.product.images[0].image_url
                    : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={`${item.product.id}-${itemSize}`}
                    className="p-4 bg-white border border-neutral-200 rounded-sm flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 shadow-sm"
                  >
                    <img
                      src={primaryImage}
                      alt={`Luxury bottle of ${item.product.name}`}
                      className="w-24 h-24 object-cover rounded-sm bg-neutral-50 flex-shrink-0 border border-neutral-200"
                    />

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-black text-white px-2 py-0.5 rounded-xs">
                          {itemSize.toUpperCase()}
                        </span>
                        <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                          {item.product.category_name || 'Haute Parfumerie'}
                        </span>
                      </div>

                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-lg text-black hover:text-neutral-600 transition-colors block font-medium"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-xs font-mono text-black font-semibold block">
                        {formatPrice(currentPrice)} each
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-neutral-300 rounded-sm bg-neutral-50 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, itemSize)}
                          className="text-neutral-600 hover:text-black p-1"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span className="font-mono text-sm px-3 text-black font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, itemSize)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="text-neutral-600 hover:text-black p-1 disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, itemSize)}
                        className="p-2 text-neutral-400 hover:text-black transition-colors"
                        aria-label="Remove item from bag"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right sm:w-28">
                      <span className="font-mono text-base font-bold text-black">
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
            <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-6 sticky top-28 shadow-sm">
              <h2 className="font-serif text-xl text-black border-b border-neutral-200 pb-3 font-medium">
                Bag Summary
              </h2>

              <div className="space-y-3 text-xs text-neutral-600 font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-black font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-mono text-black font-medium">
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
                <div className="pt-3 border-t border-neutral-200 flex justify-between text-base font-serif text-black">
                  <span>Total</span>
                  <span className="text-black font-mono font-bold text-lg">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm shadow-sm transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-2 text-center pt-2">
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-neutral-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span>Razorpay Verified • Online Prepaid Only</span>
                </div>
                <p className="text-[10px] text-neutral-400">
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
