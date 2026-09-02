import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function AuthHeader({ title, subtitle, eyebrow }: Props) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.76, // 0.16em
    textTransform: "uppercase",
    color: colors.clay,
    marginBottom: 8,
    marginTop: 28,
  },
  title: {
    fontSize: 43,
    lineHeight: 40,
    fontWeight: "500",
    letterSpacing: -1.9,
    color: colors.foreground,
    // Newsreader fallback
    // fontFamily: "Newsreader_500Medium",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: colors.muted,
    marginTop: 14,
    maxWidth: 290,
  },
});
