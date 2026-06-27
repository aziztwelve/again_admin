export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  min_purchase_amount: number | null;
  allow_promo_codes: boolean;
  is_stackable: boolean;
  is_active: boolean;
  priority: number;
  max_uses: number | null;
  times_used: number;
  created_at: string;
  updated_at: string;
  trigger_products?: PromotionProduct[];
  gift_products?: PromotionGiftProduct[];
}

export interface PromotionProduct {
  id: number;
  promotion_id: number;
  product_id: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface PromotionGiftProduct {
  id: number;
  promotion_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

export interface PromotionStats {
  total_uses: number;
  total_orders: number;
  total_revenue: number;
  recent_usages: PromotionUsage[];
}

export interface PromotionUsage {
  id: number;
  promotion_id: number;
  order_id: number;
  client_id: number;
  gift_product_id: number | null;
  used_at: string;
  order?: any;
  client?: any;
}

export interface PromotionFormData {
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  min_purchase_amount: number | null;
  allow_promo_codes: boolean;
  is_stackable: boolean;
  is_active: boolean;
  priority: number;
  max_uses: number | null;
  trigger_product_ids: number[];
  gift_products: {
    product_id: number;
    quantity: number;
  }[];
}
