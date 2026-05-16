import { Product } from "@/models/Product";

export class Promotion {
  id: number | undefined;
  name: string | undefined;
  description: string | null | undefined;
  startsAt: string | undefined;
  endsAt: string | undefined;
  minPurchaseAmount: number | null | undefined;
  allowPromoCodes: boolean | undefined;
  isActive: boolean | undefined;
  priority: number | undefined;
  maxUses: number | null | undefined;
  timesUsed: number | undefined;
  createdAt: string | undefined;
  updatedAt: string | undefined;

  triggerProducts: Product[] | null | undefined;
  giftProducts: { product: Product; quantity: number }[] | null | undefined;

  triggerProductIds: number[];
  giftProductsData: { product_id: number; quantity: number }[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.description = null;
    this.startsAt = undefined;
    this.endsAt = undefined;
    this.minPurchaseAmount = null;
    this.allowPromoCodes = false;
    this.isActive = true;
    this.priority = 10;
    this.maxUses = null;
    this.timesUsed = 0;
    this.createdAt = undefined;
    this.updatedAt = undefined;

    this.triggerProducts = null;
    this.giftProducts = null;
    this.triggerProductIds = [];
    this.giftProductsData = [];
  }

  get usageLabel(): string {
    const used = this.timesUsed || 0;
    const max = this.maxUses || "∞";
    return `${used} / ${max}`;
  }

  get statusLabel(): string {
    if (!this.isActive) return "Неактивна";

    const now = new Date();
    const start = this.startsAt ? new Date(this.startsAt) : null;
    const end = this.endsAt ? new Date(this.endsAt) : null;

    if (start && now < start) return "Запланирована";
    if (end && now > end) return "Завершена";

    return "Активна";
  }

  static fromJSON(json: any): Promotion {
    const promotion = new Promotion();
    promotion.id = json.id;
    promotion.name = json.name;
    promotion.description = json.description ?? null;
    promotion.startsAt = json.starts_at ?? undefined;
    promotion.endsAt = json.ends_at ?? undefined;
    promotion.minPurchaseAmount = json.min_purchase_amount ?? null;
    promotion.allowPromoCodes = !!json.allow_promo_codes;
    promotion.isActive = !!json.is_active;
    promotion.priority = json.priority ?? 10;
    promotion.maxUses = json.max_uses ?? null;
    promotion.timesUsed = json.times_used ?? 0;
    promotion.createdAt = json.created_at;
    promotion.updatedAt = json.updated_at;

    // Trigger products
    promotion.triggerProductIds = json.trigger_products
      ? json.trigger_products.map((item: any) => item.id || item.product_id)
      : [];
    promotion.triggerProducts = json.trigger_products
      ? json.trigger_products.map((item: any) => {
          // API returns products directly in the array, not nested under 'product'
          const productData = item.product || item;
          return productData ? Product.fromJSON(productData) : null;
        }).filter((p: any) => p !== null)
      : null;

    // Gift products
    promotion.giftProductsData = json.gift_products
      ? json.gift_products.map((item: any) => ({
          product_id: item.id || item.product_id,
          quantity: item.pivot?.quantity || item.quantity || 1,
        }))
      : [];
    promotion.giftProducts = json.gift_products
      ? json.gift_products.map((item: any) => {
          // API returns products directly in the array, not nested under 'product'
          const productData = item.product || item;
          return productData ? {
            product: Product.fromJSON(productData),
            quantity: item.pivot?.quantity || item.quantity || 1,
          } : null;
        }).filter((g: any) => g !== null)
      : null;

    return promotion;
  }

  toJSON(): any {
    return {
      name: this.name ?? null,
      description: this.description ?? null,
      starts_at: this.startsAt ?? null,
      ends_at: this.endsAt ?? null,
      min_purchase_amount: this.minPurchaseAmount ?? null,
      allow_promo_codes: this.allowPromoCodes ?? false,
      is_active: this.isActive ?? true,
      priority: this.priority ?? 10,
      max_uses: this.maxUses ?? null,
      trigger_product_ids: this.triggerProductIds ?? [],
      gift_products: this.giftProductsData ?? [],
    };
  }

  clone(): Promotion {
    const cloned = new Promotion();

    cloned.id = this.id;
    cloned.name = this.name;
    cloned.description = this.description;
    cloned.startsAt = this.startsAt;
    cloned.endsAt = this.endsAt;
    cloned.minPurchaseAmount = this.minPurchaseAmount;
    cloned.allowPromoCodes = this.allowPromoCodes;
    cloned.isActive = this.isActive;
    cloned.priority = this.priority;
    cloned.maxUses = this.maxUses;
    cloned.timesUsed = this.timesUsed;
    cloned.createdAt = this.createdAt;
    cloned.updatedAt = this.updatedAt;

    cloned.triggerProductIds = this.triggerProductIds
      ? [...this.triggerProductIds]
      : [];
    cloned.giftProductsData = this.giftProductsData
      ? JSON.parse(JSON.stringify(this.giftProductsData))
      : [];

    cloned.triggerProducts = this.triggerProducts
      ? this.triggerProducts.map((p) => p.clone())
      : null;
    cloned.giftProducts = this.giftProducts
      ? this.giftProducts.map((g) => ({
          product: g.product.clone(),
          quantity: g.quantity,
        }))
      : null;

    return cloned;
  }
}
