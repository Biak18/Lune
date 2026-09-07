import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { fontFamily } from "@/design/typography";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrdersQuery } from "@/features/orders/hooks/useOrders";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function OrdersSkeleton() {
  return (
    <View style={{ gap: 12, padding: spacing.xl }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} style={{ height: 110, borderRadius: radius.lg }} />
      ))}
    </View>
  );
}

export default function OrdersScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: orders, isLoading, isError, error, refetch, isRefetching } = useOrdersQuery();

  if (!user) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.desc}>Sign in to view your purchase history.</Text>
        <Button title="Sign in" onPress={() => router.push("/auth/login" as any)} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.heading}>Orders</Text>
        </View>
        <OrdersSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>We couldn&apos;t load orders.</Text>
        <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Button title={isRefetching ? "Retrying…" : "Retry"} onPress={() => refetch()} style={{ marginTop: 12 }} />
      </SafeAreaView>
    );
  }

  const list = orders ?? [];

  if (list.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="receipt-outline" size={24} color={colors.muted} />
        </View>
        <Text style={styles.title}>No orders yet</Text>
        <Text style={styles.desc}>Your purchases will appear here with tracking and delivery info.</Text>
        <Button title="Start shopping" onPress={() => router.replace("/(tabs)/shop" as any)} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.heading}>Orders</Text>
        <Text style={styles.count}>{list.length} orders</Text>
      </View>
      <View style={{ flex: 1 }}>
        <FlashList
          data={list}
          keyExtractor={(o) => o.id}
            contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.foreground}
              colors={[colors.foreground]}
            />
          }
          renderItem={({ item }) => <OrderCard order={item} onPress={() => router.push(`/orders/${item.id}` as any)} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: 6,
  },
  heading: {
    fontSize: 28,
    fontWeight: "500",
    letterSpacing: -0.6,
    color: colors.foreground,
    fontFamily: fontFamily.display,
    marginTop: 4,
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
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
});
