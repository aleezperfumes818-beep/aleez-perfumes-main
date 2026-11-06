import { Coupon } from '../types';

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    description: '10% off your entire order (Welcome offer)',
    is_active: true,
    usage_count: 24,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'coup-2',
    code: 'ALEEZ10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    description: '10% off your fragrance order',
    is_active: true,
    usage_count: 18,
    created_at: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'coup-3',
    code: 'ALEEZ15',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 1999,
    description: '15% off on orders above ₹1,999',
    is_active: true,
    usage_count: 12,
    created_at: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'coup-4',
    code: 'LUXURY20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 2999,
    description: '20% off on orders above ₹2,999',
    is_active: true,
    usage_count: 9,
    created_at: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'coup-5',
    code: 'EXTRAIT200',
    discount_type: 'fixed',
    discount_value: 200,
    min_order_amount: 1499,
    description: 'Flat ₹200 off on orders above ₹1,499',
    is_active: true,
    usage_count: 31,
    created_at: new Date('2026-02-15').toISOString(),
  },
  {
    id: 'coup-6',
    code: 'FREESHIP',
    discount_type: 'free_shipping',
    discount_value: 0,
    min_order_amount: 0,
    description: '100% Free Express Shipping on any order',
    is_active: true,
    usage_count: 45,
    created_at: new Date('2026-03-01').toISOString(),
  },
];

const COUPONS_STORAGE_KEY = 'aleez_admin_coupons';

export const getCoupons = (): Coupon[] => {
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COUPONS;
  } catch (err) {
    console.error('Error reading admin coupons:', err);
    return DEFAULT_COUPONS;
  }
};

export const saveCoupon = (coupon: Omit<Coupon, 'id'> & { id?: string }): Coupon[] => {
  const current = getCoupons();
  const normalizedCode = coupon.code.trim().toUpperCase();

  const existingIndex = current.findIndex(
    (c) => (coupon.id && c.id === coupon.id) || c.code.toUpperCase() === normalizedCode
  );

  let updated: Coupon[];
  if (existingIndex >= 0) {
    const target = current[existingIndex];
    current[existingIndex] = {
      ...target,
      ...coupon,
      code: normalizedCode,
      is_active: coupon.is_active !== undefined ? coupon.is_active : target.is_active ?? true,
    };
    updated = [...current];
  } else {
    const newCoupon: Coupon = {
      ...coupon,
      id: coupon.id || `coup-${Date.now()}`,
      code: normalizedCode,
      is_active: coupon.is_active !== undefined ? coupon.is_active : true,
      usage_count: 0,
      created_at: new Date().toISOString(),
    };
    updated = [newCoupon, ...current];
  }

  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save coupons:', e);
  }
  return updated;
};

export const deleteCoupon = (identifier: string): Coupon[] => {
  const current = getCoupons();
  const updated = current.filter(
    (c) => c.id !== identifier && c.code.toUpperCase() !== identifier.toUpperCase()
  );
  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete coupon:', e);
  }
  return updated;
};

export const toggleCouponStatus = (identifier: string): Coupon[] => {
  const current = getCoupons();
  const updated = current.map((c) => {
    if (c.id === identifier || c.code.toUpperCase() === identifier.toUpperCase()) {
      return { ...c, is_active: !(c.is_active ?? true) };
    }
    return c;
  });
  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to toggle coupon status:', e);
  }
  return updated;
};

export const resetToDefaultCoupons = (): Coupon[] => {
  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(DEFAULT_COUPONS));
  } catch (e) {
    console.error('Failed to reset coupons:', e);
  }
  return DEFAULT_COUPONS;
};

export const validateCoupon = (
  rawCode: string,
  subtotal: number
): { valid: boolean; coupon?: Coupon; error?: string } => {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    return { valid: false, error: 'Please enter a coupon code.' };
  }

  const coupons = getCoupons();
  const match = coupons.find((c) => c.code.toUpperCase() === code);
  if (!match) {
    return { valid: false, error: 'Invalid coupon code. Please verify and try again.' };
  }

  if (match.is_active === false) {
    return { valid: false, error: `Coupon "${match.code}" is currently expired or deactivated.` };
  }

  if (match.min_order_amount && subtotal < match.min_order_amount) {
    return {
      valid: false,
      error: `Coupon "${match.code}" requires a minimum order value of ₹${match.min_order_amount.toLocaleString('en-IN')}.`,
    };
  }

  return { valid: true, coupon: match };
};
