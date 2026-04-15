import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const GREEN_DARK = '#1E3932';
const GREEN = '#00704A';
const CREAM = '#F2F0EB';
const ADMIN_EMAIL = 'bandarutechnologies@gmail.com';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const isValid = email.includes('@') && email.includes('.');

  const handleSendOtp = async () => {
    if (!isValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
      Alert.alert('Access Denied', 'This portal is restricted to admin users only.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push({ pathname: '/otp', params: { email } });
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hero header */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoInitials}>LV</Text>
          </View>
          <Text style={styles.brand}>LocalVibe</Text>
          <View style={styles.adminPill}>
            <Text style={styles.adminPillText}>Admin Portal</Text>
          </View>
          <Text style={styles.heroSub}>Sign in to manage your listed businesses</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={15} color={GREEN} />
            <Text style={styles.infoText}>Secure OTP login — no password needed</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={18} color={focused ? GREEN : '#aaa'} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="admin@example.com"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, isValid ? styles.btnActive : styles.btnDisabled]}
            onPress={handleSendOtp}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnText}>Send OTP</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GREEN_DARK },
  scroll: { flexGrow: 1 },
  hero: {
    alignItems: 'center', paddingTop: 72, paddingBottom: 40, paddingHorizontal: 24,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoInitials: { color: '#fff', fontSize: 26, fontWeight: '900' },
  brand: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  adminPill: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 6, marginBottom: 16,
  },
  adminPillText: { color: '#D4E9E2', fontSize: 12, fontWeight: '600' },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16,
    padding: 24, shadowColor: '#000', shadowOpacity: 0.12,
    shadowRadius: 16, elevation: 6,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  infoText: { fontSize: 13, color: '#555' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#1E3932', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  inputWrapperFocused: { borderColor: GREEN },
  input: { flex: 1, fontSize: 15, color: '#1a1a1a', padding: 0 },
  footer: { padding: 20, paddingBottom: 40 },
  btn: {
    borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnActive: { backgroundColor: GREEN },
  btnDisabled: { backgroundColor: 'rgba(0,112,74,0.4)' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
