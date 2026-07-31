type ProductStockLike = {
  stock_quantity?: number | string | null;
  inventory_balance?: number | string | null;
};

export function getProductStockQuantity(product: ProductStockLike): number {
  const value = product.stock_quantity ?? product.inventory_balance ?? 0;
  const quantity = Number(value);

  return Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
}

export function isProductOutOfStock(product: ProductStockLike): boolean {
  return getProductStockQuantity(product) <= 0;
}
