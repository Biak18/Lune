import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryProvider>
            <AuthProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#FAF4EC" },
                  animation: "slide_from_right",
                  animationDuration: 280,
                  gestureEnabled: true,
                  gestureDirection: "horizontal",
                  fullScreenGestureEnabled: true,
                }}
              >
                <Stack.Screen name="index" options={{ animation: "fade", animationDuration: 180 }} />
                <Stack.Screen name="auth" options={{ animation: "slide_from_right", animationDuration: 260 }} />
                <Stack.Screen name="(tabs)" options={{ animation: "fade", animationDuration: 160, gestureEnabled: false }} />
                <Stack.Screen name="product/[id]" options={{ animation: "slide_from_right", animationDuration: 320 }} />
                <Stack.Screen name="category/[id]" options={{ animation: "slide_from_right", animationDuration: 280 }} />
                <Stack.Screen name="search" options={{ animation: "fade_from_bottom", animationDuration: 240 }} />
                <Stack.Screen
                  name="checkout/index"
                  options={{ headerShown: false, animation: "slide_from_bottom", animationDuration: 320, gestureEnabled: true }}
                />
                <Stack.Screen
                  name="checkout/success"
                  options={{ headerShown: false, animation: "slide_from_bottom", animationDuration: 320 }}
                />
                <Stack.Screen
                  name="orders/index"
                  options={{ headerShown: false, animation: "slide_from_right", animationDuration: 280 }}
                />
                <Stack.Screen
                  name="orders/[id]"
                  options={{ headerShown: false, animation: "slide_from_right", animationDuration: 280 }}
                />
                <Stack.Screen
                  name="style-finder/index"
                  options={{ headerShown: false, animation: "slide_from_right", animationDuration: 280 }}
                />
                <Stack.Screen
                  name="notifications/index"
                  options={{ headerShown: false, animation: "slide_from_right", animationDuration: 260 }}
                />
                <Stack.Screen
                  name="admin/index"
                  options={{ headerShown: false, animation: "slide_from_right", animationDuration: 260 }}
                />
                <Stack.Screen
                  name="admin/products"
                  options={{ headerShown: false, animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="admin/orders"
                  options={{ headerShown: false, animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="admin/inventory"
                  options={{ headerShown: false, animation: "slide_from_right" }}
                />
                <Stack.Screen
                  name="assistant/index"
                  options={{ headerShown: false, animation: "slide_from_right", animationDuration: 280 }}
                />
              </Stack>
            </AuthProvider>
          </QueryProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
