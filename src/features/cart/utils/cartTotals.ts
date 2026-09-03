import type { CartItem } from "../services/cartService";

const FREE_SHIPPING_THRESHOLD = 120;
const FLAT_SHIPPING = 8;

export function resolveUnitPrice(item: CartItem): number {
  const v = item.variant;
  if (v.price != null) return Number(v.price);
  if (v.product?.base_price != null) return Number(v.product.base_price);
  return 0;
}

export function calculateCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, it) => sum + resolveUnitPrice(it) * it.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;
  return { subtotal, shipping, total, itemCount, isFreeShipping, freeShippingThreshold: FREE_SHIPPING_THRESHOLD };
}
