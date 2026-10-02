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

// Database Service Layer
export const dbService = {
  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .order('created_at', { ascending: false });

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
    let updatedProduct: Product;

    if (product.id) {
      // Edit existing
      const index = products.findIndex((p) => p.id === product.id);
      if (index === -1) throw new Error('Product not found');
      
      updatedProduct = {
        ...products[index],
        ...product,
        updated_at: new Date().toISOString(),
      } as Product;
      products[index] = updatedProduct;
    } else {
      // Create new
      const newId = `prod-${Date.now()}`;
      const slug = product.slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `product-${Date.now()}`);
      
      updatedProduct = {
        id: newId,
        name: product.name || 'Untitled Fragrance',
        slug,
        category_id: product.category_id || '',
        category_name: product.category_name,
        price: Number(product.price) || 0,
        sale_price: product.sale_price ? Number(product.sale_price) : null,
        description: product.description || '',
        fragrance_family: product.fragrance_family || '',
        top_notes: product.top_notes || '',
        heart_notes: product.heart_notes || '',
        base_notes: product.base_notes || '',
        volume_ml: product.volume_ml || 50,
        stock_quantity: Number(product.stock_quantity) || 0,
        sku: product.sku || `ALZ-${Math.floor(1000 + Math.random() * 9000)}`,
        is_bestseller: !!product.is_bestseller,
        is_new_arrival: !!product.is_new_arrival,
        is_featured: !!product.is_featured,
        is_active: product.is_active !== undefined ? product.is_active : true,
        rating: product.rating || 5.0,
        review_count: product.review_count || 1,
        images: product.images || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      products.unshift(updatedProduct);
    }

    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Sync with Supabase if live
    if (supabase) {
      try {
        const { images, ...productData } = updatedProduct;
        await supabase.from('products').upsert(productData);
      } catch (err) {
        console.warn('Could not sync product with Supabase:', err);
      }
    }

    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    let products = await this.getProducts();
    products = products.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Could not delete product in Supabase:', err);
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
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

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
    let updatedCategory: Category;

    if (category.id) {
      const index = categories.findIndex((c) => c.id === category.id);
      if (index === -1) throw new Error('Category not found');
      updatedCategory = { ...categories[index], ...category } as Category;
      categories[index] = updatedCategory;
    } else {
      const newId = `cat-${Date.now()}`;
      const slug = category.slug || (category.name ? category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `category-${Date.now()}`);
      
      updatedCategory = {
        id: newId,
        name: category.name || 'New Category',
        slug,
        description: category.description || '',
        image_url: category.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        display_order: category.display_order || categories.length + 1,
        is_active: category.is_active !== undefined ? category.is_active : true,
      };
      categories.push(updatedCategory);
    }

    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    if (supabase) {
      try {
        await supabase.from('categories').upsert(updatedCategory);
      } catch (err) {
        console.warn('Could not sync category with Supabase:', err);
      }
    }

    return updatedCategory;
  },

  async deleteCategory(id: string): Promise<boolean> {
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
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

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
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'general')
          .single();

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
    // If Supabase Storage is configured, upload to 'product-images' bucket
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, converting to local data URI:', err);
      }
    }

    // Fallback: convert file to Base64 Data URL for zero-friction local storage and preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
