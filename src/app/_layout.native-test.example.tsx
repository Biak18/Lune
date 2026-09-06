// Example: using @react-navigation/native-stack directly for testing back animation
// This is NOT used by expo-router — keep as reference. Expo Router's <Stack> already wraps native-stack.
// To test, replace src/app/_layout.tsx Stack with this implementation temporarily.
/*
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export function NativeStackTest() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAF4EC' },
          animation: 'slide_from_right',
          animationDuration: 260,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: false,
          freezeOnBlur: true,
        }}
      >
        <Stack.Screen name="home" component={HomeScreen} options={{ animation: 'fade', animationDuration: 150 }} />
        <Stack.Screen name="product" component={ProductScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/
// Note: expo-router Stack props map 1:1 to native-stack props. If back glitch persists with native-stack,
// the cause is likely list re-render (FlashList) or contentStyle flash, not navigator.
