import { Coupon } from '../types';

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    description: '10% off your entire order (Welcome offer)',
  },
  {
    code: 'ALEEZ10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    description: '10% off your fragrance order',
  },
  {
    code: 'ALEEZ15',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 1999,
    description: '15% off on orders above ₹1,999',
  },
  {
    code: 'LUXURY20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 2999,
    description: '20% off on orders above ₹2,999',
  },
  {
    code: 'EXTRAIT200',
    discount_type: 'fixed',
    discount_value: 200,
    min_order_amount: 1499,
    description: 'Flat ₹200 off on orders above ₹1,499',
  },
  {
    code: 'FREESHIP',
    discount_type: 'free_shipping',
    discount_value: 0,
    min_order_amount: 0,
    description: '100% Free Express Shipping on any order',
  },
];

export const validateCoupon = (
  rawCode: string,
  subtotal: number
): { valid: boolean; coupon?: Coupon; error?: string } => {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    return { valid: false, error: 'Please enter a coupon code.' };
  }

  const match = AVAILABLE_COUPONS.find((c) => c.code === code);
  if (!match) {
    return { valid: false, error: 'Invalid coupon code. Please verify and try again.' };
  }

  if (match.min_order_amount && subtotal < match.min_order_amount) {
    return {
      valid: false,
      error: `Coupon "${match.code}" requires a minimum order value of ₹${match.min_order_amount.toLocaleString('en-IN')}.`,
    };
  }

  return { valid: true, coupon: match };
};
