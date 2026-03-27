import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

type CategoryItem = {
  id: number;
  label: string;
  icon: string;
  iconLib: 'ion' | 'mci' | 'fa5';
  bg: string;
  iconColor: string;
  comingSoon?: boolean;
};

const LOCAL_SERVICES: CategoryItem[] = [
  { id: 1, label: 'Groceries',    icon: 'cart',                  iconLib: 'ion', bg: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 2, label: 'Pharmacy',     icon: 'medkit',                iconLib: 'ion', bg: '#FCE4EC', iconColor: '#C62828' },
  { id: 3, label: 'Electronics',  icon: 'hardware-chip-outline', iconLib: 'ion', bg: '#E3F2FD', iconColor: '#1565C0' },
  { id: 4, label: 'Fashion',      icon: 'shirt-outline',         iconLib: 'ion', bg: '#F3E5F5', iconColor: '#6A1B9A' },
  { id: 5, label: 'Home & Living',icon: 'home',                  iconLib: 'ion', bg: '#FFF3E0', iconColor: '#E65100' },
  { id: 6, label: 'New Arrivals', icon: 'sparkles',              iconLib: 'ion', bg: '#E0F7FA', iconColor: '#00695C' },
];

const TRENDING_ITEMS: CategoryItem[] = [
  { id: 1, label: 'Mobiles',     icon: 'phone-portrait-outline', iconLib: 'ion', bg: '#E3F2FD', iconColor: '#1565C0' },
  { id: 2, label: 'Laptops',     icon: 'laptop-outline',         iconLib: 'ion', bg: '#EDE7F6', iconColor: '#4527A0' },
  { id: 3, label: 'Appliances',  icon: 'tv-outline',             iconLib: 'ion', bg: '#FFF8E1', iconColor: '#F57F17' },
  { id: 4, label: 'Accessories', icon: 'watch-outline',          iconLib: 'ion', bg: '#FCE4EC', iconColor: '#AD1457' },
  { id: 5, label: 'Sports',      icon: 'football-outline',       iconLib: 'ion', bg: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 6, label: 'Toys',        icon: 'game-controller-outline',iconLib: 'ion', bg: '#FFF3E0', iconColor: '#BF360C', comingSoon: true },
];

const NEARBY_STORES: CategoryItem[] = [
  { id: 1, label: 'SuperMart',  icon: 'storefront-outline', iconLib: 'ion', bg: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 2, label: 'FreshMart',  icon: 'leaf-outline',       iconLib: 'ion', bg: '#F1F8E9', iconColor: '#558B2F' },
  { id: 3, label: 'QuickStop',  icon: 'flash-outline',      iconLib: 'ion', bg: '#FFF9C4', iconColor: '#F9A825' },
  { id: 4, label: 'TechZone',   icon: 'desktop-outline',    iconLib: 'ion', bg: '#E3F2FD', iconColor: '#0D47A1' },
  { id: 5, label: 'StyleHub',   icon: 'bag-handle-outline', iconLib: 'ion', bg: '#F3E5F5', iconColor: '#7B1FA2' },
  { id: 6, label: 'HomeWorld',  icon: 'bed-outline',        iconLib: 'ion', bg: '#FFF3E0', iconColor: '#E65100' },
];

const APPOINTMENTS: CategoryItem[] = [
  { id: 1, label: 'Doctor/Clinic', icon: 'stethoscope', iconLib: 'mci', bg: '#FCE4EC', iconColor: '#C62828' },
  { id: 2, label: 'Salon',    icon: 'content-cut',      iconLib: 'mci', bg: '#F3E5F5', iconColor: '#6A1B9A' },
  { id: 3, label: 'Gym',      icon: 'dumbbell',         iconLib: 'mci', bg: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 4, label: 'Spa',      icon: 'spa',              iconLib: 'mci', bg: '#E0F7FA', iconColor: '#00695C' },
  { id: 5, label: 'Dentist',  icon: 'tooth-outline',    iconLib: 'mci', bg: '#E3F2FD', iconColor: '#1565C0' },
  { id: 6, label: 'EV Charge', icon: 'ev-station',       iconLib: 'mci', bg: '#E8F5E9', iconColor: '#1B5E20' },
];

function CategoryIcon({ icon, iconLib, iconColor, size = 34 }: {
  icon: string; iconLib: 'ion' | 'mci' | 'fa5'; iconColor: string; size?: number;
}) {
  if (iconLib === 'mci') return <MaterialCommunityIcons name={icon as any} size={size} color={iconColor} />;
  if (iconLib === 'fa5') return <FontAwesome5 name={icon as any} size={size} color={iconColor} />;
  return <Ionicons name={icon as any} size={size} color={iconColor} />;
}

function CategoryGrid({ items, onPress }: { items: CategoryItem[]; onPress?: (item: CategoryItem) => void }) {
  return (
    <View style={styles.grid}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.categoryCard}
          onPress={() => !item.comingSoon && onPress?.(item)}
          activeOpacity={item.comingSoon ? 1 : 0.7}
        >
          <View style={[styles.categoryImageBox, { backgroundColor: item.bg, opacity: item.comingSoon ? 0.5 : 1 }]}>
            <CategoryIcon icon={item.icon} iconLib={item.iconLib} iconColor={item.iconColor} />
          </View>
          <Text style={[styles.categoryLabel, item.comingSoon && { color: '#aaa' }]}>{item.label}</Text>
          {item.comingSoon && (
            <Text style={styles.comingSoonBadge}>Coming Soon</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const [locationModalVisible, setLocationModalVisible] = useState(true);
  const [locationText, setLocationText] = useState('Set your delivery location');
  const [locationLoading, setLocationLoading] = useState(false);
  const { user, logout } = useAuth();
  const { setCoords } = useLocation();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleAllowLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Location permission denied');
        setLocationModalVisible(false);
        return;
      }
      const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = coords.coords;
      setCoords({ latitude, longitude });

      // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const addr = data.address;
      const label = [
        addr.road || addr.pedestrian || addr.suburb,
        addr.suburb || addr.neighbourhood || addr.city_district,
        addr.city || addr.town || addr.village,
      ].filter(Boolean).slice(0, 2).join(', ');

      setLocationText(label || data.display_name?.split(',')[0] || 'Location detected');
    } catch {
      setLocationText('Could not fetch location');
    } finally {
      setLocationLoading(false);
      setLocationModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationRow} onPress={() => setLocationModalVisible(true)}>
          {locationLoading
            ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
            : <Ionicons name="location-sharp" size={18} color="#fff" />
          }
          <Text style={styles.locationText} numberOfLines={1}>{locationText}</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerGreeting}>
            Welcome{user?.name ? `, ${user.name}` : ''}! 👋
          </Text>
          <Text style={styles.bannerSubtitle}>What are you looking for today?</Text>
        </View>

        {/* Local Services */}
        <Text style={styles.sectionTitle}>Local Services</Text>
        <CategoryGrid
          items={LOCAL_SERVICES}
          onPress={item => router.push({ pathname: '/stores/[category]', params: { category: item.label } })}
        />

        {/* Today's Deals */}
        <Text style={styles.sectionTitle}>Today's Deals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsScroll}>
          {[
            { bg: '#E8F5E9', label: '20% OFF\nGroceries', color: '#2E7D32' },
            { bg: '#FCE4EC', label: 'Buy 1\nGet 1 Free', color: '#C62828' },
            { bg: '#E3F2FD', label: 'New\nArrivals', color: '#1565C0' },
            { bg: '#F3E5F5', label: 'Flash\nSale', color: '#6A1B9A' },
          ].map((d, i) => (
            <TouchableOpacity key={i} style={[styles.dealCard, { backgroundColor: d.bg }]}>
              <Text style={[styles.dealText, { color: d.color }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Near You */}
        <Text style={styles.sectionTitle}>Trending Near You</Text>
        <CategoryGrid
          items={TRENDING_ITEMS}
          onPress={item => router.push({ pathname: '/stores/[category]', params: { category: item.label } })}
        />

        {/* Nearby Stores */}
        <Text style={styles.sectionTitle}>Nearby Stores</Text>
        <CategoryGrid items={NEARBY_STORES} />

        {/* Schedule Appointment */}
        <Text style={styles.sectionTitle}>Schedule Appointment</Text>
        <CategoryGrid
          items={APPOINTMENTS}
          onPress={item => router.push({ pathname: '/stores/[category]', params: { category: item.label } })}
        />
      </ScrollView>

      {/* Location permission modal */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="location" size={32} color="#1a7a5e" style={styles.modalIcon} />
            <Text style={styles.modalText}>
              Allow <Text style={styles.modalBrand}>Bandora</Text> to access this{'\n'}
              device's location ?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)} disabled={locationLoading}>
                <Text style={styles.askLaterText}>Ask Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.allowBtn}
                onPress={handleAllowLocation}
                disabled={locationLoading}
              >
                {locationLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.allowBtnText}>Allow</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#006491',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#fff', fontSize: 14, fontWeight: '500', marginHorizontal: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  banner: {
    backgroundColor: '#006491',
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  bannerGreeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImageBox: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  comingSoonBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#FF7043',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 3,
    overflow: 'hidden',
  },
  dealsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dealCard: {
    width: 140,
    height: 90,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  dealText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '75%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIcon: { marginBottom: 12 },
  modalText: { fontSize: 17, color: '#1a1a1a', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  modalBrand: { fontWeight: '700' },
  modalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  askLaterText: { color: '#555', fontSize: 14, fontStyle: 'italic', textDecorationLine: 'underline' },
  allowBtn: { backgroundColor: '#c0392b', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  allowBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
