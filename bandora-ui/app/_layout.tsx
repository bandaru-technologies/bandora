import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { CartProvider } from '@/context/CartContext';
import { AppointmentsProvider } from '@/context/AppointmentsContext';

export default function RootLayout() {
  return (
    <LocationProvider>
      <AuthProvider>
        <CartProvider>
          <AppointmentsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="otp" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="stores/[category]" />
              <Stack.Screen name="store/[storeId]" />
              <Stack.Screen name="clinic/[storeId]" />
              <Stack.Screen name="clinic/slots/[departmentId]" />
              <Stack.Screen name="salon/[storeId]" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="payment" />
              <Stack.Screen name="delivery-assigned" />
              <Stack.Screen name="appointments" />
              <Stack.Screen name="booking-confirmed" />
            </Stack>
            <StatusBar style="auto" />
          </AppointmentsProvider>
        </CartProvider>
      </AuthProvider>
    </LocationProvider>
  );
}
