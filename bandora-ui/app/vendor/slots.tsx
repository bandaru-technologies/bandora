import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCENT = '#6A1B9A';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

// slotsByDate: { [date]: string[] } — per-date selected times
interface SlotState {
  expanded: boolean;
  activeDate: string | null;
  slotsByDate: Record<string, string[]>;
  saved: boolean;
  saving: boolean;
  editing: boolean;
  loadingExisting: boolean;
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
      init[s.id] = { expanded: false, activeDate: null, slotsByDate: {}, saved: false, saving: false, editing: false, loadingExisting: false };
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

  const selectDate = (id: number, date: string) => {
    setSlotStates(prev => {
      const cur = prev[id].slotsByDate;
      // If date not yet added, add it with empty slots; set as active
      if (!cur[date]) {
        return { ...prev, [id]: { ...prev[id], activeDate: date, slotsByDate: { ...cur, [date]: [] } } };
      }
      // Just switch active tab
      return { ...prev, [id]: { ...prev[id], activeDate: date } };
    });
  };

  const removeDate = (id: number, date: string) => {
    setSlotStates(prev => {
      const { [date]: _, ...rest } = prev[id].slotsByDate;
      const remainingDates = Object.keys(rest);
      const newActive = prev[id].activeDate === date
        ? (remainingDates[remainingDates.length - 1] ?? null)
        : prev[id].activeDate;
      return { ...prev, [id]: { ...prev[id], slotsByDate: rest, activeDate: newActive } };
    });
  };

  const toggleTime = (id: number, date: string, time: string) => {
    setSlotStates(prev => {
      const cur = prev[id].slotsByDate[date] ?? [];
      const next = cur.includes(time) ? cur.filter(t => t !== time) : [...cur, time];
      return { ...prev, [id]: { ...prev[id], slotsByDate: { ...prev[id].slotsByDate, [date]: next } } };
    });
  };

  const selectAllForDate = (id: number, date: string) => {
    setSlotStates(prev => ({
      ...prev,
      [id]: { ...prev[id], slotsByDate: { ...prev[id].slotsByDate, [date]: [...timeSlots] } },
    }));
  };

  const deselectAllForDate = (id: number, date: string) => {
    setSlotStates(prev => ({
      ...prev,
      [id]: { ...prev[id], slotsByDate: { ...prev[id].slotsByDate, [date]: [] } },
    }));
  };

  const startEditing = async (svc: ServiceInfo) => {
    setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], loadingExisting: true } }));
    try {
      const res = await fetch(`${API_BASE}/api/clinics/departments/${svc.id}/slots`);
      const data: { date: string; time: string }[] = await res.json();
      // Rebuild slotsByDate from existing data
      const slotsByDate: Record<string, string[]> = {};
      data.forEach(s => {
        if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
        slotsByDate[s.date].push(s.time);
      });
      const firstDate = Object.keys(slotsByDate)[0] ?? null;
      setSlotStates(prev => ({
        ...prev,
        [svc.id]: { ...prev[svc.id], slotsByDate, activeDate: firstDate, expanded: true, saved: false, editing: true, loadingExisting: false },
      }));
    } catch {
      setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], loadingExisting: false } }));
    }
  };

  const saveSlots = async (svc: ServiceInfo) => {
    const state = slotStates[svc.id];
    const dates = Object.keys(state.slotsByDate);
    const hasAnySlot = dates.some(d => state.slotsByDate[d].length > 0);
    if (!dates.length || !hasAnySlot) {
      Alert.alert('Select at least one date and one time slot');
      return;
    }
    setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], saving: true } }));
    try {
      const payload: { date: string; time: string; period: string; available: boolean }[] = [];
      dates.forEach(date => {
        state.slotsByDate[date].forEach(time => {
          payload.push({ date, time, period: getPeriod(time), available: true });
        });
      });
      const method = state.editing ? 'PUT' : 'POST';
      const res = await fetch(`${API_BASE}/api/clinics/departments/${svc.id}/slots/bulk`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save slots');
      setSlotStates(prev => ({
        ...prev,
        [svc.id]: { ...prev[svc.id], saved: true, saving: false, expanded: false, editing: false },
      }));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
      setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], saving: false } }));
    }
  };

  const allSaved = services.every(s => slotStates[s.id]?.saved);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Availability</Text>
      </View>

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
          const state = slotStates[svc.id] ?? { expanded: false, activeDate: null, slotsByDate: {}, saved: false, saving: false, editing: false, loadingExisting: false };
          const selectedDates = Object.keys(state.slotsByDate);
          const activeDate = state.activeDate;
          const activeSlots = activeDate ? (state.slotsByDate[activeDate] ?? []) : [];
          const allSelected = activeDate ? timeSlots.every(t => activeSlots.includes(t)) : false;

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
                  <View style={styles.savedActions}>
                    <Ionicons name="checkmark-circle" size={22} color="#27ae60" />
                    <TouchableOpacity style={styles.editBtn} onPress={() => startEditing(svc)} disabled={state.loadingExisting}>
                      {state.loadingExisting
                        ? <ActivityIndicator size="small" color={ACCENT} />
                        : <Text style={styles.editBtnText}>Edit</Text>
                      }
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.setSlotsBtn} onPress={() => toggleExpand(svc.id)}>
                    <Text style={styles.setSlotsBtnText}>{state.expanded ? 'Collapse' : 'Set Slots'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {state.expanded && !state.saved && (
                <View style={styles.slotConfig}>

                  {/* Date picker row */}
                  <Text style={styles.subLabel}>Select Dates</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
                    {days.map(day => {
                      const isSelected = !!state.slotsByDate[day.value];
                      const isActive = activeDate === day.value;
                      return (
                        <TouchableOpacity
                          key={day.value}
                          style={[styles.dayChip, isSelected && styles.dayChipSelected, isActive && styles.dayChipActive]}
                          onPress={() => selectDate(svc.id, day.value)}
                        >
                          <Text style={[styles.dayChipText, (isSelected || isActive) && { color: '#fff' }]}>{day.label}</Text>
                          {isSelected && state.slotsByDate[day.value].length > 0 && (
                            <Text style={styles.daySlotCount}>{state.slotsByDate[day.value].length}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Active date tab — slots for this date */}
                  {activeDate ? (
                    <View style={styles.datePanel}>
                      <View style={styles.datePanelHeader}>
                        <Text style={styles.datePanelTitle}>
                          {days.find(d => d.value === activeDate)?.label ?? activeDate}
                        </Text>
                        <View style={styles.datePanelActions}>
                          <TouchableOpacity
                            style={styles.selectAllBtn}
                            onPress={() => allSelected ? deselectAllForDate(svc.id, activeDate) : selectAllForDate(svc.id, activeDate)}
                          >
                            <Text style={styles.selectAllBtnText}>{allSelected ? 'Deselect All' : 'Select All Day'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeDate(svc.id, activeDate)} style={styles.removeDateBtn}>
                            <Ionicons name="close-circle" size={18} color="#e57373" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.timeGrid}>
                        {timeSlots.map(t => {
                          const sel = activeSlots.includes(t);
                          return (
                            <TouchableOpacity
                              key={t}
                              style={[styles.timeChip, sel && styles.timeChipSelected]}
                              onPress={() => toggleTime(svc.id, activeDate, t)}
                            >
                              <Text style={[styles.timeChipText, sel && { color: '#fff' }]}>{t}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.hintText}>Tap a date above to configure its slots</Text>
                  )}

                  <TouchableOpacity style={styles.saveBtn} onPress={() => saveSlots(svc)} disabled={state.saving}>
                    {state.saving
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.saveBtnText}>{state.editing ? 'Update Slots' : `Save Slots for ${svc.name}`}</Text>
                    }
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
          onPress={async () => {
          await AsyncStorage.multiSet([
            ['vendor_store_id', storeId ?? ''],
            ['vendor_store_name', storeName ?? ''],
          ]);
          router.push((`/vendor/success?storeId=${storeId}&storeName=${encodeURIComponent(storeName ?? '')}`) as any);
        }}
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
  setSlotsBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  setSlotsBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  savedActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editBtn: { borderWidth: 1.5, borderColor: ACCENT, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { color: ACCENT, fontWeight: '600', fontSize: 13 },
  slotConfig: { marginTop: 14 },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  daysScroll: { marginBottom: 12 },
  dayChip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
    backgroundColor: '#fff', alignItems: 'center',
  },
  dayChipSelected: { backgroundColor: '#9c4dcc', borderColor: '#9c4dcc' },
  dayChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  dayChipText: { fontSize: 12, fontWeight: '600', color: '#555' },
  daySlotCount: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  datePanel: {
    backgroundColor: '#f8f4fc', borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  datePanelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  datePanelTitle: { fontSize: 14, fontWeight: '700', color: ACCENT },
  datePanelActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectAllBtn: { backgroundColor: '#ede7f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  selectAllBtnText: { fontSize: 11, fontWeight: '700', color: ACCENT },
  removeDateBtn: { padding: 2 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: '#fff', width: '30%', alignItems: 'center',
  },
  timeChipSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  timeChipText: { fontSize: 12, fontWeight: '600', color: '#555' },
  hintText: { fontSize: 13, color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 16 },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
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
