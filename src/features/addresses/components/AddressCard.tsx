import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import type { Address } from "../services/addressService";

type Props = {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onSetDefault?: () => void;
  onDelete?: () => void;
};

export function AddressCard({ address, selected, onSelect, onSetDefault, onDelete }: Props) {
  return (
    <Pressable onPress={onSelect} style={[styles.card, selected && styles.selected]} accessibilityRole="button" accessibilityState={{ selected: !!selected }}>
      <View style={styles.topRow}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <Text style={styles.name}>{address.recipient_name}</Text>
            {address.label ? <Text style={styles.label}>{address.label}</Text> : null}
            {address.is_default ? <Text style={styles.badge}>DEFAULT</Text> : null}
          </View>
          <Text style={styles.line}>
            {address.address_line_1}
            {address.address_line_2 ? `, ${address.address_line_2}` : ""}, {address.city}
            {address.state ? `, ${address.state}` : ""} {address.postal_code ?? ""} • {address.country}
          </Text>
          {address.phone ? <Text style={styles.phone}>{address.phone}</Text> : null}
        </View>
      </View>
      <View style={styles.actions}>
        {!address.is_default && onSetDefault && (
          <Pressable onPress={onSetDefault} style={styles.actionBtn}>
            <Text style={styles.actionText}>Set default</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={onDelete} style={[styles.actionBtn, styles.deleteBtn]}>
            <Ionicons name="trash-outline" size={12} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Remove</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  selected: {
    borderColor: colors.foreground,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioSelected: {
    borderColor: colors.foreground,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.foreground,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.clay,
    backgroundColor: colors.roseSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  badge: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: colors.success,
    backgroundColor: colors.successBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  line: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
    marginTop: 4,
  },
  phone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  deleteBtn: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
});
