import { calculateCartTotals, resolveUnitPrice } from "@/features/cart/utils/cartTotals";
import type { CartItem } from "@/features/cart/services/cartService";

function makeItem(price: number | null, basePrice: number | null, quantity: number): CartItem {
  return {
    id: "item-1",
    quantity,
    variant_id: "variant-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variant: {
      price,
      product: { base_price: basePrice },
    } as unknown as CartItem["variant"],
  };
}

describe("cartTotals", () => {
  it("prefers variant price over base price", () => {
    expect(resolveUnitPrice(makeItem(90, 120, 1))).toBe(90);
    expect(resolveUnitPrice(makeItem(null, 120, 1))).toBe(120);
    expect(resolveUnitPrice(makeItem(null, null, 1))).toBe(0);
  });

  it("computes subtotal and flat shipping below threshold", () => {
    const totals = calculateCartTotals([makeItem(50, null, 2)]);
    expect(totals.subtotal).toBe(100);
    expect(totals.shipping).toBe(8);
    expect(totals.total).toBe(108);
    expect(totals.itemCount).toBe(2);
    expect(totals.isFreeShipping).toBe(false);
  });

  it("grants free shipping at threshold and handles empty cart", () => {
    const free = calculateCartTotals([makeItem(60, null, 2)]);
    expect(free.subtotal).toBe(120);
    expect(free.shipping).toBe(0);
    expect(free.isFreeShipping).toBe(true);

    const empty = calculateCartTotals([]);
    expect(empty).toMatchObject({ subtotal: 0, shipping: 0, total: 0, itemCount: 0 });
  });

  it("applies discount without going negative", () => {
    const totals = calculateCartTotals([makeItem(50, null, 1)], { discount: 100 });
    expect(totals.total).toBe(0);
  });
});
