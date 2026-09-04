import { View, Text, StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useCartQuery, useUpdateCartQuantity, useRemoveFromCart } from "@/features/cart/hooks/useCart";
import { calculateCartTotals } from "@/features/cart/utils/cartTotals";
import { CartItemRow } from "@/features/cart/components/CartItemRow";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

function CartSkeleton() {
  return (
    <View style={{ gap: 12, padding: spacing.xl }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Skeleton style={{ width: 86, height: 108, borderRadius: 10 }} />
          <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
            <Skeleton style={{ height: 12, borderRadius: 6 }} />
            <Skeleton style={{ height: 12, width: "60%", borderRadius: 6 }} />
            <Skeleton style={{ height: 30, width: 120, borderRadius: 999 }} />
          </View>
        </View>
      ))}
      <Skeleton style={{ height: 160, borderRadius: 16 }} />
    </View>
  );
}

export default function CartScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: items, isLoading, isError, error, refetch, isRefetching } = useCartQuery();
  const updateQty = useUpdateCartQuantity();
  const remove = useRemoveFromCart();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Your bag</Text>
        <Text style={styles.sub}>Sign in to view your bag</Text>
        <Text style={styles.desc}>Your selected size and color are saved once you are signed in.</Text>
        <Link href={"/auth/login" as any} asChild>
          <Button title="Sign in" style={{ marginTop: spacing.lg }} />
        </Link>
        <Pressable onPress={() => router.push("/shop" as any)} style={{ marginTop: 12 }}>
          <Text style={styles.link}>Continue shopping</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your bag</Text>
        </View>
        <CartSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.sub}>We couldn&apos;t load your bag.</Text>
        <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Button title={isRefetching ? "Retrying…" : "Retry"} onPress={() => refetch()} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const list = items ?? [];
  const totals = calculateCartTotals(list);

  if (list.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Your bag is empty.</Text>
        <Text style={styles.desc}>Add products with your size and color — they’ll appear here for checkout.</Text>
        <Link href={"/shop" as any} asChild>
          <Button title="Start shopping" style={{ marginTop: spacing.lg }} />
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your bag</Text>
        <Text style={styles.count}>{totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <FlashList
          data={list}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <CartItemRow
              item={item}
              updating={updateQty.isPending || remove.isPending}
              onUpdateQuantity={(id, qty) => updateQty.mutate({ cartItemId: id, quantity: qty })}
              onRemove={(id) => remove.mutate(id)}
            />
          )}
          ListFooterComponent={
            <View style={{ gap: 12, marginTop: 12 }}>
              {(updateQty.isError || remove.isError) && (
                <Text style={styles.errorText}>
                  {String(((updateQty.error as Error) ?? (remove.error as Error))?.message ?? "Update failed")}
                </Text>
              )}
              <CartSummary
                subtotal={totals.subtotal}
                shipping={totals.shipping}
                total={totals.total}
                itemCount={totals.itemCount}
                isFreeShipping={totals.isFreeShipping}
                freeShippingThreshold={totals.freeShippingThreshold}
                checkoutDisabled={totals.itemCount === 0}
                onCheckout={() => router.push("/checkout" as any)}
              />
              <Text style={styles.note}>Prices verified at checkout. Stock is validated before order.</Text>
            </View>
          }
         showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  count: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.foreground,
  },
  sub: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: 8,
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 18,
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.error,
    textAlign: "center",
  },
  note: {
    fontSize: 11,
    color: colors.mutedLight,
    textAlign: "center",
  },
});
