import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';
import { useAuth } from '@/context/AuthContext';

type Service = {
  id: number;
  name: string;
  description: string;
  doctorName: string;
  consultationFee: number;
  icon: string;
};

const SERVICE_STYLE: Record<string, { bg: string; iconColor: string; icon: string }> = {
  'Haircut':        { bg: '#F3E5F5', iconColor: '#6A1B9A', icon: 'cut-outline' },
  'Hair Color':     { bg: '#FCE4EC', iconColor: '#C62828', icon: 'color-palette' },
  'Facial':         { bg: '#FFF8E1', iconColor: '#F57F17', icon: 'sparkles' },
  'Manicure':       { bg: '#E8F5E9', iconColor: '#2E7D32', icon: 'hand-left-outline' },
  'Pedicure':       { bg: '#E0F7FA', iconColor: '#00695C', icon: 'footsteps-outline' },
  'Bridal Makeup':  { bg: '#FCE4EC', iconColor: '#AD1457', icon: 'rose' },
  'Head Spa':       { bg: '#E3F2FD', iconColor: '#1565C0', icon: 'water-outline' },
  'Massage':        { bg: '#F1F8E9', iconColor: '#558B2F', icon: 'body-outline' },
};

export default function SalonServicesScreen() {
  const { storeId, storeName } = useLocalSearchParams<{ storeId: string; storeName: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isVendor = user?.role === 'VENDOR' && user?.storeId?.toString() === storeId;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/clinics/${storeId}/departments`)
      .then(r => r.json())
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  const renderService = ({ item }: { item: Service }) => {
    const s = SERVICE_STYLE[item.name] ?? { bg: '#F5F5F5', iconColor: '#666', icon: 'cut-outline' };
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({
          pathname: '/clinic/slots/[departmentId]',
          params: { departmentId: item.id, deptName: item.name, storeName, doctorName: item.doctorName, fee: item.consultationFee },
        })}
      >
        <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon as any} size={32} color={s.iconColor} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDesc}>{item.description}</Text>
          <View style={styles.stylistRow}>
            <Ionicons name="person-circle-outline" size={14} color="#888" />
            <Text style={styles.stylistName}>{item.doctorName}</Text>
          </View>
        </View>
        <View style={styles.feeBox}>
          <Text style={styles.feeLabel}>Price</Text>
          <Text style={styles.feeAmount}>₹{item.consultationFee.toFixed(0)}</Text>
          <Ionicons name="chevron-forward" size={16} color="#6A1B9A" style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{storeName}</Text>
          <Text style={styles.headerSub}>Select Service</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {isVendor && (
        <View style={styles.vendorPanel}>
          <Text style={styles.vendorPanelTitle}>Manage Your Store</Text>
          <View style={styles.vendorMenu}>
            <TouchableOpacity style={styles.vendorMenuItem} onPress={() => router.push(`/vendor/manage-slots?storeId=${storeId}&storeName=${encodeURIComponent(storeName ?? '')}&category=Salon` as any)}>
              <Ionicons name="construct-outline" size={22} color="#006491" />
              <Text style={styles.vendorMenuLabel}>Manage Services</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.vendorMenuItem} onPress={() => router.push(`/vendor/manage-slots?storeId=${storeId}&storeName=${encodeURIComponent(storeName ?? '')}&category=Salon` as any)}>
              <Ionicons name="time-outline" size={22} color="#006491" />
              <Text style={styles.vendorMenuLabel}>Manage Appointment Slots</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.vendorMenuItem} onPress={() => router.push(`/vendor/manage?storeId=${storeId}&storeName=${encodeURIComponent(storeName ?? '')}&vendorMode=true` as any)}>
              <Ionicons name="calendar-outline" size={22} color="#006491" />
              <Text style={styles.vendorMenuLabel}>View Bookings</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6A1B9A" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : services.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cut-outline" size={56} color="#ccc" />
          <Text style={styles.emptyText}>No services available</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={s => s.id.toString()}
          renderItem={renderService}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {services.length} service{services.length > 1 ? 's' : ''} available
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#6A1B9A', paddingHorizontal: 16, paddingVertical: 14,
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  list: { padding: 16, gap: 12 },
  listHeader: { fontSize: 13, color: '#888', marginBottom: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  cardBody: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  serviceDesc: { fontSize: 12, color: '#888', marginBottom: 6 },
  stylistRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stylistName: { fontSize: 12, color: '#555' },
  feeBox: { alignItems: 'center', minWidth: 60 },
  feeLabel: { fontSize: 10, color: '#888' },
  feeAmount: { fontSize: 15, fontWeight: '800', color: '#6A1B9A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  emptyText: { color: '#aaa', fontSize: 15 },
  vendorPanel: { marginBottom: 16 },
  vendorPanelTitle: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  vendorMenu: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  vendorMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  vendorMenuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a1a' },
  menuDivider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 52 },
});
