import type { Variant, ProductWithRelations } from "../types";

export function isVariantActive(v: Variant): boolean {
  return v.is_active !== false;
}

export function isVariantInStock(v: Variant): boolean {
  return isVariantActive(v) && (v.stock_quantity ?? 0) > 0;
}

export function getActiveVariants(product: ProductWithRelations): Variant[] {
  return (product.variants ?? []).filter(isVariantActive);
}

export function getUniqueColors(variants: Variant[]): string[] {
  const set = new Set<string>();
  for (const v of variants) {
    if (v.color) set.add(v.color);
  }
  return Array.from(set).sort();
}

export function getUniqueSizes(variants: Variant[]): string[] {
  const set = new Set<string>();
  for (const v of variants) {
    if (v.size) set.add(v.size);
  }
  // Keep natural size order if recognizable
  const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  return Array.from(set).sort((a, b) => {
    const ia = order.indexOf(a.toUpperCase());
    const ib = order.indexOf(b.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function findVariant(
  variants: Variant[],
  color: string | null,
  size: string | null,
): Variant | null {
  return (
    variants.find((v) => v.color === color && v.size === size) ?? null
  );
}

export function resolveVariantPrice(
  product: ProductWithRelations,
  variant: Variant | null,
): number {
  if (variant?.price != null) return Number(variant.price);
  return Number(product.base_price);
}

/**
 * Availability helpers — disabled state must reflect real purchasability.
 * A color/size is considered available only if at least one active variant
 * matching the constraint exists with stock > 0.
 */

export function isColorAvailable(
  variants: Variant[],
  color: string,
  selectedSize: string | null,
): boolean {
  return variants.some(
    (v) =>
      v.color === color &&
      (selectedSize ? v.size === selectedSize : true) &&
      isVariantInStock(v),
  );
}

export function isSizeAvailable(
  variants: Variant[],
  size: string,
  selectedColor: string | null,
): boolean {
  return variants.some(
    (v) =>
      v.size === size &&
      (selectedColor ? v.color === selectedColor : true) &&
      isVariantInStock(v),
  );
}

export function getAvailableColorsForSize(
  variants: Variant[],
  size: string,
): string[] {
  return getUniqueColors(
    variants.filter((v) => v.size === size && isVariantInStock(v)),
  );
}

export function getAvailableSizesForColor(
  variants: Variant[],
  color: string,
): string[] {
  return getUniqueSizes(
    variants.filter((v) => v.color === color && isVariantInStock(v)),
  );
}

export function getStockLabel(variant: Variant | null): {
  text: string;
  tone: "inStock" | "low" | "oos" | "unavailable";
} {
  if (!variant) return { text: "Select a color and size", tone: "unavailable" };
  if (!isVariantActive(variant)) return { text: "Unavailable", tone: "unavailable" };
  const q = variant.stock_quantity ?? 0;
  if (q <= 0) return { text: "Out of stock", tone: "oos" };
  if (q <= 3) return { text: `Only ${q} left`, tone: "low" };
  return { text: `${q} in stock`, tone: "inStock" };
}

export type VariantValidation =
  | { ok: true; variant: Variant }
  | { ok: false; reason: "select_color" | "select_size" | "select_variant" | "out_of_stock" | "unavailable" };

export function validateVariantSelection(
  product: ProductWithRelations,
  selectedColor: string | null,
  selectedSize: string | null,
): VariantValidation {
  const variants = getActiveVariants(product);
  const colors = getUniqueColors(variants);
  const sizes = getUniqueSizes(variants);

  if (colors.length > 0 && !selectedColor) return { ok: false, reason: "select_color" };
  if (sizes.length > 0 && !selectedSize) return { ok: false, reason: "select_size" };
  if (!selectedColor && !selectedSize && variants.length > 0) return { ok: false, reason: "select_variant" };

  const variant = findVariant(variants, selectedColor, selectedSize);
  if (!variant) return { ok: false, reason: "unavailable" };
  if (!isVariantInStock(variant)) return { ok: false, reason: "out_of_stock" };
  return { ok: true, variant };
}

export function validationMessage(reason: string): string {
  switch (reason) {
    case "select_color":
      return "Please select a color";
    case "select_size":
      return "Please select a size";
    case "select_variant":
      return "Please select options";
    case "out_of_stock":
      return "Selected variant is out of stock";
    case "unavailable":
      return "This combination is unavailable";
    default:
      return "Unavailable";
  }
}
