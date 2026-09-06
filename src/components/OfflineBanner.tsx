import { colors } from "@/design/colors";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

export function OfflineBanner() {
  const net = useNetInfo();
  const wasOffline = useRef(false);

  const isOffline = net.isConnected === false || net.isInternetReachable === false;

  useEffect(() => {
    if (isOffline) wasOffline.current = true;
  }, [isOffline]);

  if (!isOffline) {
    if (!wasOffline.current) return null;
    // briefly show reconnected then fade out is handled by exit animation of previous render;
    // we just hide after connection restored — TanStack will refetch via refetchOnReconnect
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(200)} style={styles.banner}>
      <View style={styles.dot} />
      <Text style={styles.text}>You are offline Some features may be unavailable.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.foreground,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  text: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: 0.3,
  },
});
