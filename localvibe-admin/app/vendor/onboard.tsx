import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const GREEN_DARK = '#1E3932';
const GREEN = '#00704A';
const CREAM = '#F2F0EB';
const MINT = '#D4E9E2';

const CATEGORIES = ['Salon', 'Doctor/Clinic', 'Pharmacy', 'Groceries', 'Electronics'];

export default function OnboardScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Salon');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [opensAt, setOpensAt] = useState('9:00 AM');
  const [closesAt, setClosesAt] = useState('9:00 PM');
  const [isOpen, setIsOpen] = useState(true);
  const [vendorEmail, setVendorEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const canProceed = name.trim() && category && address.trim() && phone.trim()
    && vendorEmail.includes('@') && vendorEmail.includes('.');

  const handleNext = async () => {
    if (!canProceed) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stores/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, address, phone, opensAt, closesAt, isOpen, vendorEmail }),
      });
      if (!res.ok) throw new Error('Failed to create store');
      router.replace((`/vendor/success?storeName=${encodeURIComponent(name)}&vendorEmail=${encodeURIComponent(vendorEmail)}`) as any);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>List a Business</Text>
          <Text style={styles.headerSub}>Fill in the store details below</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Store name */}
        <Text style={styles.label}>Store Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Glamour Studio"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#aaa"
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Address */}
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Full address"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={2}
          placeholderTextColor="#aaa"
        />

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="98765 43210"
          value={phone}
          onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
          keyboardType="phone-pad"
          maxLength={10}
          placeholderTextColor="#aaa"
        />

        {/* Vendor Email */}
        <Text style={styles.label}>Vendor Email</Text>
        <TextInput
          style={styles.input}
          placeholder="vendor@example.com"
          value={vendorEmail}
          onChangeText={setVendorEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={14} color={GREEN} />
          <Text style={styles.vendorHint}>The vendor will login with this email to manage services & slots</Text>
        </View>

        {/* Timing */}
        <Text style={styles.label}>Business Hours</Text>
        <View style={styles.timingRow}>
          <View style={styles.timingField}>
            <Text style={styles.timingLabel}>Opens at</Text>
            <TextInput
              style={styles.timingInput}
              value={opensAt}
              onChangeText={setOpensAt}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.timingField}>
            <Text style={styles.timingLabel}>Closes at</Text>
            <TextInput
              style={styles.timingInput}
              value={closesAt}
              onChangeText={setClosesAt}
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        {/* Open toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Currently Open</Text>
            <Text style={styles.toggleSub}>Store is accepting bookings</Text>
          </View>
          <Switch
            value={isOpen}
            onValueChange={setIsOpen}
            trackColor={{ false: '#ddd', true: GREEN }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>List Store</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    backgroundColor: GREEN_DARK,
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  content: { padding: 20, paddingBottom: 24 },
  label: {
    fontSize: 12, fontWeight: '700', color: '#555',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 18, marginBottom: 8,
  },
  input: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: GREEN_DARK, backgroundColor: '#fff',
  },
  multilineInput: { minHeight: 68, textAlignVertical: 'top' },
  chipsScroll: { marginBottom: 4 },
  chip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: GREEN_DARK, borderColor: GREEN_DARK },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  chipTextActive: { color: '#fff' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  vendorHint: { fontSize: 12, color: '#666', flex: 1, lineHeight: 16 },
  timingRow: { flexDirection: 'row', gap: 12 },
  timingField: { flex: 1 },
  timingLabel: { fontSize: 12, color: '#888', marginBottom: 6, fontWeight: '600' },
  timingInput: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: GREEN_DARK, backgroundColor: '#fff',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 18, padding: 16, backgroundColor: MINT,
    borderRadius: 12,
  },
  toggleLabel: { fontSize: 14, color: GREEN_DARK, fontWeight: '700' },
  toggleSub: { fontSize: 12, color: '#555', marginTop: 2 },
  footer: {
    padding: 16, paddingBottom: 28,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8e8e8',
  },
  nextBtn: {
    backgroundColor: GREEN, borderRadius: 12,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
