import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useCartQuery } from "@/features/cart/hooks/useCart";
import { useAddressesQuery, useCreateAddress } from "@/features/addresses/hooks/useAddresses";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { calculateCartTotals } from "@/features/cart/utils/cartTotals";
import { loyaltyService } from "@/features/loyalty/services/loyaltyService";
import { useQuery } from "@tanstack/react-query";
import { AddressCard } from "@/features/addresses/components/AddressCard";
import { AddressForm, type AddressFormValues } from "@/features/addresses/components/AddressForm";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

export default function CheckoutScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: cartItems, isLoading: cartLoading, isError: cartError, error: cartErr, refetch: refetchCart } = useCartQuery();
  const { data: addresses, isLoading: addrLoading, isError: addrError, error: addrErr, refetch: refetchAddr } = useAddressesQuery();
  const createAddr = useCreateAddress();
  const createOrder = useCreateOrder();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: pending } = useQuery({
    queryKey: ["loyalty", "pending"],
    queryFn: () => loyaltyService.getPendingDiscount(),
    enabled: !!user,
    staleTime: 1000 * 10,
  });
  const pendingAmount = pending?.amount ?? 0;
  const pendingFreeShip = !!pending?.freeShipping;
  const totals = useMemo(
    () => calculateCartTotals(cartItems ?? [], { discount: pendingAmount, freeShipping: pendingFreeShip }),
    [cartItems, pendingAmount, pendingFreeShip]
  );

  // Auto-select default or first address
  const effectiveSelected = useMemo(() => {
    if (selectedId) return selectedId;
    const def = addresses?.find((a) => a.is_default)?.id ?? addresses?.[0]?.id ?? null;
    return def;
  }, [selectedId, addresses]);

  const selectedAddress = addresses?.find((a) => a.id === effectiveSelected) ?? null;

  const handleCreateAddress = async (values: AddressFormValues) => {
    try {
      Keyboard.dismiss();
      const addr = await createAddr.mutateAsync({
        recipient_name: values.recipient_name,
        phone: values.phone || null,
        label: values.label || null,
        address_line_1: values.address_line_1,
        address_line_2: values.address_line_2 || null,
        city: values.city,
        state: values.state || null,
        postal_code: values.postal_code || null,
        country: values.country || "US",
        is_default: true,
      } as any);
      setSelectedId(addr.id);
      setShowForm(false);
      Keyboard.dismiss();
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    } catch (e: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      Alert.alert("Could not save address", String(e?.message ?? "Try again"));
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/auth/login" as any);
      return;
    }
    if (!cartItems?.length) {
      Alert.alert("Bag empty", "Add items before checkout");
      return;
    }
    if (!selectedAddress) {
      Alert.alert("Select address", "Please select a shipping address");
      return;
    }
    Keyboard.dismiss();
    // small delay to let KeyboardAwareScrollView release its view handle before navigation
    await new Promise((r) => setTimeout(r, 80));
    try {
      const order = await createOrder.mutateAsync({
        cartItems: cartItems!,
        shippingAddress: {
          label: selectedAddress.label,
          recipient_name: selectedAddress.recipient_name,
          phone: selectedAddress.phone,
          address_line_1: selectedAddress.address_line_1,
          address_line_2: selectedAddress.address_line_2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
        },
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      router.replace(`/checkout/success?id=${order.id}` as any);
    } catch (e: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      Alert.alert("Order failed", String(e?.message ?? "Try again"));
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.desc}>Please sign in to continue to checkout.</Text>
        <Button title="Sign in" onPress={() => router.push("/auth/login" as any)} style={{ marginTop: 16 }} />
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (cartLoading || addrLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.foreground} />
        <Text style={styles.desc}>Preparing checkout…</Text>
      </SafeAreaView>
    );
  }

  if (cartError || addrError) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>We couldn&apos;t load checkout.</Text>
        <Text style={styles.desc}>{String((cartErr as Error)?.message ?? (addrErr as Error)?.message ?? "Try again")}</Text>
        <Button title="Retry" onPress={() => { refetchCart(); refetchAddr(); }} style={{ marginTop: 12 }} />
      </SafeAreaView>
    );
  }

  if (!cartItems?.length) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Your bag is empty</Text>
        <Text style={styles.desc}>Add items to continue to checkout.</Text>
        <Button title="Shop now" onPress={() => router.push("/(tabs)/shop" as any)} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={false}
        enableAutomaticScroll={false}
        extraScrollHeight={0}
        keyboardOpeningTime={0}
        enableResetScrollToCoords={false}
       showsHorizontalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back to bag">
          <Text style={styles.backText}>← Back to bag</Text>
        </Pressable>

        <Text style={styles.heading}>Checkout</Text>
        <Text style={styles.step}>Shipping → Review → Pay</Text>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping address</Text>
            <Pressable onPress={() => setShowForm((v) => !v)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>{showForm ? "Cancel" : "+ New address"}</Text>
            </Pressable>
          </View>

          {showForm ? (
            <View style={styles.formCard}>
              <AddressForm onSubmit={handleCreateAddress} submitting={createAddr.isPending} />
            </View>
          ) : null}

          {!addresses?.length && !showForm ? (
            <View style={styles.emptyAddr}>
              <Text style={styles.desc}>No addresses yet. Add one to continue.</Text>
              <Button title="Add address" variant="secondary" onPress={() => setShowForm(true)} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {addresses?.map((a) => (
                <AddressCard
                  key={a.id}
                  address={a}
                  selected={a.id === effectiveSelected}
                  onSelect={() => setSelectedId(a.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order summary • {totals.itemCount} items</Text>
          <View style={{ gap: 10 }}>
            {cartItems.map((it) => {
              const p = it.variant.product;
              const primary = p?.images?.find((i) => i.is_primary) ?? p?.images?.[0];
              const unit = it.variant.price != null ? Number(it.variant.price) : Number(p?.base_price ?? 0);
              return (
                <View key={it.id} style={styles.summaryRow}>
                  <Image source={{ uri: primary?.image_url ?? "https://picsum.photos/300/400" }} style={styles.summaryImg} contentFit="cover" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.summaryName} numberOfLines={1}>{p?.name ?? "Product"}</Text>
                    <Text style={styles.summaryVariant}>{[it.variant.color, it.variant.size].filter(Boolean).join(" · ")} • ×{it.quantity}</Text>
                    <Text style={styles.summaryPrice}>${unit.toFixed(0)} each</Text>
                  </View>
                  <Text style={styles.summaryTotal}>${(unit * it.quantity).toFixed(0)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payment abstraction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentCard}>
            <View style={[styles.radio, styles.radioSelected]}>
              <View style={styles.radioDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Pay on delivery</Text>
              <Text style={styles.paymentDesc}>Cash / UPI on delivery — no payment required now (mock)</Text>
            </View>
          </View>
          <Text style={styles.paymentHint}>Payment provider will be integrated later. Order total is verified server-side.</Text>
        </View>

        {/* Rewards discount preview */}
        {(pendingAmount > 0 || pendingFreeShip) && (
          <View style={styles.rewardsBanner}>
            <Text style={styles.rewardsText}>
              ✓ Rewards applied: {pendingFreeShip ? "Free shipping" : `$${pendingAmount} off`} — will be deducted on this order
            </Text>
          </View>
        )}

        {/* Totals */}
        <CartSummary
          subtotal={totals.subtotal}
          shipping={totals.shipping}
          total={totals.total}
          itemCount={totals.itemCount}
          isFreeShipping={totals.isFreeShipping}
          freeShippingThreshold={totals.freeShippingThreshold}
          discount={totals.discount}
        />
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <View style={{ gap: 6 }}>
          <Button
            title={createOrder.isPending ? "Placing order…" : `Place order • $${totals.total.toFixed(2)}`}
            onPress={handlePlaceOrder}
            disabled={!selectedAddress || !cartItems.length || createOrder.isPending}
            loading={createOrder.isPending}
          />
          {createOrder.isError && <Text style={styles.error}>{String((createOrder.error as Error)?.message ?? "Failed")}</Text>}
          {!selectedAddress && <Text style={styles.footerHint}>Select a shipping address to continue</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.xl,
    gap: 20,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
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
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
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
  heading: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  step: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
    marginTop: -12,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  addBtn: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
  formCard: {
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyAddr: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  summaryImg: {
    width: 56,
    height: 70,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  summaryName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  summaryVariant: {
    fontSize: 11,
    color: colors.muted,
  },
  summaryPrice: {
    fontSize: 11,
    color: colors.muted,
  },
  summaryTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  paymentCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.foreground,
    alignItems: "center",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
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
  paymentTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  paymentDesc: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
    marginTop: 2,
  },
  paymentHint: {
    fontSize: 11,
    color: colors.mutedLight,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    textAlign: "center",
  },
  footerHint: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  },
  rewardsBanner: {
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.successBackground,
    borderWidth: 1,
    borderColor: "#A3D9B1",
    alignItems: "center",
  },
  rewardsText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success,
    textAlign: "center",
  },
});
