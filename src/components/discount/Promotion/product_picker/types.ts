/** Выбор в акции: product_id → ID выбранных вариантов; null — товар целиком (все варианты). */
export type SelectedVariantsMap = Record<number, number[] | null>;

export interface PickedPromotionProduct {
  product: any;
  /** null — товар целиком. */
  variantIds: number[] | null;
  /** Подписи выбранных вариантов по их ID. */
  labels: Record<number, string>;
  /** Только для подарков; undefined — оставить прежнее (или 1). */
  quantity?: number;
}

/** «S · Чёрный», «100 мл». */
export const variantLabel = (variant: { name?: string | null; color?: string | null; id: number }, color?: string | null) =>
  [variant.name || `#${variant.id}`, color ?? variant.color].filter(Boolean).join(" · ");
