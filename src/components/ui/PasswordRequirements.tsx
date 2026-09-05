// src/components/ui/PasswordRequirements.tsx
// Visual checklist for password rules. No external icon/i18n deps uses design tokens + unicode.
// Pair with `getPasswordRequirements` from @/utils/passwordValidation.

import { Text, View, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { getPasswordRequirements } from "@/utils/passwordValidation";

type Props = {
  password: string;
  minLength?: number;
  /** Override default labels (useful for future i18n). */
  labels?: {
    title?: string;
    length?: string;
    uppercase?: string;
    special?: string;
  };
  /** Hide title row when set to false */
  showTitle?: boolean;
};

export function PasswordRequirements({
  password,
  minLength = 6,
  labels,
  showTitle = true,
}: Props) {
  const req = getPasswordRequirements(password, minLength);

  const title = labels?.title ?? "Password must contain:";
  const items: { met: boolean; label: string; key: string }[] = [
    {
      key: "length",
      met: req.length,
      label: labels?.length ?? `At least ${minLength} characters`,
    },
    {
      key: "uppercase",
      met: req.uppercase,
      label: labels?.uppercase ?? "One uppercase letter",
    },
    {
      key: "special",
      met: req.special,
      label: labels?.special ?? "One special character",
    },
  ];

  return (
    <View style={styles.wrap} accessibilityRole="list">
      {showTitle ? <Text style={styles.title}>{title}</Text> : null}
      {items.map((item) => (
        <View
          key={item.key}
          style={styles.row}
          accessibilityRole="text"
          accessibilityLabel={`${item.label}: ${item.met ? "met" : "not met"}`}
        >
          <View
            style={[
              styles.badge,
              {
                backgroundColor: item.met ? colors.successBackground : colors.surfaceMuted,
                borderColor: item.met ? colors.success : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.met ? colors.success : colors.muted },
              ]}
            >
              {item.met ? "" : " "}
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              {
                color: item.met ? colors.success : colors.muted,
                fontWeight: item.met ? "600" : "500",
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
    gap: 4,
  },
  title: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
});
