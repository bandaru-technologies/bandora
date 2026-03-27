import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocation } from '@/context/LocationContext';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

const CATEGORY_STYLE: Record<string, { bg: string; iconColor: string; icon: string }> = {
  'Groceries':      { bg: '#E8F5E9', iconColor: '#2E7D32', icon: 'cart' },
  'Pharmacy':       { bg: '#FCE4EC', iconColor: '#C62828', icon: 'medkit' },
  'Electronics':    { bg: '#E3F2FD', iconColor: '#1565C0', icon: 'hardware-chip-outline' },
  'Fashion':        { bg: '#F3E5F5', iconColor: '#6A1B9A', icon: 'shirt-outline' },
  'Home & Living':  { bg: '#FFF3E0', iconColor: '#E65100', icon: 'home' },
  'New Arrivals':   { bg: '#E0F7FA', iconColor: '#00695C', icon: 'sparkles' },
  'Accessories':    { bg: '#FCE4EC', iconColor: '#AD1457', icon: 'watch-outline' },
  'Mobiles':        { bg: '#E3F2FD', iconColor: '#1565C0', icon: 'phone-portrait-outline' },
  'Doctor/Clinic':  { bg: '#FCE4EC', iconColor: '#C62828', icon: 'medkit' },
  'Salon':          { bg: '#F3E5F5', iconColor: '#6A1B9A', icon: 'cut-outline' },
  'Gym':            { bg: '#E8F5E9', iconColor: '#2E7D32', icon: 'barbell-outline' },
  'Spa':            { bg: '#E0F7FA', iconColor: '#00695C', icon: 'flower-outline' },
  'Dentist':        { bg: '#E3F2FD', iconColor: '#1565C0', icon: 'medkit-outline' },
  'EV Charge':      { bg: '#E8F5E9', iconColor: '#1B5E20', icon: 'flash-outline' },
};

import { API_BASE } from '@/constants/api';
const API_URL = `${API_BASE}/api/stores`;

type Store = {
  id: number;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  open: boolean;
  timing: string;
  phone: string;
};

export default function StoreListScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { coords } = useLocation();
  const [stores, setStores] = useState<Store[]>([]);
  const [filtered, setFiltered] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}?category=${encodeURIComponent(category)}`)
      .then(r => r.json())
      .then(data => {
        setStores(data);
        setFiltered(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? stores.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q))
        : stores
    );
  }, [search, stores]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
        size={12}
        color="#F4A32A"
      />
    ));
  };

  const catStyle = CATEGORY_STYLE[category] ?? { bg: '#F5F5F5', iconColor: '#666', icon: 'storefront-outline' };

  const renderStore = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (category === 'Doctor/Clinic') {
          router.push({ pathname: '/clinic/[storeId]', params: { storeId: item.id, storeName: item.name } });
        } else {
          router.push({ pathname: '/store/[storeId]', params: { storeId: item.id, storeName: item.name } });
        }
      }}
    >
      {/* Store image placeholder */}
      <View style={[styles.cardImage, { backgroundColor: catStyle.bg }]}>
        <Ionicons name={catStyle.icon as any} size={40} color={catStyle.iconColor} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={[styles.badge, item.open ? styles.badgeOpen : styles.badgeClosed]}>
            <Text style={[styles.badgeText, item.open ? styles.badgeOpenText : styles.badgeClosedText]}>
              {item.open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>{renderStars(item.rating)}</View>
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color="#888" />
          <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={13} color="#888" />
          <Text style={styles.infoText}>{item.timing}</Text>
          {coords && item.latitude && item.longitude && (
            <Text style={styles.distanceBadge}>
              {haversineKm(coords.latitude, coords.longitude, item.latitude, item.longitude)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Near You</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${category} stores...`}
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#006491" />
          <Text style={styles.loadingText}>Finding stores near you...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="store-off-outline" size={56} color="#ccc" />
          <Text style={styles.emptyText}>No {category} stores found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={renderStore}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#006491',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    padding: 0,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 90,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeOpen: {
    backgroundColor: '#e6f9f0',
  },
  badgeClosed: {
    backgroundColor: '#fef0f0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeOpenText: {
    color: '#1a7a5e',
  },
  badgeClosedText: {
    color: '#c0392b',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 12,
    color: '#888',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  distanceBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#006491',
    backgroundColor: '#e8f4fb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
  },
});
