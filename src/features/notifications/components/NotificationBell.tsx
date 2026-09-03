import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/design/colors";
import { useUnreadCountQuery } from "../hooks/useNotifications";

export function NotificationBell({ size = 22 }: { size?: number }) {
  const { data: count } = useUnreadCountQuery();
  const unread = count ?? 0;
  return (
    <Pressable onPress={() => router.push("/notifications" as any)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Notifications${unread ? ` ${unread} unread` : ""}`} style={styles.wrap}>
      <Ionicons name={unread ? "notifications" : "notifications-outline"} size={size} color={colors.foreground} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? "9+" : String(unread)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.surface,
  },
});
