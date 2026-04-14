import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { API_BASE } from '@/constants/api';
const API_URL = `${API_BASE}/api/auth`;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/send-otp`, {
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

  const isButtonActive = email.includes('@') && email.includes('.');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card */}
        <View style={styles.card}>
          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>LV</Text>
            </View>
            <Text style={styles.logoText}>LocalVibe</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Login to unlock awesome benefits</Text>

          {/* Benefits row */}
          <View style={styles.benefitsRow}>
            <View style={styles.benefit}>
              <MaterialCommunityIcons name="tag-multiple-outline" size={28} color="#c0392b" />
              <Text style={styles.benefitLabel}>Personalized{'\n'}Offers</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="gift-outline" size={28} color="#006491" />
              <Text style={styles.benefitLabel}>Loyalty{'\n'}Rewards</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="phone-portrait-outline" size={28} color="#006491" />
              <Text style={styles.benefitLabel}>Easy{'\n'}Payments</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email input */}
          <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
            <Text style={[styles.inputLabel, emailFocused && styles.inputLabelFocused]}>
              Email Address
            </Text>
            <TextInput
              style={styles.emailInput}
              placeholder="you@example.com"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.termsText}>
            By going forward you accept our{' '}
            <Text style={styles.termsLink}>Terms &amp; Conditions</Text>
          </Text>
          <TouchableOpacity
            style={[styles.otpBtn, isButtonActive && styles.otpBtnActive]}
            onPress={handleSendOtp}
            disabled={loading || !isButtonActive}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.otpBtnText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEBEB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  skipText: {
    color: '#006491',
    fontSize: 15,
    fontWeight: '500',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#006491',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  logoText: {
    color: '#006491',
    fontSize: 26,
    fontWeight: '700',
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    lineHeight: 26,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  benefit: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  benefitLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 24,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  inputWrapperFocused: {
    borderColor: '#006491',
  },
  inputLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  inputLabelFocused: {
    color: '#006491',
  },
  emailInput: {
    fontSize: 16,
    color: '#1a1a1a',
    padding: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  termsLink: {
    color: '#006491',
  },
  otpBtn: {
    backgroundColor: '#9E9E9E',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  otpBtnActive: {
    backgroundColor: '#006491',
  },
  otpBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
