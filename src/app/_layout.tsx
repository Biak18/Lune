import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#FAF4EC" },
                animation: "fade",
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="category/[id]" />
              <Stack.Screen name="search" />
              <Stack.Screen name="checkout/index" options={{ headerShown: false }} />
              <Stack.Screen name="checkout/success" options={{ headerShown: false }} />
              <Stack.Screen name="orders/index" options={{ headerShown: false }} />
              <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="style-finder/index" options={{ headerShown: false }} />
              <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
            </Stack>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
