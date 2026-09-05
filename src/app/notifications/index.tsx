import { View, Text, FlatList, Pressable, StyleSheet, Switch, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationsQuery, useMarkRead, useMarkAllRead, useNotificationPrefsQuery, useUpdatePrefs } from "@/features/notifications/hooks/useNotifications";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function typeMeta(type: string): { icon: keyof typeof Ionicons.glyphMap; bg: string } {
  switch (type) {
    case "order_confirmed": return { icon: "checkmark-circle-outline", bg: colors.successBackground };
    case "order_shipped": return { icon: "cube-outline", bg: colors.surfaceMuted };
    case "out_for_delivery": return { icon: "bicycle-outline", bg: colors.roseSoft };
    case "delivered": return { icon: "home-outline", bg: colors.successBackground };
    case "back_in_stock": return { icon: "refresh-outline", bg: colors.surfaceMuted };
    case "price_drop": return { icon: "pricetag-outline", bg: colors.roseSoft };
    default: return { icon: "notifications-outline", bg: colors.surfaceMuted };
  }
}

function NotifSkeleton() {
  return (
    <View style={{ gap: 10, padding: spacing.xl }}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} style={{ height: 80, borderRadius: radius.lg }} />
      ))}
    </View>
  );
}

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: notifs, isLoading, isError, error, refetch } = useNotificationsQuery();
  const { data: prefs } = useNotificationPrefsQuery();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const updatePrefs = useUpdatePrefs();

  if (!user) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.desc}>Sign in to see order updates, back-in-stock and price drops.</Text>
        <Button title="Sign in" onPress={() => router.push("/auth/login" as any)} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.heading}>Notifications</Text>
        </View>
        <NotifSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>We couldn&apos;t load notifications.</Text>
        <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Button title="Retry" onPress={() => refetch()} style={{ marginTop: 12 }} />
      </SafeAreaView>
    );
  }

  const list = notifs ?? [];
  const unread = list.filter((n) => !n.is_read).length;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.heading}>Notifications</Text>
        <View style={styles.headerRow}>
          <Text style={styles.count}>{list.length} total • {unread} unread</Text>
          <Pressable
            onPress={async () => {
              if (unread === 0) return;
              try { await Haptics.selectionAsync(); } catch {}
              markAll.mutate();
            }}
            style={[styles.markAll, unread === 0 && { opacity: 0.5 }]}
            disabled={unread === 0 || markAll.isPending}
          >
            <Text style={styles.markAllText}>{markAll.isPending ? "…" : "Mark all read"}</Text>
          </Pressable>
        </View>
      </View>

      {/* Preferences — editorial, dividers */}
      <View style={styles.prefsCard}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {prefs ? (
          <View>
            {[
              { key: "order_updates", label: "Order updates", desc: "Confirmed • Shipped • Out for delivery • Delivered", value: !!prefs.order_updates },
              { key: "back_in_stock", label: "Back in stock", desc: "When a saved item is back", value: !!prefs.back_in_stock },
              { key: "price_drop", label: "Price drop", desc: "When a saved item drops in price", value: !!prefs.price_drop },
            ].map((row, idx) => (
              <View key={row.key} style={[styles.prefRow, idx !== 0 && styles.prefDivider]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>{row.label}</Text>
                  <Text style={styles.prefDesc}>{row.desc}</Text>
                </View>
                <Switch
                  value={row.value}
                  onValueChange={(v) => updatePrefs.mutate({ [row.key]: v } as any)}
                  trackColor={{ true: colors.foreground, false: colors.border }}
                  thumbColor={colors.surface}
                />
              </View>
            ))}
          </View>
        ) : (
          <ActivityIndicator color={colors.foreground} />
        )}
      </View>

      {list.length === 0 ? (
        <View style={styles.centerInline}>
          <Ionicons name="notifications-outline" size={28} color={colors.mutedLight} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.desc}>Order updates will appear here. Place an order to see notifications.</Text>
          <Button title="Shop now" onPress={() => router.push("/(tabs)/shop" as any)} style={{ marginTop: 12 }} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: spacing.xl, gap: 10, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} tintColor={colors.foreground} />}
          renderItem={({ item }) => {
            const meta = typeMeta(item.type);
            return (
              <Pressable
                onPress={async () => {
                  if (!item.is_read) {
                    try { await Haptics.selectionAsync(); } catch {}
                    markRead.mutate(item.id);
                  }
                  const oid = (item.data as any)?.order_id;
                  if (oid) router.push(`/orders/${oid}` as any);
                }}
                style={[styles.notifCard, !item.is_read && styles.unreadCard]}
              >
                <View style={[styles.typeIcon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={14} color={colors.foreground} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                    {!item.is_read && <View style={styles.dot} />}
                  </View>
                  {item.body ? <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text> : null}
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <Text style={styles.notifType}>{item.type.replace(/_/g, " ")}</Text>
                    <Text style={styles.dotSep}>•</Text>
                    <Text style={styles.notifDate}>{relativeTime(item.created_at)}</Text>
                  </View>
                </View>
                {markRead.isPending ? <ActivityIndicator size="small" color={colors.muted} /> : !item.is_read ? <Ionicons name="ellipse" size={8} color={colors.clay} /> : <Ionicons name="checkmark" size={14} color={colors.mutedLight} />}
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
      )}
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
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  count: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  markAll: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  markAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
  prefsCard: {
    marginHorizontal: spacing.xl,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  prefDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  prefLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
  },
  prefDesc: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  centerInline: {
    padding: spacing.xl,
    alignItems: "center",
    gap: 8,
    marginTop: 16,
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
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotSep: { fontSize: 10, color: colors.mutedLight },
  unreadCard: {
    borderColor: colors.foreground,
    backgroundColor: colors.surface,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.clay,
  },
  notifBody: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  notifDate: {
    fontSize: 11,
    color: colors.mutedLight,
  },
  notifType: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.mutedLight,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
  },
});
