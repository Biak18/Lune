import { TextStyle } from "react-native";
import { colors } from "./colors";

export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 43,
    lineHeight: 40,
    fontWeight: "500",
    letterSpacing: -1.9, // -0.045em
    color: colors.foreground,
    // Newsreader serif in sample — fallback to system if not loaded
    fontFamily: "Newsreader_500Medium",
  },
  heading: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: -0.3,
    color: colors.foreground,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: colors.foreground,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    color: colors.foreground,
  },
  bodyMuted: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    color: colors.muted,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: colors.muted,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  productName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.foreground,
  },
  // Sample specific
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 1.76, // 0.16em
    textTransform: "uppercase",
    color: colors.clay,
  },
  lead: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: colors.muted,
  },
};
