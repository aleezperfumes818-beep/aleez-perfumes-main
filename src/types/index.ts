export interface ProductImage {
  id: string;
  product_id?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  price: number;
  sale_price?: number | null;
  price_50ml?: number;
  sale_price_50ml?: number | null;
  price_100ml?: number;
  sale_price_100ml?: number | null;
  description: string;
  fragrance_family?: string;
  inspired_by?: string;
  top_notes?: string;
  heart_notes?: string;
  base_notes?: string;
  volume_ml: number;
  stock_quantity: number;
  sku: string;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  images: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_size?: '50ml' | '100ml';
  selected_price?: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  selected_size?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  shipping_charge: number;
  total_amount: number;
  payment_method: 'razorpay';
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at?: string;
}

export interface AdminTeamMember {
  id: string;
  email: string;
  full_name: string;
  title: 'Super Admin' | 'Store Manager' | 'Order Dispatcher';
  phone?: string;
  is_primary?: boolean;
  created_at: string;
}

export interface StoreSettings {
  brand_name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  instagram_url: string;
  currency: string;
  currency_symbol: string;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  announcement_bar: string;
  is_store_open: boolean;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface HomepageContent {
  hero: {
    badge: string;
    title_line1: string;
    title_line2: string;
    subtitle: string;
    primary_btn_text: string;
    primary_btn_link: string;
    secondary_btn_text: string;
    secondary_btn_link: string;
    video_url: string;
    fallback_image_url: string;
  };
  spotlight: {
    enabled: boolean;
    badge?: string;
    title: string;
    subtitle: string;
    product_id?: string;
    custom_name?: string;
    custom_inspired_by?: string;
    custom_category?: string;
    custom_description?: string;
    custom_image_url?: string;
    custom_price?: number;
    custom_sale_price?: number | null;
    top_notes?: string;
    heart_notes?: string;
    base_notes?: string;
    concentration_text?: string;
    bottle_size_text?: string;
    button_text?: string;
  };
  specialties: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      id: string;
      title: string;
      subtitle: string;
      description: string;
      image_url: string;
      link: string;
    }>;
  };
  bestsellers_section: {
    badge: string;
    title: string;
    subtitle: string;
    cta_text: string;
  };
  bespoke_studio: {
    enabled: boolean;
    badge: string;
    title_line1: string;
    title_line2: string;
    description: string;
    button_text: string;
    whatsapp_consult_text: string;
  };
  pillars: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  newsletter: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

