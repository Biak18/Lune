/**
 * Design tokens - Colors
 * Muse / 09 palette — warm editorial. Values derived from /docs/design/sample-design.html (oklch).
 * oklch approximated to hex for React Native.
 */

export const colors = {
  // Base
  background: "#FAF4EC", // paper
  surface: "#FFFFFF", // surface
  surfaceMuted: "#F2E8DA", // cream
  foreground: "#2A1B16", // ink
  muted: "#73665D",
  mutedLight: "#A99E95",
  border: "#DBD3C8", // line
  borderStrong: "#C9BFB2",

  // Actions — coin sample: primary ink, hover clay
  primary: "#2A1B16",
  primaryForeground: "#FAF4EC",
  secondary: "#FFFFFF",
  secondaryForeground: "#2A1B16",

  // Accent (sample vars)
  clay: "#BC4527",
  clayDeep: "#882D16",
  rose: "#F1B1AE",
  roseSoft: "#FADFD6",
  gold: "#E2A856",
  cream: "#F2E8DA",
  ink: "#2A1B16",
  paper: "#FAF4EC",
  line: "#DBD3C8",

  // Semantic
  error: "#C0392B",
  errorBackground: "#FDF0EF",
  success: "#2E7D32",
  successBackground: "#EAF6EC",
  warning: "#B7791F",
  overlay: "rgba(42,27,22,0.4)",
} as const;

export type ColorToken = keyof typeof colors;
