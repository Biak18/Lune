import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";

const ORDER_FLOW = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"] as const;

const LABELS: Record<string, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function getOrderProgress(status: string) {
  if (status === "cancelled") return -1;
  const idx = ORDER_FLOW.indexOf(status as any);
  return idx === -1 ? 0 : idx;
}

type Props = {
  status: string;
  createdAt?: string;
};

export function OrderTimeline({ status, createdAt }: Props) {
  const isCancelled = status === "cancelled";
  const progress = getOrderProgress(status);

  if (isCancelled) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Order timeline</Text>
        <View style={styles.row}>
          <View style={[styles.circle, styles.cancelCircle]}>
            <Ionicons name="close" size={12} color={colors.surface} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, styles.cancelText]}>Cancelled</Text>
            <Text style={styles.date}>This order was cancelled</Text>
          </View>
        </View>
      </View>
    );
  }

  const isDelivered = status === "delivered";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Order timeline</Text>
      {ORDER_FLOW.map((s, idx) => {
        const done = idx <= progress;
        // Delivered is terminal show it as green done, not black current
        const current = idx === progress && !isDelivered;
        const future = idx > progress;
        const isDeliveredStep = isDelivered && s === "delivered";
        return (
          <View key={s} style={styles.row}>
            <View style={styles.left}>
              <View
                style={[
                  styles.circle,
                  done && styles.circleDone,
                  current && styles.circleCurrent,
                  isDeliveredStep && styles.circleDone,
                  future && styles.circleFuture,
                ]}
              >
                {done ? (
                  <Ionicons
                    name={isDeliveredStep || idx < progress ? "checkmark" : "ellipse"}
                    size={10}
                    color={colors.surface}
                  />
                ) : (
                  <View style={styles.dotFuture} />
                )}
              </View>
              {idx < ORDER_FLOW.length - 1 && <View style={[styles.line, done && styles.lineDone]} />}
            </View>
            <View style={{ flex: 1, paddingBottom: 14 }}>
              <Text style={[styles.label, done && styles.labelDone, future && styles.labelFuture]}>{LABELS[s]}</Text>
              {current && createdAt ? <Text style={styles.date}>Updated {new Date(createdAt).toLocaleDateString()}</Text> : null}
              {isDeliveredStep && createdAt ? <Text style={styles.date}>Delivered {new Date(createdAt).toLocaleDateString()}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  left: {
    alignItems: "center",
    width: 20,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  circleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  circleCurrent: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  circleFuture: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  dotFuture: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
  cancelCircle: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: colors.border,
    marginTop: 2,
    minHeight: 14,
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
  },
  labelDone: {
    color: colors.foreground,
  },
  labelFuture: {
    color: colors.mutedLight,
  },
  cancelText: {
    color: colors.error,
    fontWeight: "700",
  },
  date: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
});
