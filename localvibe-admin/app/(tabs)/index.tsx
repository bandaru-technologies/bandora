import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const GREEN_DARK = '#1E3932';
const GREEN = '#00704A';
const CREAM = '#F2F0EB';
const MINT = '#D4E9E2';

interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  open: boolean;
  vendorEmail: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  Salon: 'cut-outline',
  'Doctor/Clinic': 'medical-outline',
  Pharmacy: 'medkit-outline',
  Groceries: 'basket-outline',
  Electronics: 'phone-portrait-outline',
};

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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>LocalVibe Admin</Text>
          <Text style={styles.headerSub}>{stores.length} {stores.length === 1 ? 'business' : 'businesses'} listed</Text>
        </View>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>LV</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchStores(); }}
            tintColor={GREEN}
          />
        }
      >
        {/* CTA */}
        <TouchableOpacity style={styles.ctaBanner} onPress={() => router.push('/vendor/onboard' as any)}>
          <View style={styles.ctaLeft}>
            <View style={styles.ctaIconWrap}>
              <Ionicons name="add" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.ctaTitle}>List a New Business</Text>
              <Text style={styles.ctaSub}>Add a store and assign a vendor</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={GREEN} />
        </TouchableOpacity>

        {/* Stores section */}
        <Text style={styles.sectionTitle}>Stores</Text>

        {loading ? (
          <ActivityIndicator color={GREEN} style={{ marginTop: 48 }} />
        ) : stores.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="storefront-outline" size={40} color={GREEN} />
            </View>
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
              <View style={styles.storeIconWrap}>
                <Ionicons
                  name={(CATEGORY_ICONS[store.category] ?? 'storefront-outline') as any}
                  size={20}
                  color={GREEN}
                />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeCategory}>{store.category}</Text>
                {store.vendorEmail ? (
                  <Text style={styles.vendorEmail}>{store.vendorEmail}</Text>
                ) : null}
              </View>
              <View style={styles.storeRight}>
                <View style={[styles.statusPill, { backgroundColor: store.open ? '#E8F5E9' : '#f5f5f5' }]}>
                  <View style={[styles.statusDot, { backgroundColor: store.open ? '#2E7D32' : '#bbb' }]} />
                  <Text style={[styles.statusText, { color: store.open ? '#2E7D32' : '#999' }]}>
                    {store.open ? 'Open' : 'Closed'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    backgroundColor: GREEN_DARK,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  logoCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  ctaBanner: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: MINT,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { fontSize: 15, fontWeight: '700', color: GREEN_DARK },
  ctaSub: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#888',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 4,
  },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: MINT, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyText: { fontSize: 16, fontWeight: '700', color: GREEN_DARK },
  emptySub: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 18 },
  storeCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  storeIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: MINT, alignItems: 'center', justifyContent: 'center',
  },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '700', color: GREEN_DARK },
  storeCategory: { fontSize: 12, color: '#888', marginTop: 2 },
  vendorEmail: { fontSize: 11, color: GREEN, marginTop: 3 },
  storeRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
