import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const ACCENT = '#6A1B9A';
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
      const data = await res.json();
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
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Your Business</Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <View style={[styles.stepDot, { backgroundColor: ACCENT }]} />
        <Text style={styles.stepLabel}>Store Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Store Information</Text>

        <Text style={styles.label}>Store Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Glamour Studio"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && { backgroundColor: ACCENT, borderColor: ACCENT }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
        <Text style={styles.vendorHint}>The vendor will login with this email to manage services & slots</Text>

        <Text style={styles.label}>Timing</Text>
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

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Store is currently open</Text>
          <Switch
            value={isOpen}
            onValueChange={setIsOpen}
            trackColor={{ false: '#ddd', true: ACCENT }}
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
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fafafa',
  },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: ACCENT },
  stepDotInactive: { backgroundColor: '#ddd' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#ddd' },
  stepLabel: { fontSize: 12, color: '#888', marginLeft: 8 },
  content: { padding: 20, gap: 4, paddingBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa',
  },
  multilineInput: { minHeight: 64, textAlignVertical: 'top' },
  chipsScroll: { marginVertical: 4 },
  chip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
    backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  timingRow: { flexDirection: 'row', gap: 12 },
  timingField: { flex: 1 },
  timingLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  timingInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, padding: 14, backgroundColor: '#f8f4fc',
    borderRadius: 10,
  },
  toggleLabel: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  vendorHint: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 4, fontStyle: 'italic' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  nextBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
