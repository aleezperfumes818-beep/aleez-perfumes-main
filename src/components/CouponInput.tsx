import React, { useState } from 'react';
import { Tag, Check, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { AVAILABLE_COUPONS } from '../lib/couponService';

interface CouponInputProps {
  className?: string;
  showOffersList?: boolean;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  className = '',
  showOffersList = true,
}) => {
  const { appliedCoupon, discountAmount, applyCoupon, removeCoupon, subtotal } = useCart();
  const { formatPrice } = useSettings();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(false);

  const handleApply = (couponToApply?: string) => {
    setError(null);
    setSuccessMsg(null);
    const targetCode = couponToApply || code;

    if (!targetCode.trim()) {
      setError('Please enter a coupon code.');
      return;
    }

    const res = applyCoupon(targetCode);
    if (res.success) {
      setSuccessMsg(res.message);
      setCode('');
      setShowOffers(false);
    } else {
      setError(res.message);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setSuccessMsg(null);
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className={`p-3 bg-neutral-50 border border-neutral-300 rounded-sm space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" />
            </span>
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold text-black uppercase tracking-wider block truncate">
                {appliedCoupon.code}
              </span>
              <span className="text-[11px] text-neutral-600 block">
                {appliedCoupon.discount_type === 'free_shipping'
                  ? 'Free express courier applied'
                  : `Saved ${formatPrice(discountAmount)} on this order`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-neutral-400 hover:text-black p-1 transition-colors text-xs flex items-center space-x-1 shrink-0"
            title="Remove coupon"
            aria-label="Remove coupon"
          >
            <span className="text-[11px] uppercase tracking-wider font-medium">Remove</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleApply();
        }}
        className="flex items-center space-x-2"
      >
        <div className="relative flex-1">
          <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="PROMO / COUPON CODE"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 focus:border-black text-xs font-mono tracking-wider uppercase text-black placeholder:text-neutral-400 rounded-sm outline-none transition-colors"
            aria-label="Coupon code"
          />
        </div>
        <button
          type="button"
          onClick={() => handleApply()}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shrink-0"
        >
          Apply
        </button>
      </form>

      {/* Error / Success Feedback */}
      {error && (
        <p className="text-xs text-red-600 font-light flex items-center space-x-1 animate-fade-in">
          <span>&bull;</span>
          <span>{error}</span>
        </p>
      )}
      {successMsg && (
        <p className="text-xs text-emerald-700 font-light flex items-center space-x-1 animate-fade-in">
          <span>&bull;</span>
          <span>{successMsg}</span>
        </p>
      )}

      {/* Available Offers Collapsible */}
      {showOffersList && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowOffers((v) => !v)}
            className="text-[11px] text-neutral-600 hover:text-black transition-colors flex items-center space-x-1 font-medium tracking-wide"
          >
            <Sparkles className="w-3 h-3 text-neutral-800" />
            <span>Available Luxury Offers</span>
            {showOffers ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          {showOffers && (
            <div className="mt-2 space-y-2 border border-neutral-200 bg-neutral-50/70 p-3 rounded-sm animate-fade-in">
              {AVAILABLE_COUPONS.map((coupon) => {
                const isEligible = !coupon.min_order_amount || subtotal >= coupon.min_order_amount;
                return (
                  <div
                    key={coupon.code}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-200 last:border-none gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-black uppercase tracking-wider">
                          {coupon.code}
                        </span>
                        {coupon.min_order_amount ? (
                          <span className="text-[10px] text-neutral-500 font-mono">
                            (Min ₹{coupon.min_order_amount})
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-neutral-600 font-light truncate">
                        {coupon.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApply(coupon.code)}
                      disabled={!isEligible}
                      className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-colors shrink-0 ${
                        isEligible
                          ? 'bg-black text-white hover:bg-neutral-800'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
