import { View, Text, FlatList, Pressable, StyleSheet, Switch, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationsQuery, useMarkRead, useMarkAllRead, useNotificationPrefsQuery, useUpdatePrefs } from "@/features/notifications/hooks/useNotifications";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

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
      <View style={styles.center}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.desc}>Sign in to see order updates, back-in-stock and price drops.</Text>
        <Button title="Sign in" onPress={() => router.push("/auth/login" as any)} style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.heading}>Notifications</Text>
        </View>
        <NotifSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>We couldn&apos;t load notifications.</Text>
        <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Button title="Retry" onPress={() => refetch()} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const list = notifs ?? [];
  const unread = list.filter((n) => !n.is_read).length;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.heading}>Notifications</Text>
        <View style={styles.headerRow}>
          <Text style={styles.count}>{list.length} total • {unread} unread</Text>
          {unread > 0 && (
            <Pressable
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                markAll.mutate();
              }}
              style={styles.markAll}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.prefsCard}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {prefs ? (
          <View style={{ gap: 10 }}>
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Order updates</Text>
                <Text style={styles.prefDesc}>Confirmed • Shipped • Out for delivery • Delivered</Text>
              </View>
              <Switch value={!!prefs.order_updates} onValueChange={(v) => updatePrefs.mutate({ order_updates: v })} trackColor={{ true: colors.foreground }} />
            </View>
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Back in stock</Text>
                <Text style={styles.prefDesc}>When a saved item is back</Text>
              </View>
              <Switch value={!!prefs.back_in_stock} onValueChange={(v) => updatePrefs.mutate({ back_in_stock: v })} trackColor={{ true: colors.foreground }} />
            </View>
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>Price drop</Text>
                <Text style={styles.prefDesc}>When a saved item drops in price</Text>
              </View>
              <Switch value={!!prefs.price_drop} onValueChange={(v) => updatePrefs.mutate({ price_drop: v })} trackColor={{ true: colors.foreground }} />
            </View>
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
          renderItem={({ item }) => (
            <Pressable
              onPress={async () => {
                if (!item.is_read) {
                  try {
                    await Haptics.selectionAsync();
                  } catch {}
                  markRead.mutate(item.id);
                }
                const oid = (item.data as any)?.order_id;
                if (oid) router.push(`/orders/${oid}` as any);
              }}
              style={[styles.notifCard, !item.is_read && styles.unreadCard]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  {!item.is_read && <View style={styles.dot} />}
                </View>
                {item.body ? <Text style={styles.notifBody}>{item.body}</Text> : null}
                <Text style={styles.notifDate}>{new Date(item.created_at).toLocaleString()}</Text>
                <Text style={styles.notifType}>{item.type.replace(/_/g, " ")}</Text>
              </View>
              {!item.is_read ? (
                <Ionicons name="ellipse" size={8} color={colors.clay} />
              ) : (
                <Ionicons name="checkmark" size={14} color={colors.mutedLight} />
              )}
            </Pressable>
          )}
        />
      )}
    </View>
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
    gap: 10,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
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
