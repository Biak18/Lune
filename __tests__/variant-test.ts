import {
  findVariant,
  getStockLabel,
  getUniqueColors,
  getUniqueSizes,
  isSizeAvailable,
  isVariantInStock,
  validateVariantSelection,
} from "@/features/products/utils/variant";
import type { ProductWithRelations, Variant } from "@/features/products/types";

function makeVariant(overrides: Partial<Variant> = {}): Variant {
  return {
    id: "v-1",
    product_id: "p-1",
    sku: "SKU-1",
    color: "Black",
    size: "M",
    price: 100,
    stock_quantity: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Variant;
}

function makeProduct(variants: Variant[]): ProductWithRelations {
  return {
    id: "p-1",
    name: "Satin Midi Dress",
    slug: "satin-midi-dress",
    base_price: 120,
    category_id: null,
    description: null,
    style: null,
    occasion: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: null,
    images: [],
    variants,
  } as unknown as ProductWithRelations;
}

describe("variant utils", () => {
  it("detects in-stock only for active variants with quantity", () => {
    expect(isVariantInStock(makeVariant())).toBe(true);
    expect(isVariantInStock(makeVariant({ stock_quantity: 0 }))).toBe(false);
    expect(isVariantInStock(makeVariant({ is_active: false }))).toBe(false);
  });

  it("finds exact color/size combination", () => {
    const variants = [makeVariant({ color: "Black", size: "S" }), makeVariant({ color: "Cream", size: "M" })];
    expect(findVariant(variants, "Cream", "M")?.sku).toBe("SKU-1");
    expect(findVariant(variants, "Black", "M")).toBeNull();
  });

  it("lists unique colors and sizes in natural order", () => {
    const variants = [
      makeVariant({ color: "Cream", size: "XL" }),
      makeVariant({ color: "Black", size: "S" }),
      makeVariant({ color: "Black", size: "M" }),
    ];
    expect(getUniqueColors(variants)).toEqual(["Black", "Cream"]);
    expect(getUniqueSizes(variants)).toEqual(["S", "M", "XL"]);
  });

  it("validates selection and reports stock state", () => {
    const product = makeProduct([makeVariant({ color: "Black", size: "M", stock_quantity: 2 })]);
    expect(validateVariantSelection(product, null, "M")).toEqual({ ok: false, reason: "select_color" });
    expect(validateVariantSelection(product, "Black", "M").ok).toBe(true);
    expect(isSizeAvailable(product.variants, "L", "Black")).toBe(false);
    expect(getStockLabel(makeVariant({ stock_quantity: 2 }))).toMatchObject({ tone: "low" });
  });
});
