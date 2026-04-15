import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
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
            <Text style={styles.profileEmail}>
              {token ? (user?.email ?? '') : 'Guest User'}
            </Text>
          </View>
          {!token && (
            <TouchableOpacity style={styles.loginChip} onPress={() => router.push('/login')}>
              <Text style={styles.loginChipText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vendor: My Store */}
        {user?.role === 'VENDOR' && user.storeId ? (
          <View>
            <Text style={styles.sectionLabel}>My Store</Text>
            <TouchableOpacity
              style={styles.myStoreCard}
              onPress={() => {
                const cat = user.storeCategory ?? '';
                router.push(`/vendor/manage-slots?storeId=${user.storeId}&storeName=${encodeURIComponent(user.storeName ?? '')}&category=${encodeURIComponent(cat)}` as any);
              }}
            >
              <View style={styles.myStoreIcon}>
                <Ionicons name="storefront" size={24} color="#006491" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.myStoreName}>{user.storeName}</Text>
                <Text style={styles.myStoreCat}>{user.storeCategory}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Menu */}
        <View style={styles.section}>
          <MenuItem icon="calendar-outline" label="My Appointments" onPress={() => router.push('/appointments' as any)} />
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

        <Text style={styles.version}>LocalVibe v1.0.0</Text>
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
  profileEmail: { fontSize: 14, color: '#555', marginTop: 2 },
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
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#888',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  myStoreCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: '#b3d9f0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  myStoreIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center',
  },
  myStoreName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  myStoreCat: { fontSize: 12, color: '#006491', marginTop: 2 },
});
