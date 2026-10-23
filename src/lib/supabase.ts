import { createClient } from '@supabase/supabase-js';
import { Product, Category, Order, StoreSettings, UserProfile, OrderStatus, HomepageContent } from '../types';
import { initialCategories, initialProducts, initialSettings, initialOrders, initialHomepageContent } from './initialData';

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
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Local storage keys for persistent offline/development data
const STORAGE_KEYS = {
  PRODUCTS: 'aleez_products',
  CATEGORIES: 'aleez_categories',
  ORDERS: 'aleez_orders',
  SETTINGS: 'aleez_settings',
  HOMEPAGE: 'aleez_homepage_content',
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

// Helper to retrieve current session Authorization headers for admin API calls
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return headers;
};

// Helper functions for dual 50ml and 100ml pricing persistence
export function parseSizeMetadata(description?: string): {
  cleanDescription: string;
  price_50ml?: number;
  sale_price_50ml?: number | null;
  price_100ml?: number;
  sale_price_100ml?: number | null;
} {
  if (!description) return { cleanDescription: '' };
  const match = description.match(/<!--sizes:(.*?)-->/);
  if (!match) return { cleanDescription: description };
  try {
    const meta = JSON.parse(match[1]);
    const clean = description.replace(/<!--sizes:(.*?)-->/g, '').trim();
    return {
      cleanDescription: clean,
      price_50ml: meta.p50 !== undefined && meta.p50 !== null && meta.p50 !== '' ? Number(meta.p50) : undefined,
      sale_price_50ml: meta.sp50 !== undefined && meta.sp50 !== null && meta.sp50 !== '' ? Number(meta.sp50) : null,
      price_100ml: meta.p100 !== undefined && meta.p100 !== null && meta.p100 !== '' ? Number(meta.p100) : undefined,
      sale_price_100ml: meta.sp100 !== undefined && meta.sp100 !== null && meta.sp100 !== '' ? Number(meta.sp100) : null,
    };
  } catch {
    return { cleanDescription: description };
  }
}

export function encodeSizeMetadata(
  description: string,
  p50?: number,
  sp50?: number | null,
  p100?: number,
  sp100?: number | null
): string {
  const clean = (description || '').replace(/<!--sizes:(.*?)-->/g, '').trim();
  const metaObj = {
    p50: p50 !== undefined && p50 !== null && (p50 as any) !== '' ? Number(p50) : null,
    sp50: sp50 !== undefined && sp50 !== null && (sp50 as any) !== '' ? Number(sp50) : null,
    p100: p100 !== undefined && p100 !== null && (p100 as any) !== '' ? Number(p100) : null,
    sp100: sp100 !== undefined && sp100 !== null && (sp100 as any) !== '' ? Number(sp100) : null,
  };
  return `${clean}\n<!--sizes:${JSON.stringify(metaObj)}-->`;
}

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
          return data.map((p) => {
            const parsed = parseSizeMetadata(p.description);
            const p50 = parsed.price_50ml ?? (p.price_50ml !== undefined && p.price_50ml !== null ? Number(p.price_50ml) : Number(p.price));
            const sp50 = parsed.sale_price_50ml !== undefined ? parsed.sale_price_50ml : (p.sale_price_50ml !== undefined && p.sale_price_50ml !== null ? Number(p.sale_price_50ml) : (p.sale_price ? Number(p.sale_price) : null));
            const p100 = parsed.price_100ml ?? (p.price_100ml !== undefined && p.price_100ml !== null ? Number(p.price_100ml) : Math.round(p50 * 1.6));
            const sp100 = parsed.sale_price_100ml !== undefined ? parsed.sale_price_100ml : (p.sale_price_100ml !== undefined && p.sale_price_100ml !== null ? Number(p.sale_price_100ml) : null);
            return {
              ...p,
              description: parsed.cleanDescription,
              price: p50,
              sale_price: sp50,
              price_50ml: p50,
              sale_price_50ml: sp50,
              price_100ml: p100,
              sale_price_100ml: sp100,
              images: p.product_images || [],
            };
          });
        }
      } catch (err) {
        console.warn('Supabase fetch products failed, falling back to local store', err);
      }
    }
    const local = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return local.map((p) => {
      const parsed = parseSizeMetadata(p.description);
      const p50 = parsed.price_50ml ?? (p.price_50ml !== undefined && p.price_50ml !== null ? Number(p.price_50ml) : Number(p.price));
      const sp50 = parsed.sale_price_50ml !== undefined ? parsed.sale_price_50ml : (p.sale_price_50ml !== undefined && p.sale_price_50ml !== null ? Number(p.sale_price_50ml) : (p.sale_price ? Number(p.sale_price) : null));
      const p100 = parsed.price_100ml ?? (p.price_100ml !== undefined && p.price_100ml !== null ? Number(p.price_100ml) : Math.round(p50 * 1.6));
      const sp100 = parsed.sale_price_100ml !== undefined ? parsed.sale_price_100ml : (p.sale_price_100ml !== undefined && p.sale_price_100ml !== null ? Number(p.sale_price_100ml) : null);
      return {
        ...p,
        description: parsed.cleanDescription,
        price: p50,
        sale_price: sp50,
        price_50ml: p50,
        sale_price_50ml: sp50,
        price_100ml: p100,
        sale_price_100ml: sp100,
      };
    });
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

    const p50 = product.price_50ml !== undefined && product.price_50ml !== null && (product.price_50ml as unknown) !== '' ? Number(product.price_50ml) : (Number(product.price) || 0);
    const sp50 = product.sale_price_50ml !== undefined && product.sale_price_50ml !== null && (product.sale_price_50ml as unknown) !== '' ? Number(product.sale_price_50ml) : null;
    const p100 = product.price_100ml !== undefined && product.price_100ml !== null && (product.price_100ml as unknown) !== '' ? Number(product.price_100ml) : Math.round(p50 * 1.6);
    const sp100 = product.sale_price_100ml !== undefined && product.sale_price_100ml !== null && (product.sale_price_100ml as unknown) !== '' ? Number(product.sale_price_100ml) : null;

    const rawDesc = product.description || '';
    const cleanDesc = rawDesc.replace(/<!--sizes:(.*?)-->/g, '').trim();
    const encodedDesc = encodeSizeMetadata(cleanDesc, p50, sp50, p100, sp100);

    let updatedProduct: Product = {
      id: productId,
      name: product.name || 'Untitled Fragrance',
      slug,
      category_id: product.category_id && isValidUUID(product.category_id) ? product.category_id : '',
      category_name: product.category_name,
      price: p50,
      sale_price: sp50,
      price_50ml: p50,
      sale_price_50ml: sp50,
      price_100ml: p100,
      sale_price_100ml: sp100,
      description: encodedDesc,
      fragrance_family: product.fragrance_family || '',
      inspired_by: product.inspired_by || '',
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
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: authHeaders,
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

    // Ensure returned and cached product has clean description and explicit size prices
    updatedProduct = {
      ...updatedProduct,
      description: cleanDesc,
      price: p50,
      sale_price: sp50,
      price_50ml: p50,
      sale_price_50ml: sp50,
      price_100ml: p100,
      sale_price_100ml: sp100,
    };

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
      const authHeaders = await getAuthHeaders();
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: authHeaders });
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
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: authHeaders,
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
      const authHeaders = await getAuthHeaders();
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders });
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
    if (supabase) {
      try {
        // Query filtered directly at DB level respecting RLS
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(emailOrUserId);
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (isUUID) {
          query = query.or(`user_id.eq.${emailOrUserId},customer_email.eq.${emailOrUserId}`);
        } else {
          query = query.eq('customer_email', emailOrUserId);
        }

        const { data, error } = await withTimeout(query);
        if (!error && data) {
          return data.map((o) => ({
            ...o,
            items: o.order_items || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch user orders failed:', err);
      }
    }
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

  // --- HOMEPAGE CONTENT ---
  async getHomepageContent(): Promise<HomepageContent> {
    const sanitizeBespoke = (content: HomepageContent): HomepageContent => {
      if (content.hero?.secondary_btn_text && /bespoke/i.test(content.hero.secondary_btn_text)) {
        content.hero.secondary_btn_text = 'Custom Fragrance';
      }
      return content;
    };

    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('store_settings')
            .select('value')
            .eq('key', 'homepage')
            .single()
        );

        if (!error && data && data.value) {
          return sanitizeBespoke({ ...initialHomepageContent, ...data.value });
        }
      } catch (err) {
        console.warn('Supabase fetch homepage content failed, using local/default:', err);
      }
    }
    return sanitizeBespoke(getFromStorage<HomepageContent>(STORAGE_KEYS.HOMEPAGE, initialHomepageContent));
  },

  async saveHomepageContent(content: Partial<HomepageContent>): Promise<HomepageContent> {
    const current = await this.getHomepageContent();
    const updated: HomepageContent = {
      ...current,
      ...content,
      hero: { ...current.hero, ...(content.hero || {}) },
      spotlight: { ...current.spotlight, ...(content.spotlight || {}) },
      specialties: {
        ...current.specialties,
        ...(content.specialties || {}),
        cards: content.specialties?.cards || current.specialties.cards,
      },
      bestsellers_section: { ...current.bestsellers_section, ...(content.bestsellers_section || {}) },
      bespoke_studio: { ...current.bespoke_studio, ...(content.bespoke_studio || {}) },
      pillars: content.pillars || current.pillars,
      newsletter: { ...current.newsletter, ...(content.newsletter || {}) },
    };
    saveToStorage(STORAGE_KEYS.HOMEPAGE, updated);

    // Call backend API if running
    try {
      const authHeaders = await getAuthHeaders();
      await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ content: updated }),
      });
    } catch (err) {
      // Offline fallback is already written to storage
    }

    if (supabase) {
      try {
        await supabase
          .from('store_settings')
          .upsert({ key: 'homepage', value: updated });
      } catch (err) {
        console.warn('Could not sync homepage settings with Supabase:', err);
      }
    }
    return updated;
  },

  // --- IMAGE UPLOAD HELPER ---
  async uploadImage(file: File): Promise<string> {
    // 1. Client-side image optimization (downscales large 12-48MP mobile photos to crisp web resolution ~120-250KB)
    const { base64Data, contentType } = await this.optimizeImageForUpload(file);
    if (!base64Data) {
      throw new Error('Could not process selected image.');
    }

    // 2. Upload to Supabase Storage CDN via backend API (service role bypasses RLS)
    try {
      const cleanFileName = file.name ? file.name.replace(/\.[^/.]+$/, "") + ".jpg" : `photo_${Date.now()}.jpg`;
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          fileData: base64Data,
          fileName: cleanFileName,
          contentType: contentType || 'image/jpeg',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          return json.url;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('Backend image upload endpoint responded with status:', res.status, errJson);
      }
    } catch (err) {
      console.warn('Backend image upload endpoint unreachable, falling back to local data URI:', err);
    }

    // 3. Fallback: return optimized Base64 Data URL for preview and local storage
    return base64Data;
  },

  async optimizeImageForUpload(file: File, maxDim = 1400, quality = 0.85): Promise<{ base64Data: string; contentType: string }> {
    // If it's SVG, just read as data URL directly
    if (file.type === 'image/svg+xml') {
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return { base64Data, contentType: file.type };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve({ base64Data: dataUrl, contentType: 'image/jpeg' });
            return;
          }
          resolve({ base64Data: e.target?.result as string, contentType: file.type || 'image/jpeg' });
        };
        img.onerror = () => {
          resolve({ base64Data: e.target?.result as string, contentType: file.type || 'image/jpeg' });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve({ base64Data: '', contentType: 'image/jpeg' });
      };
      reader.readAsDataURL(file);
    });
  },
};
