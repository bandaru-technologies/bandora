import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
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
});
