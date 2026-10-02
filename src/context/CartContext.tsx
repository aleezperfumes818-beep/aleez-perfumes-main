import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  subtotal: number;
  shippingCharge: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number;
  progressToFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'aleez_perfumes_cart';
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    if (!product.is_active) {
      return { success: false, message: 'This fragrance is currently unavailable.' };
    }

    if (product.stock_quantity <= 0) {
      return { success: false, message: 'Sorry, this fragrance is currently out of stock.' };
    }

    let message = '';
    let success = true;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock_quantity) {
          success = false;
          message = `Cannot add more. Only ${product.stock_quantity} available in stock.`;
          return prev;
        }
        message = `Updated ${product.name} quantity to ${newQty}.`;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock_quantity) {
          success = false;
          message = `Only ${product.stock_quantity} available in stock.`;
          return prev;
        }
        message = `${product.name} added to your bag.`;
        return [...prev, { product, quantity }];
      }
    });

    if (success) {
      setIsCartOpen(true);
    }

    return { success, message };
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true, message: 'Item removed from bag.' };
    }

    let success = true;
    let message = '';

    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (!item) return prev;

      if (quantity > item.product.stock_quantity) {
        success = false;
        message = `Maximum available stock is ${item.product.stock_quantity}.`;
        return prev;
      }

      return prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
    });

    return { success, message };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.sale_price !== null && item.product.sale_price !== undefined
      ? item.product.sale_price
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingCharge;
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shippingCharge,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        progressToFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
