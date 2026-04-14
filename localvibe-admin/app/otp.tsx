import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/constants/api';

const ACCENT = '#6A1B9A';
const OTP_LENGTH = 6;

export default function AdminOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleDigitChange = (value: string, index: number) => {
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        await login(data.token, { email: data.email, name: data.name ?? '' });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Invalid OTP', data.message || 'Please try again');
        setDigits(Array(OTP_LENGTH).fill(''));
        inputs.current[0]?.focus();
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(30);
    setDigits(Array(OTP_LENGTH).fill(''));
    try {
      await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email');
    } catch {
      Alert.alert('Error', 'Could not resend OTP');
    }
  };

  const isComplete = digits.every(d => d !== '');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={ACCENT} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>LV</Text>
          </View>
          <View>
            <Text style={styles.logoText}>LocalVibe</Text>
            <Text style={styles.adminBadge}>Admin Portal</Text>
          </View>
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={el => { inputs.current[i] = el; }}
              style={[styles.otpBox, d !== '' && styles.otpBoxFilled]}
              value={d}
              onChangeText={v => handleDigitChange(v, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>Resend OTP in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, isComplete && styles.verifyBtnActive]}
          onPress={handleVerify}
          disabled={loading || !isComplete}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify &amp; Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F3E5F5',
    justifyContent: 'center', paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  backBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
  },
  logoIconText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  logoText: { fontSize: 20, fontWeight: '800', color: ACCENT },
  adminBadge: {
    fontSize: 10, fontWeight: '600', color: '#fff',
    backgroundColor: ACCENT, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 24 },
  emailText: { fontWeight: '700', color: '#1a1a1a' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 },
  otpBox: {
    width: 44, height: 52, borderWidth: 1.5, borderColor: '#ddd',
    borderRadius: 8, textAlign: 'center', fontSize: 20,
    fontWeight: '700', color: '#1a1a1a',
  },
  otpBoxFilled: { borderColor: ACCENT, backgroundColor: '#F3E5F5' },
  resendRow: { alignItems: 'center', marginBottom: 24 },
  resendTimer: { fontSize: 13, color: '#888' },
  resendLink: { fontSize: 13, color: ACCENT, fontWeight: '600', textDecorationLine: 'underline' },
  verifyBtn: {
    backgroundColor: '#ccc', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
  },
  verifyBtnActive: { backgroundColor: ACCENT },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
