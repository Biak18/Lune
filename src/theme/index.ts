// src/theme/index.ts
// Compatibility shim: original FieldInput imported useTheme from "@/theme".
// New FieldInput uses design tokens directly, but this hook preserves backwards
// compat for any legacy imports and enables dark-mode extension later.

import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";

export function useTheme() {
  return { colors, radius, spacing, typography };
}

export type Theme = ReturnType<typeof useTheme>;
