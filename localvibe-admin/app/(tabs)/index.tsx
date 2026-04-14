import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const ACCENT = '#6A1B9A';

interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  open: boolean;
  vendorEmail: string;
}

export default function AdminHomeScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stores/all`);
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (e) {
      console.error('Failed to fetch stores', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchStores();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>LocalVibe Admin</Text>
          <Text style={styles.headerSub}>Manage your listed businesses</Text>
        </View>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>LV</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStores(); }} tintColor={ACCENT} />}
      >
        {/* List a new store CTA */}
        <TouchableOpacity style={styles.ctaBanner} onPress={() => router.push('/vendor/onboard' as any)}>
          <View style={styles.ctaLeft}>
            <Ionicons name="storefront-outline" size={28} color={ACCENT} />
            <View>
              <Text style={styles.ctaTitle}>List a New Business</Text>
              <Text style={styles.ctaSub}>Add your store in 1 easy step</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color={ACCENT} />
        </TouchableOpacity>

        {/* Stores */}
        <Text style={styles.sectionTitle}>Stores</Text>

        {loading ? (
          <ActivityIndicator color={ACCENT} style={{ marginTop: 40 }} />
        ) : stores.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No stores listed yet</Text>
            <Text style={styles.emptySub}>Tap "List a New Business" above to get started</Text>
          </View>
        ) : (
          stores.map(store => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeCard}
              onPress={() => router.push(`/vendor/manage?storeId=${store.id}&storeName=${encodeURIComponent(store.name)}` as any)}
            >
              <View style={styles.storeIcon}>
                <Ionicons name="storefront" size={22} color={ACCENT} />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeCategory}>{store.category}</Text>
                {store.vendorEmail ? (
                  <Text style={styles.vendorEmail}>{store.vendorEmail}</Text>
                ) : null}
              </View>
              <View style={styles.storeRight}>
                <View style={[styles.statusDot, { backgroundColor: store.open ? '#4CAF50' : '#bbb' }]} />
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  ctaBanner: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: ACCENT,
    shadowColor: ACCENT, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ctaTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  ctaSub: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#999' },
  emptySub: { fontSize: 13, color: '#bbb', textAlign: 'center' },
  storeCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  storeIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#f3ebfc', alignItems: 'center', justifyContent: 'center',
  },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  storeCategory: { fontSize: 12, color: '#888', marginTop: 2 },
  vendorEmail: { fontSize: 11, color: ACCENT, marginTop: 3 },
  storeRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
