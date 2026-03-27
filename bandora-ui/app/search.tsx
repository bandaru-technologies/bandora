import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, ActivityIndicator, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

type Store = {
  id: number;
  name: string;
  category: string;
  address: string;
  rating: number;
  reviewCount: number;
  open: boolean;
  timing: string;
};

const CATEGORY_META: Record<string, { icon: string; lib: 'ion' | 'mci'; color: string; bg: string }> = {
  Salon:       { icon: 'content-cut',          lib: 'mci', color: '#6A1B9A', bg: '#F3E5F5' },
  Clinic:      { icon: 'stethoscope',           lib: 'mci', color: '#C62828', bg: '#FCE4EC' },
  Pharmacy:    { icon: 'medkit',                lib: 'ion', color: '#C62828', bg: '#FCE4EC' },
  Groceries:   { icon: 'cart',                  lib: 'ion', color: '#2E7D32', bg: '#E8F5E9' },
  Electronics: { icon: 'hardware-chip-outline', lib: 'ion', color: '#1565C0', bg: '#E3F2FD' },
};

function StoreIcon({ category }: { category: string }) {
  const meta = CATEGORY_META[category] ?? { icon: 'storefront-outline', lib: 'ion' as const, color: '#555', bg: '#f0f0f0' };
  return (
    <View style={[styles.storeIconBox, { backgroundColor: meta.bg }]}>
      {meta.lib === 'mci'
        ? <MaterialCommunityIcons name={meta.icon as any} size={26} color={meta.color} />
        : <Ionicons name={meta.icon as any} size={26} color={meta.color} />
      }
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/stores/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {}
      setLoading(false);
    }, 350);
  }, [query]);

  const handleStorePress = (store: Store) => {
    Keyboard.dismiss();
    const cat = store.category?.toLowerCase();
    if (cat === 'clinic') {
      router.push(`/clinic/${store.id}` as any);
    } else if (cat === 'salon') {
      router.push(`/salon/${store.id}` as any);
    } else {
      router.push((`/store/${store.id}?category=${encodeURIComponent(store.category)}`) as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search stores, services..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {loading && <ActivityIndicator size="small" color="#006491" style={{ marginLeft: 8 }} />}
      </View>

      {/* Results */}
      {query.trim().length < 2 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Type at least 2 characters to search</Text>
        </View>
      ) : results.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No stores found for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleStorePress(item)} activeOpacity={0.75}>
              <StoreIcon category={item.category} />
              <View style={styles.cardInfo}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeCategory}>{item.category}</Text>
                {item.address ? (
                  <Text style={styles.storeAddress} numberOfLines={1}>
                    <Ionicons name="location-outline" size={11} color="#888" /> {item.address}
                  </Text>
                ) : null}
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.openBadge, { backgroundColor: item.open ? '#E8F5E9' : '#fce4e4' }]}>
                  <Text style={[styles.openBadgeText, { color: item.open ? '#2E7D32' : '#c0392b' }]}>
                    {item.open ? 'Open' : 'Closed'}
                  </Text>
                </View>
                {item.rating > 0 && (
                  <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  backBtn: { padding: 4 },
  input: {
    flex: 1, fontSize: 15, color: '#1a1a1a',
    backgroundColor: '#f5f5f5', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  list: { padding: 14, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  storeIconBox: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  storeCategory: { fontSize: 12, color: '#006491', fontWeight: '600', marginTop: 2 },
  storeAddress: { fontSize: 11, color: '#888', marginTop: 3 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  openBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  openBadgeText: { fontSize: 11, fontWeight: '700' },
  rating: { fontSize: 12, color: '#555' },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32,
  },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center' },
});
