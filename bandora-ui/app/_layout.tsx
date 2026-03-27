import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';

export default function RootLayout() {
  return (
    <LocationProvider>
      <AuthProvider>
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
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </LocationProvider>
  );
}
