import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const GREEN_DARK = '#1E3932';
const GREEN = '#00704A';
const CREAM = '#F2F0EB';
const MINT = '#D4E9E2';

export default function AdminSettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <View style={styles.content}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={GREEN} />
          </View>
          <View style={styles.profileInfo}>
            {user?.name ? <Text style={styles.profileName}>{user.name}</Text> : null}
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Info row */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={18} color={GREEN} />
          <Text style={styles.infoText}>You have full access to manage all listed businesses</Text>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#c0392b" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>LocalVibe Admin v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: {
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  content: { padding: 16, gap: 14 },
  profileCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: MINT, alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '800', color: GREEN_DARK },
  profileEmail: { fontSize: 13, color: '#888', marginTop: 2 },
  adminBadge: {
    backgroundColor: GREEN_DARK, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  adminBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  infoCard: {
    backgroundColor: MINT, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, color: GREEN_DARK, lineHeight: 18 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  logoutText: { color: '#c0392b', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 8 },
});
