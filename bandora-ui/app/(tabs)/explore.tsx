import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [myStores, setMyStores] = useState<{ storeId: string; storeName: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('vendor_stores').then(raw => {
        try {
          const list = raw ? JSON.parse(raw) : [];
          setMyStores(Array.isArray(list) ? list : []);
        } catch {
          setMyStores([]);
        }
      });
    }, [])
  );

  const handleLogout = async () => {
    setMyStores([]);
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#006491" />
          </View>
          <View style={styles.profileInfo}>
            {user?.name ? (
              <Text style={styles.profileName}>{user.name}</Text>
            ) : null}
            <Text style={styles.profilePhone}>
              {token ? `+91 ${user?.phoneNumber ?? ''}` : 'Guest User'}
            </Text>
          </View>
          {!token && (
            <TouchableOpacity style={styles.loginChip} onPress={() => router.push('/login')}>
              <Text style={styles.loginChipText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* List Your Business Banner */}
        <TouchableOpacity
          style={styles.listBizBanner}
          onPress={() => router.push('/vendor/onboard' as any)}
        >
          <MaterialCommunityIcons name="store-plus-outline" size={24} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.listBizTitle}>List Your Business on Bandora</Text>
            <Text style={styles.listBizSub}>Salon, Clinic, Shop? Get discovered today</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* My Stores */}
        {myStores.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="storefront-outline" size={16} color="#6A1B9A" />
              <Text style={styles.sectionLabel}>My Stores</Text>
            </View>
            {myStores.map(store => (
              <TouchableOpacity
                key={store.storeId}
                style={styles.menuItem}
                onPress={() => router.push((`/vendor/manage?storeId=${store.storeId}&storeName=${encodeURIComponent(store.storeName)}`) as any)}
              >
                <Ionicons name="storefront-outline" size={22} color="#6A1B9A" />
                <Text style={[styles.menuLabel, { color: '#6A1B9A' }]} numberOfLines={1}>{store.storeName}</Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Menu */}
        <View style={styles.section}>
          <MenuItem icon="cart-outline" label="My Orders" onPress={() => {}} />
          <MenuItem icon="calendar-outline" label="My Appointments" onPress={() => router.push('/appointments' as any)} />
          <MenuItem icon="location-outline" label="Saved Addresses" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
          <MenuItem icon="document-text-outline" label="Terms & Conditions" onPress={() => {}} />
          <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
        </View>

        {token && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#c0392b" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>Bandora v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon as any} size={22} color="#006491" />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#006491', paddingHorizontal: 16, paddingVertical: 16,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  profilePhone: { fontSize: 14, color: '#555', marginTop: 2 },
  loginChip: {
    backgroundColor: '#006491', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  loginChipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  section: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    backgroundColor: '#fdf8ff',
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#6A1B9A', textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  menuLabel: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fff', borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  logoutText: { color: '#c0392b', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, color: '#bbb' },
  listBizBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#6A1B9A', borderRadius: 16, padding: 16,
  },
  listBizTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  listBizSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
});
