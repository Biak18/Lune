import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { useLoginMutation } from "../hooks/useAuthMutations";
import { getAuthErrorMessage } from "@/utils/errors";

/**
 * Dev-only quick switcher between customer and admin test accounts.
 * Renders nothing in production (__DEV__ === false).
 * Configure via .env:
 *   EXPO_PUBLIC_DEV_CUSTOMER_EMAIL / _PASSWORD
 *   EXPO_PUBLIC_DEV_ADMIN_EMAIL / _PASSWORD
 * If not configured, shows setup hint.
 */
export function DevAccountSwitcher() {
  const customerEmail = process.env.EXPO_PUBLIC_DEV_CUSTOMER_EMAIL;
  const customerPassword = process.env.EXPO_PUBLIC_DEV_CUSTOMER_PASSWORD;
  const adminEmail = process.env.EXPO_PUBLIC_DEV_ADMIN_EMAIL;
  const adminPassword = process.env.EXPO_PUBLIC_DEV_ADMIN_PASSWORD;

  const hasCustomer = !!customerEmail && !!customerPassword;
  const hasAdmin = !!adminEmail && !!adminPassword;
  const hasAny = hasCustomer || hasAdmin;

  const login = useLoginMutation();
  const [active, setActive] = useState<"customer" | "admin" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!__DEV__) return null;

  const handleSwitch = (role: "customer" | "admin") => {
    const email = role === "customer" ? customerEmail : adminEmail;
    const password = role === "customer" ? customerPassword : adminPassword;
    if (!email || !password) return;
    setActive(role);
    setError(null);
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          setActive(null);
          router.replace("/");
        },
        onError: (e) => {
          setError(getAuthErrorMessage(e));
          setActive(null);
        },
      }
    );
  };

  return (
    <View style={styles.wrap} accessibilityLabel="Dev account switcher">
      <View style={styles.header}>
        <Text style={styles.badge}>DEV ONLY</Text>
        <Text style={styles.title}>Quick switch</Text>
      </View>
      <Text style={styles.hint}>Switches session instantly — no typing. Not shown in production.</Text>

      {!hasAny ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Add to .env:{"\n"}EXPO_PUBLIC_DEV_CUSTOMER_EMAIL / _PASSWORD{"\n"}EXPO_PUBLIC_DEV_ADMIN_EMAIL / _PASSWORD
          </Text>
          <Text style={styles.noticeSub}>Then restart with npx expo start --clear</Text>
        </View>
      ) : (
        <View style={styles.row}>
          <Pressable
            onPress={() => handleSwitch("customer")}
            disabled={!hasCustomer || login.isPending}
            style={[styles.btn, styles.customerBtn, (!hasCustomer || login.isPending) && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel="Switch to customer"
          >
            {active === "customer" ? <ActivityIndicator size="small" color={colors.surface} /> : <Text style={styles.btnText}>Customer</Text>}
            <Text style={styles.btnSub} numberOfLines={1}>
              {hasCustomer ? customerEmail : "not set"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSwitch("admin")}
            disabled={!hasAdmin || login.isPending}
            style={[styles.btn, styles.adminBtn, (!hasAdmin || login.isPending) && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel="Switch to admin"
          >
            {active === "admin" ? <ActivityIndicator size="small" color={colors.surface} /> : <Text style={styles.btnText}>Admin</Text>}
            <Text style={styles.btnSub} numberOfLines={1}>
              {hasAdmin ? adminEmail : "not set"}
            </Text>
          </Pressable>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {login.isPending ? <Text style={styles.pending}>Switching…</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.clay,
    backgroundColor: colors.roseSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  hint: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
  notice: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.foreground,
    lineHeight: 14,
  },
  noticeSub: {
    fontSize: 10,
    color: colors.muted,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
  },
  customerBtn: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  adminBtn: {
    backgroundColor: colors.clay,
    borderColor: colors.clay,
  },
  disabled: {
    opacity: 0.45,
  },
  btnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.surface,
    letterSpacing: 0.5,
  },
  btnSub: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  error: {
    fontSize: 11,
    color: colors.error,
    textAlign: "center",
  },
  pending: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  },
});
