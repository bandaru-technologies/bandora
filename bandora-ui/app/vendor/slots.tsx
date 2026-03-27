import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const ACCENT = '#6A1B9A';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getPeriod(time: string): string {
  const [hStr, rest] = time.split(':');
  const h = parseInt(hStr, 10);
  const pm = rest?.includes('PM');
  const hour24 = pm ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
  if (hour24 < 12) return 'Morning';
  if (hour24 < 17) return 'Afternoon';
  return 'Evening';
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m === 30) break;
      const period = h < 12 ? 'AM' : 'PM';
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      slots.push(`${h12}:${m === 0 ? '00' : '30'} ${period}`);
    }
  }
  return slots;
}

function generateNext14Days(): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = `${DAY_NAMES[d.getDay()]} ${d.getDate()}`;
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ label, value });
  }
  return days;
}

interface ServiceInfo {
  id: number;
  name: string;
}

interface SlotState {
  expanded: boolean;
  selectedDates: string[];
  selectedTimes: string[];
  saved: boolean;
  saving: boolean;
}

export default function SlotsScreen() {
  const router = useRouter();
  const { storeId, storeName, services: servicesParam } = useLocalSearchParams<{
    storeId: string; storeName: string; services: string;
  }>();

  const services: ServiceInfo[] = useMemo(() => {
    try { return JSON.parse(decodeURIComponent(servicesParam ?? '[]')); }
    catch { return []; }
  }, [servicesParam]);

  const [slotStates, setSlotStates] = useState<Record<number, SlotState>>(() => {
    const init: Record<number, SlotState> = {};
    services.forEach(s => {
      init[s.id] = { expanded: false, selectedDates: [], selectedTimes: [], saved: false, saving: false };
    });
    return init;
  });

  const days = useMemo(() => generateNext14Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const toggleExpand = (id: number) => {
    setSlotStates(prev => ({
      ...prev,
      [id]: { ...prev[id], expanded: !prev[id].expanded },
    }));
  };

  const toggleDate = (id: number, date: string) => {
    setSlotStates(prev => {
      const cur = prev[id].selectedDates;
      const next = cur.includes(date) ? cur.filter(d => d !== date) : [...cur, date];
      return { ...prev, [id]: { ...prev[id], selectedDates: next } };
    });
  };

  const toggleTime = (id: number, time: string) => {
    setSlotStates(prev => {
      const cur = prev[id].selectedTimes;
      const next = cur.includes(time) ? cur.filter(t => t !== time) : [...cur, time];
      return { ...prev, [id]: { ...prev[id], selectedTimes: next } };
    });
  };

  const saveSlots = async (svc: ServiceInfo) => {
    const state = slotStates[svc.id];
    if (!state.selectedDates.length || !state.selectedTimes.length) {
      Alert.alert('Select at least one date and one time slot');
      return;
    }
    setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], saving: true } }));
    try {
      const payload: { date: string; time: string; period: string; available: boolean }[] = [];
      state.selectedDates.forEach(date => {
        state.selectedTimes.forEach(time => {
          payload.push({ date, time, period: getPeriod(time), available: true });
        });
      });
      const res = await fetch(`${API_BASE}/api/clinics/departments/${svc.id}/slots/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save slots');
      setSlotStates(prev => ({
        ...prev,
        [svc.id]: { ...prev[svc.id], saved: true, saving: false, expanded: false },
      }));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
      setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], saving: false } }));
    }
  };

  const allSaved = services.every(s => slotStates[s.id]?.saved);

  const handleGoLive = () => {
    router.push((`/vendor/success?storeName=${encodeURIComponent(storeName ?? '')}`) as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Availability</Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <View style={[styles.stepDot, { backgroundColor: ACCENT }]} />
        <View style={[styles.stepLine, { backgroundColor: ACCENT }]} />
        <View style={[styles.stepDot, { backgroundColor: ACCENT }]} />
        <View style={[styles.stepLine, { backgroundColor: ACCENT }]} />
        <View style={[styles.stepDot, { backgroundColor: ACCENT }]} />
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Set slots for each service</Text>

        {services.map(svc => {
          const state = slotStates[svc.id] ?? { expanded: false, selectedDates: [], selectedTimes: [], saved: false, saving: false };
          return (
            <View key={svc.id} style={[styles.serviceCard, state.saved && styles.serviceCardSaved]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{svc.name}</Text>
                  {state.saved && (
                    <Text style={styles.savedLabel}>
                      <Ionicons name="checkmark-circle" size={13} color="#27ae60" /> Slots saved
                    </Text>
                  )}
                </View>
                {state.saved ? (
                  <Ionicons name="checkmark-circle" size={26} color="#27ae60" />
                ) : (
                  <TouchableOpacity
                    style={styles.setSlotsBtn}
                    onPress={() => toggleExpand(svc.id)}
                  >
                    <Text style={styles.setSlotsBtnText}>
                      {state.expanded ? 'Collapse' : 'Set Slots'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {state.expanded && !state.saved && (
                <View style={styles.slotConfig}>
                  {/* Date selection */}
                  <Text style={styles.subLabel}>Select Dates</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
                    {days.map(day => {
                      const sel = state.selectedDates.includes(day.value);
                      return (
                        <TouchableOpacity
                          key={day.value}
                          style={[styles.dayChip, sel && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                          onPress={() => toggleDate(svc.id, day.value)}
                        >
                          <Text style={[styles.dayChipText, sel && { color: '#fff' }]}>{day.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Time slots */}
                  <Text style={[styles.subLabel, { marginTop: 14 }]}>Select Time Slots</Text>
                  <View style={styles.timeGrid}>
                    {timeSlots.map(t => {
                      const sel = state.selectedTimes.includes(t);
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[styles.timeChip, sel && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                          onPress={() => toggleTime(svc.id, t)}
                        >
                          <Text style={[styles.timeChipText, sel && { color: '#fff' }]}>{t}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => saveSlots(svc)}
                    disabled={state.saving}
                  >
                    {state.saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Slots for {svc.name}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.liveBtn, !allSaved && styles.liveBtnDisabled]}
          onPress={handleGoLive}
          disabled={!allSaved}
        >
          <Text style={styles.liveBtnText}>Go Live!</Text>
          <Ionicons name="rocket-outline" size={18} color="#fff" />
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
  stepLine: { flex: 1, height: 2, backgroundColor: '#ddd' },
  stepLabel: { fontSize: 12, color: '#888', marginLeft: 8 },
  content: { padding: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  serviceCard: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 14,
    padding: 14, marginBottom: 12, backgroundColor: '#fafafa',
  },
  serviceCardSaved: { borderColor: '#a8e6c1', backgroundColor: '#f0fff6' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  savedLabel: { fontSize: 12, color: '#27ae60', marginTop: 2 },
  setSlotsBtn: {
    backgroundColor: ACCENT, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  setSlotsBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  slotConfig: { marginTop: 14 },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  daysScroll: { marginBottom: 4 },
  dayChip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, marginRight: 8,
    backgroundColor: '#fff',
  },
  dayChipText: { fontSize: 12, fontWeight: '600', color: '#555' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: '#fff', width: '30%',
    alignItems: 'center',
  },
  timeChipText: { fontSize: 12, fontWeight: '600', color: '#555' },
  saveBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  liveBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  liveBtnDisabled: { opacity: 0.4 },
  liveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
