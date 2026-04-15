import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/constants/api';

const GREEN_DARK = '#1E3932';
const GREEN = '#00704A';
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
      {/* Dark green top area */}
      <View style={styles.topArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.iconWrap}>
          <Ionicons name="mail" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
      </View>

      {/* White card */}
      <View style={styles.card}>
        <Text style={styles.otpLabel}>ENTER OTP</Text>
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
            <Text style={styles.resendTimer}>Resend code in <Text style={{ color: GREEN_DARK, fontWeight: '700' }}>{resendTimer}s</Text></Text>
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
            <Text style={styles.verifyBtnText}>Verify & Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GREEN_DARK },
  topArea: {
    paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24,
  },
  backBtn: { marginBottom: 28 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
  emailHighlight: { color: '#D4E9E2', fontWeight: '700' },
  card: {
    flex: 1, backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28,
  },
  otpLabel: {
    fontSize: 11, fontWeight: '700', color: '#888',
    letterSpacing: 1.5, marginBottom: 20,
  },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28 },
  otpBox: {
    width: 46, height: 56, borderWidth: 1.5, borderColor: '#ddd',
    borderRadius: 10, textAlign: 'center', fontSize: 22,
    fontWeight: '800', color: GREEN_DARK,
  },
  otpBoxFilled: { borderColor: GREEN, backgroundColor: '#F0F8F5' },
  resendRow: { alignItems: 'center', marginBottom: 28 },
  resendTimer: { fontSize: 13, color: '#888' },
  resendLink: { fontSize: 13, color: GREEN, fontWeight: '700', textDecorationLine: 'underline' },
  verifyBtn: {
    backgroundColor: '#d0d0d0', borderRadius: 12,
    paddingVertical: 17, alignItems: 'center',
  },
  verifyBtnActive: { backgroundColor: GREEN },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
