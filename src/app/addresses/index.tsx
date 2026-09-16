import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { AddressCard } from "@/features/addresses/components/AddressCard";
import {
  AddressForm,
  type AddressFormValues,
} from "@/features/addresses/components/AddressForm";
import {
  useAddressesQuery,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "@/features/addresses/hooks/useAddresses";
import type { Address } from "@/features/addresses/services/addressService";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

// NOTE: intentionally not using Screen — address forms rely on
// KeyboardAwareScrollView to scroll focused inputs into view.
export default function AddressesScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    data: addresses,
    isLoading,
    isError,
    error,
    refetch,
  } = useAddressesQuery();
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  // Stable chronological order: cards never reshuffle when the default
  // changes (the badge, radio, and border move instead). Sorting a copy so
  // the cached query data is never mutated.
  // NOTE: Must stay before any early return — otherwise React sees a
  // different hook count between loading/error/success renders.
  const list = useMemo(() => {
    const timeOf = (a: Address) => {
      const t = new Date(a.created_at ?? "").getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    return [...(addresses ?? [])].sort((x, y) => timeOf(x) - timeOf(y));
  }, [addresses]);

  const handleCreate = async (values: AddressFormValues) => {
    try {
      await create.mutateAsync({
        recipient_name: values.recipient_name,
        phone: values.phone || null,
        label: values.label || null,
        address_line_1: values.address_line_1,
        address_line_2: values.address_line_2 || null,
        city: values.city,
        state: values.state || null,
        postal_code: values.postal_code || null,
        country: values.country || "MM",
        is_default: true,
      } as any);
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch {}
      setShowForm(false);
    } catch (e: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      Alert.alert("Could not save", String(e?.message ?? "Try again"));
    }
  };

  const handleUpdate = async (values: AddressFormValues) => {
    if (!editing) return;
    try {
      await update.mutateAsync({
        id: editing.id,
        payload: {
          recipient_name: values.recipient_name,
          phone: values.phone || null,
          label: values.label || null,
          address_line_1: values.address_line_1,
          address_line_2: values.address_line_2 || null,
          city: values.city,
          state: values.state || null,
          postal_code: values.postal_code || null,
          country: values.country || "MM",
        } as any,
      });
      if (values.is_default) await setDefault.mutateAsync(editing.id);
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch {}
      setEditing(null);
      setShowForm(false);
    } catch (e: any) {
      Alert.alert("Could not update", String(e?.message ?? "Try again"));
    }
  };

  const handleSelectDefault = (id: string) => {
    // Drop taps while a switch is in flight (also blocks nested-pressable
    // double fire from the inner "Set default" button).
    if (setDefault.isPending) return;
    const target = list.find((a) => a.id === id);
    try {
      void Haptics.selectionAsync();
    } catch {}
    if (!target || target.is_default) return;
    setDefault.mutate(id, {
      onSuccess: async () => {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } catch {}
      },
      onError: async (e) => {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
        } catch {}
        Alert.alert(
          "Could not set default",
          String((e as Error)?.message ?? "Try again"),
        );
      },
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove address?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await remove.mutateAsync(id);
            try {
              await Haptics.selectionAsync();
            } catch {}
          } catch (e: any) {
            Alert.alert("Could not remove", String(e?.message ?? "Try again"));
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Saved addresses</Text>
        <Text style={styles.desc}>Sign in to manage your addresses.</Text>
        <Button
          title="Sign in"
          onPress={() => router.push("/auth/login" as any)}
          style={{ marginTop: 16 }}
        />
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading addresses…" />;
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>We couldn’t load addresses.</Text>
        <Text style={styles.desc}>
          {String((error as Error)?.message ?? "Try again")}
        </Text>
        <Button
          title="Retry"
          onPress={() => refetch()}
          style={{ marginTop: 12 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        enableOnAndroid={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Addresses</Text>
            <Text style={styles.sub}>
              {list.length} saved{" "}
              {list.filter((a) => a.is_default).length
                ? "1 default"
                : "no default"}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setEditing(null);
              setShowForm((v) => !v);
            }}
            style={styles.addBtn}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Ionicons
              name={showForm ? "close" : "add"}
              size={14}
              color={colors.foreground}
            />
            <Text style={styles.addText}>{showForm ? "Cancel" : "New"}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editing ? "Edit address" : "New address"}
            </Text>
            <AddressForm
              onSubmit={editing ? handleUpdate : handleCreate}
              submitting={create.isPending || update.isPending}
              defaultValues={
                editing
                  ? {
                      recipient_name: editing.recipient_name,
                      phone: editing.phone ?? "",
                      label: editing.label ?? "Home",
                      address_line_1: editing.address_line_1,
                      address_line_2: editing.address_line_2 ?? "",
                      city: editing.city,
                      state: editing.state ?? "",
                      postal_code: editing.postal_code ?? "",
                      country: editing.country ?? "MM",
                      is_default: editing.is_default,
                    }
                  : undefined
              }
            />
            {editing && (
              <Pressable
                onPress={() => {
                  setEditing(null);
                  setShowForm(false);
                }}
                style={{ marginTop: 8, alignItems: "center" }}
              >
                <Text style={styles.link}>Cancel edit</Text>
              </Pressable>
            )}
          </View>
        )}

        {list.length === 0 && !showForm ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="location-outline"
                size={24}
                color={colors.muted}
              />
            </View>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyDesc}>
              Add an address for faster checkout. Your order snapshots won’t
              change if you edit later.
            </Text>
            <Button
              title="Add address"
              onPress={() => setShowForm(true)}
              style={{ marginTop: 8 }}
            />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {list.map((a) => (
              <View key={a.id} style={{ gap: 8 }}>
                <AddressCard
                  address={a}
                  selected={!!a.is_default}
                  pending={
                    setDefault.isPending && setDefault.variables === a.id
                  }
                  onSelect={() => handleSelectDefault(a.id)}
                  onSetDefault={() => handleSelectDefault(a.id)}
                  onDelete={() => handleDelete(a.id)}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => {
                      setEditing(a);
                      setShowForm(true);
                    }}
                    style={styles.editBtn}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="create-outline"
                      size={12}
                      color={colors.foreground}
                    />
                    <Text style={styles.editText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push("/checkout" as any)}
                    style={[
                      styles.editBtn,
                      { backgroundColor: colors.background },
                    ]}
                    hitSlop={8}
                  >
                    <Text style={styles.editText}>Use at checkout</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.hint}>
          Historical orders keep a snapshot of the address at purchase time.
        </Text>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, gap: 16, paddingBottom: 32 },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.foreground },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  back: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  formCard: {
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  formTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  empty: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  emptyDesc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  editBtn: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editText: { fontSize: 11, fontWeight: "700", color: colors.foreground },
  hint: { fontSize: 11, color: colors.mutedLight, textAlign: "center" },
});
