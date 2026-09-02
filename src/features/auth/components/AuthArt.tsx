import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";

/**
 * Clay hero with gold circles and abstract dress silhouette.
 * Approximates sample SVG without requiring react-native-svg.
 */
export function AuthArt() {
  return (
    <View style={styles.art}>
      {/* Gold outer circle */}
      <View style={styles.goldOuter} />
      <View style={styles.goldInner} />
      {/* Dress silhouette — cream block */}
      <View style={styles.dressTop} />
      <View style={styles.dressSkirt} />
      <View style={styles.dressHighlight} />
      {/* Label */}
      <Text style={styles.label}>Dress for the{"\n"}life you want.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    height: 260,
    marginHorizontal: -24,
    backgroundColor: colors.clay,
    overflow: "hidden",
    position: "relative",
  },
  goldOuter: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.gold,
    right: 30,
    top: 22,
  },
  goldInner: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.clay,
    right: 52,
    top: 44,
  },
  dressTop: {
    position: "absolute",
    width: 86,
    height: 90,
    backgroundColor: colors.surface,
    left: 170,
    top: 30,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  dressSkirt: {
    position: "absolute",
    width: 110,
    height: 90,
    backgroundColor: colors.foreground,
    left: 158,
    top: 118,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    transform: [{ perspective: 600 }, { rotateX: "18deg" }],
  },
  dressHighlight: {
    position: "absolute",
    width: 56,
    height: 18,
    backgroundColor: colors.surface,
    left: 174,
    top: 44,
    borderRadius: 8,
  },
  label: {
    position: "absolute",
    left: 20,
    bottom: 18,
    fontSize: 23,
    lineHeight: 23,
    fontWeight: "500",
    color: colors.background, // paper
    maxWidth: 170,
    // fontFamily: "Newsreader_500Medium",
  },
});
