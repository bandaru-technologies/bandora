import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const ACCENT = '#6A1B9A';

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
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>LV</Text>
            </View>
            <View>
              <Text style={styles.logoText}>LocalVibe</Text>
              <Text style={styles.adminBadge}>Admin Portal</Text>
            </View>
          </View>

          <Text style={styles.headline}>Sign in to manage{'\n'}your businesses</Text>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={ACCENT} />
            <Text style={styles.infoText}>Secure OTP login — no password needed</Text>
          </View>

          <View style={styles.divider} />

          {/* Email input */}
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <Text style={[styles.inputLabel, focused && styles.inputLabelFocused]}>
              Email Address
            </Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
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
            style={[styles.btn, isValid && styles.btnActive]}
            onPress={handleSendOtp}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3E5F5' },
  scroll: { flexGrow: 1, justifyContent: 'space-between', paddingTop: 60 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16,
    padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
  },
  logoIconText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  logoText: { fontSize: 22, fontWeight: '800', color: ACCENT },
  adminBadge: {
    fontSize: 11, fontWeight: '600', color: '#fff',
    backgroundColor: ACCENT, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2,
  },
  headline: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', lineHeight: 30, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  infoText: { fontSize: 13, color: '#666' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 20 },
  inputWrapper: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10,
  },
  inputWrapperFocused: { borderColor: ACCENT },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  inputLabelFocused: { color: ACCENT },
  input: { fontSize: 16, color: '#1a1a1a', padding: 0 },
  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 },
  btn: {
    backgroundColor: '#ccc', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
  },
  btnActive: { backgroundColor: ACCENT },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
