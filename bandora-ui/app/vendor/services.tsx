import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const ACCENT = '#6A1B9A';

const SALON_CHIPS = [
  'Haircut', 'Hair Color', 'Facial', 'Manicure',
  'Pedicure', 'Bridal Makeup', 'Head Spa', 'Massage',
];

interface ServiceCard {
  id: string;
  name: string;
  description: string;
  stylistName: string;
  price: string;
}

export default function ServicesScreen() {
  const router = useRouter();
  const { storeId, storeName, category } = useLocalSearchParams<{
    storeId: string; storeName: string; category: string;
  }>();

  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(false);

  const addFromChip = (chipName: string) => {
    if (services.find(s => s.name === chipName)) return;
    setServices(prev => [...prev, {
      id: Date.now().toString(),
      name: chipName,
      description: '',
      stylistName: '',
      price: '',
    }]);
  };

  const addCustom = () => {
    setServices(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      description: '',
      stylistName: '',
      price: '',
    }]);
  };

  const updateService = (id: string, field: keyof ServiceCard, value: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleNext = async () => {
    if (services.length === 0) {
      Alert.alert('Add at least one service');
      return;
    }
    setLoading(true);
    try {
      const results: { id: number; name: string }[] = [];
      for (const svc of services) {
        const res = await fetch(`${API_BASE}/api/clinics/${storeId}/departments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: svc.name,
            description: svc.description,
            doctorName: svc.stylistName,
            consultationFee: svc.price ? parseFloat(svc.price) : 0,
            icon: '',
          }),
        });
        if (!res.ok) throw new Error(`Failed to add service: ${svc.name}`);
        const data = await res.json();
        results.push({ id: data.id, name: data.name });
      }
      router.push((`/vendor/slots?storeId=${storeId}&storeName=${encodeURIComponent(storeName ?? '')}&services=${encodeURIComponent(JSON.stringify(results))}`) as any);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const activeChips = services.map(s => s.name);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Services</Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <View style={[styles.stepDot, { backgroundColor: ACCENT }]} />
        <View style={[styles.stepLine, { backgroundColor: ACCENT }]} />
        <View style={[styles.stepDot, { backgroundColor: ACCENT }]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.stepDotInactive]} />
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.chipsWrap}>
          {SALON_CHIPS.map(chip => {
            const active = activeChips.includes(chip);
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, active && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                onPress={() => addFromChip(chip)}
              >
                <Text style={[styles.chipText, active && { color: '#fff' }]}>{chip}</Text>
                {!active && <Ionicons name="add" size={14} color="#888" style={{ marginLeft: 4 }} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {services.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Your Services ({services.length})</Text>
            {services.map((svc, idx) => (
              <View key={svc.id} style={styles.serviceCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardNum}>Service {idx + 1}</Text>
                  <TouchableOpacity onPress={() => removeService(svc.id)}>
                    <Ionicons name="close-circle" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Service Name</Text>
                <TextInput
                  style={styles.input}
                  value={svc.name}
                  onChangeText={v => updateService(svc.id, 'name', v)}
                  placeholder="e.g. Haircut"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={svc.description}
                  onChangeText={v => updateService(svc.id, 'description', v)}
                  placeholder="Brief description"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.fieldLabel}>Stylist Name</Text>
                <TextInput
                  style={styles.input}
                  value={svc.stylistName}
                  onChangeText={v => updateService(svc.id, 'stylistName', v)}
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.fieldLabel}>Price ₹</Text>
                <TextInput
                  style={styles.input}
                  value={svc.price}
                  onChangeText={v => updateService(svc.id, 'price', v)}
                  placeholder="e.g. 500"
                  keyboardType="numeric"
                  placeholderTextColor="#aaa"
                />
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.addCustomBtn} onPress={addCustom}>
          <Ionicons name="add-circle-outline" size={20} color={ACCENT} />
          <Text style={styles.addCustomText}>+ Add Custom Service</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, services.length === 0 && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={services.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>Next: Set Slots</Text>
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
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepDotInactive: { backgroundColor: '#ddd' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#ddd' },
  stepLabel: { fontSize: 12, color: '#888', marginLeft: 8 },
  content: { padding: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  serviceCard: {
    borderWidth: 1, borderColor: '#e8d5f5', borderRadius: 14,
    padding: 16, marginBottom: 14, backgroundColor: '#fdf8ff',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  cardNum: { fontSize: 13, fontWeight: '700', color: ACCENT },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff',
  },
  addCustomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: ACCENT, borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addCustomText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  nextBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
