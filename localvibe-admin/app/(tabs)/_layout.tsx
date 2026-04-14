import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#6A1B9A';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        headerShown: false,
        tabBarStyle: { borderTopColor: '#f0f0f0' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stores',
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
