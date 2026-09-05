// Search exception to FieldInput per instruction, Search uses its own input (not FieldInput)
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onClear?: () => void;
  placeholder?: string;
  onSubmit?: () => void;
};

export function SearchInput({ value, onChangeText, onClear, placeholder = "Search dresses, styles…", onSubmit }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={16} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedLight}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={styles.input}
        accessibilityLabel="Search"
      />
      {value ? (
        <Pressable onPress={onClear} style={styles.clear} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
          <Ionicons name="close" size={14} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    gap: 8,
  },
  // icon now via Ionicons
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    paddingVertical: 0,
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  // clear icon via Ionicons
});
