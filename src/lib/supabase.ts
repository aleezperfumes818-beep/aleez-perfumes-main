import { createClient } from '@supabase/supabase-js';
import { Product, Category, Order, StoreSettings, UserProfile, OrderStatus } from '../types';
import { initialCategories, initialProducts, initialSettings, initialOrders } from './initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase keys are set (not mock placeholders)
const isLiveSupabase = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('mock_') &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isLiveSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage keys for persistent offline/development data
const STORAGE_KEYS = {
  PRODUCTS: 'aleez_products',
  CATEGORIES: 'aleez_categories',
  ORDERS: 'aleez_orders',
  SETTINGS: 'aleez_settings',
  USERS: 'aleez_users',
  CURRENT_USER: 'aleez_current_user',
};

// Safe localStorage helper
const getFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

// Safe timeout wrapper for external database queries
const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs = 3500): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out')), timeoutMs)
    ),
  ]);
};

// Database Service Layer
export const dbService = {
  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('products')
            .select('*, product_images(*)')
            .order('created_at', { ascending: false })
        );

        if (!error && data && data.length > 0) {
          return data.map((p) => ({
            ...p,
            images: p.product_images || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch products failed, falling back to local store', err);
      }
    }
    return getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.slug === slug && p.is_active) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  async saveProduct(product: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();

    const isValidUUID = (id?: string) =>
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const generateUUID = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'b' + Math.random().toString(16).substring(2, 10) + '-0000-4000-8000-' + Math.random().toString(16).substring(2, 14);

    const productId = product.id && isValidUUID(product.id) ? product.id : generateUUID();
    const slug =
      product.slug ||
      (product.name
        ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : `product-${Date.now()}`);

    let updatedProduct: Product = {
      id: productId,
      name: product.name || 'Untitled Fragrance',
      slug,
      category_id: product.category_id && isValidUUID(product.category_id) ? product.category_id : '',
      category_name: product.category_name,
      price: Number(product.price) || 0,
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      description: product.description || '',
      fragrance_family: product.fragrance_family || '',
      top_notes: product.top_notes || '',
      heart_notes: product.heart_notes || '',
      base_notes: product.base_notes || '',
      volume_ml: Number(product.volume_ml) || 50,
      stock_quantity: Number(product.stock_quantity) || 0,
      sku: product.sku || `ALZ-${Math.floor(1000 + Math.random() * 9000)}`,
      is_bestseller: !!product.is_bestseller,
      is_new_arrival: !!product.is_new_arrival,
      is_featured: !!product.is_featured,
      is_active: product.is_active !== undefined ? product.is_active : true,
      rating: product.rating || 4.9,
      review_count: product.review_count || 18,
      images: product.images && product.images.length > 0 ? product.images : [
        {
          id: `img-${Date.now()}`,
          image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
          alt_text: product.name || 'Aleez Perfumes',
          display_order: 1,
          is_primary: true,
        },
      ],
      created_at: product.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Sync via Backend API (uses Supabase service role, guarantees RLS bypass)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updatedProduct }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.product) {
          updatedProduct = {
            ...updatedProduct,
            ...json.product,
            images: json.product.images?.length > 0 ? json.product.images : updatedProduct.images,
          };
        }
      }
    } catch (apiErr) {
      console.warn('Backend product save endpoint unreachable, using local fallback:', apiErr);
    }

    // 2. Update local storage cache
    const existingIdx = products.findIndex(
      (p) => p.id === updatedProduct.id || (product.id && p.id === product.id) || p.slug === updatedProduct.slug
    );
    if (existingIdx >= 0) {
      products[existingIdx] = updatedProduct;
    } else {
      products.unshift(updatedProduct);
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete product unreachable:', err);
    }

    let products = await this.getProducts();
    products = products.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    if (supabase) {
      try {
        await supabase.from('product_images').delete().eq('product_id', id);
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Could not delete product in Supabase directly:', err);
      }
    }
    return true;
  },

  async duplicateProduct(id: string): Promise<Product> {
    const original = await this.getProductById(id);
    if (!original) throw new Error('Original product not found');

    const duplicate: Partial<Product> = {
      ...original,
      id: undefined,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${original.sku}-CPY`,
      is_active: false, // Start as inactive so admin can edit first
    };

    return this.saveProduct(duplicate);
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })
        );

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase fetch categories failed, falling back', err);
      }
    }
    return getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  async saveCategory(category: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();

    const isValidUUID = (id?: string) =>
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const generateUUID = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'c' + Math.random().toString(16).substring(2, 10) + '-0000-4000-8000-' + Math.random().toString(16).substring(2, 14);

    const catId = category.id && isValidUUID(category.id) ? category.id : generateUUID();
    const slug =
      category.slug ||
      (category.name
        ? category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : `category-${Date.now()}`);

    let updatedCategory: Category = {
      id: catId,
      name: category.name || 'New Category',
      slug,
      description: category.description || '',
      image_url:
        category.image_url ||
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      display_order: Number(category.display_order) || categories.length + 1,
      is_active: category.is_active !== undefined ? category.is_active : true,
    };

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: updatedCategory }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.category) {
          updatedCategory = { ...updatedCategory, ...json.category };
        }
      }
    } catch (err) {
      console.warn('Backend category save endpoint unreachable:', err);
    }

    const existingIdx = categories.findIndex(
      (c) => c.id === updatedCategory.id || (category.id && c.id === category.id) || c.slug === updatedCategory.slug
    );
    if (existingIdx >= 0) {
      categories[existingIdx] = updatedCategory;
    } else {
      categories.push(updatedCategory);
    }
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    return updatedCategory;
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete category unreachable:', err);
    }

    let categories = await this.getCategories();
    categories = categories.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Could not delete category in Supabase:', err);
      }
    }
    return true;
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false })
        );

        if (!error && data && data.length > 0) {
          return data.map((o) => ({
            ...o,
            items: o.order_items || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch orders failed, falling back', err);
      }
    }
    return getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id || o.order_number === id) || null;
  },

  async getOrdersByUser(emailOrUserId: string): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter(
      (o) => o.customer_email.toLowerCase() === emailOrUserId.toLowerCase() || o.user_id === emailOrUserId
    );
  },

  async saveOrder(order: Order): Promise<Order> {
    const orders = await this.getOrders();
    const existingIndex = orders.findIndex((o) => o.order_number === order.order_number || o.id === order.id);

    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
    }
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const orders = await this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    orders[orderIndex].order_status = status;
    orders[orderIndex].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({ order_status: status })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Could not update order in Supabase:', err);
      }
    }

    return orders[orderIndex];
  },

  // Stock deduction helper
  async deductStock(items: { product_id: string; quantity: number }[]): Promise<void> {
    const products = await this.getProducts();
    for (const item of items) {
      const idx = products.findIndex((p) => p.id === item.product_id);
      if (idx !== -1) {
        products[idx].stock_quantity = Math.max(0, products[idx].stock_quantity - item.quantity);
      }
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  },

  // --- SETTINGS ---
  async getSettings(): Promise<StoreSettings> {
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('store_settings')
            .select('value')
            .eq('key', 'general')
            .single()
        );

        if (!error && data && data.value) {
          return { ...initialSettings, ...data.value };
        }
      } catch (err) {
        console.warn('Supabase fetch settings failed, using stored/default', err);
      }
    }
    return getFromStorage<StoreSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
  },

  async saveSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);

    if (supabase) {
      try {
        await supabase
          .from('store_settings')
          .upsert({ key: 'general', value: updated });
      } catch (err) {
        console.warn('Could not sync settings with Supabase:', err);
      }
    }
    return updated;
  },

  // --- IMAGE UPLOAD HELPER ---
  async uploadImage(file: File): Promise<string> {
    // 1. Read file as Base64 Data URL
    const base64Data: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // 2. Upload to Supabase Storage CDN via backend API (service role bypasses RLS)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          return json.url;
        }
      }
    } catch (err) {
      console.warn('Backend image upload endpoint unreachable, falling back to local data URI:', err);
    }

    // 3. Fallback: return Base64 Data URL for preview and local storage
    return base64Data;
  },
};
