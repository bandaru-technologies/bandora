import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

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

interface Department {
  id: number;
  name: string;
  doctorName: string;
  consultationFee: number;
}

interface SlotState {
  expanded: boolean;
  activeDate: string | null;
  slotsByDate: Record<string, string[]>;
  saving: boolean;
}

export default function ManageStoreScreen() {
  const router = useRouter();
  const { storeId, storeName } = useLocalSearchParams<{ storeId: string; storeName: string }>();
  const name = storeName ? decodeURIComponent(storeName) : 'Your Store';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [slotStates, setSlotStates] = useState<Record<number, SlotState>>({});

  const days = useMemo(() => generateNext14Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/clinics/${storeId}/departments`);
      const data: Department[] = await res.json();
      setDepartments(data);
      // Load existing slots for each department
      await Promise.all(data.map(dept => loadSlots(dept.id)));
    } catch {
      Alert.alert('Error', 'Could not load store services');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (deptId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/clinics/departments/${deptId}/slots`);
      const data: { date: string; time: string }[] = await res.json();
      const slotsByDate: Record<string, string[]> = {};
      data.forEach(s => {
        if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
        slotsByDate[s.date].push(s.time);
      });
      const firstDate = Object.keys(slotsByDate)[0] ?? null;
      setSlotStates(prev => ({
        ...prev,
        [deptId]: { expanded: false, activeDate: firstDate, slotsByDate, saving: false },
      }));
    } catch {
      setSlotStates(prev => ({
        ...prev,
        [deptId]: { expanded: false, activeDate: null, slotsByDate: {}, saving: false },
      }));
    }
  };

  const selectDate = (id: number, date: string) => {
    setSlotStates(prev => {
      const cur = prev[id]?.slotsByDate ?? {};
      if (!cur[date]) {
        return { ...prev, [id]: { ...prev[id], activeDate: date, slotsByDate: { ...cur, [date]: [] } } };
      }
      return { ...prev, [id]: { ...prev[id], activeDate: date } };
    });
  };

  const removeDate = (id: number, date: string) => {
    setSlotStates(prev => {
      const { [date]: _, ...rest } = prev[id].slotsByDate;
      const remaining = Object.keys(rest);
      const newActive = prev[id].activeDate === date ? (remaining[remaining.length - 1] ?? null) : prev[id].activeDate;
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

  const saveSlots = async (dept: Department) => {
    const state = slotStates[dept.id];
    const dates = Object.keys(state?.slotsByDate ?? {});
    const hasAnySlot = dates.some(d => state.slotsByDate[d].length > 0);
    if (!dates.length || !hasAnySlot) {
      Alert.alert('Select at least one date and one time slot');
      return;
    }
    setSlotStates(prev => ({ ...prev, [dept.id]: { ...prev[dept.id], saving: true } }));
    try {
      const payload: { date: string; time: string; period: string; available: boolean }[] = [];
      dates.forEach(date => {
        state.slotsByDate[date].forEach(time => {
          payload.push({ date, time, period: getPeriod(time), available: true });
        });
      });
      const res = await fetch(`${API_BASE}/api/clinics/departments/${dept.id}/slots/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update slots');
      setSlotStates(prev => ({ ...prev, [dept.id]: { ...prev[dept.id], saving: false, expanded: false } }));
      Alert.alert('Done', `Slots updated for ${dept.name}`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
      setSlotStates(prev => ({ ...prev, [dept.id]: { ...prev[dept.id], saving: false } }));
    }
  };

  const handleDeleteStore = () => {
    Alert.alert(
      'Delete Store',
      `Are you sure you want to permanently delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const res = await fetch(`${API_BASE}/api/stores/${storeId}`, { method: 'DELETE' });
              if (!res.ok) throw new Error('Failed to delete store');
              router.replace('/(tabs)' as any);
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Something went wrong');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Loading store...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
          <Text style={styles.headerSub}>Manage your store</Text>
        </View>
        <TouchableOpacity onPress={handleDeleteStore} disabled={deleting} style={styles.deleteBtn}>
          {deleting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="trash-outline" size={18} color="#fff" />
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Services & Slots</Text>
        <Text style={styles.sectionHint}>Tap a service to adjust its availability slots</Text>

        {departments.length === 0 && (
          <Text style={styles.emptyText}>No services found for this store.</Text>
        )}

        {departments.map(dept => {
          const state = slotStates[dept.id] ?? { expanded: false, activeDate: null, slotsByDate: {}, saving: false };
          const selectedDates = Object.keys(state.slotsByDate);
          const activeDate = state.activeDate;
          const activeSlots = activeDate ? (state.slotsByDate[activeDate] ?? []) : [];
          const allSelected = activeDate ? timeSlots.every(t => activeSlots.includes(t)) : false;
          const totalSlots = selectedDates.reduce((acc, d) => acc + state.slotsByDate[d].length, 0);

          return (
            <View key={dept.id} style={styles.serviceCard}>
              <TouchableOpacity
                style={styles.cardTop}
                onPress={() => setSlotStates(prev => ({ ...prev, [dept.id]: { ...prev[dept.id], expanded: !prev[dept.id].expanded } }))}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{dept.name}</Text>
                  <Text style={styles.serviceMeta}>
                    {dept.doctorName || 'Staff'} · ₹{dept.consultationFee}
                    {totalSlots > 0 ? ` · ${totalSlots} slots across ${selectedDates.length} day${selectedDates.length > 1 ? 's' : ''}` : ' · No slots set'}
                  </Text>
                </View>
                <Ionicons
                  name={state.expanded ? 'chevron-up' : 'chevron-down'}
                  size={20} color="#888"
                />
              </TouchableOpacity>

              {state.expanded && (
                <View style={styles.slotConfig}>
                  {/* Date tabs */}
                  <Text style={styles.subLabel}>Select Dates</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
                    {days.map(day => {
                      const isSelected = !!state.slotsByDate[day.value];
                      const isActive = activeDate === day.value;
                      return (
                        <TouchableOpacity
                          key={day.value}
                          style={[styles.dayChip, isSelected && styles.dayChipSelected, isActive && styles.dayChipActive]}
                          onPress={() => selectDate(dept.id, day.value)}
                        >
                          <Text style={[styles.dayChipText, (isSelected || isActive) && { color: '#fff' }]}>{day.label}</Text>
                          {isSelected && state.slotsByDate[day.value].length > 0 && (
                            <Text style={styles.daySlotCount}>{state.slotsByDate[day.value].length}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Active date slot panel */}
                  {activeDate ? (
                    <View style={styles.datePanel}>
                      <View style={styles.datePanelHeader}>
                        <Text style={styles.datePanelTitle}>
                          {days.find(d => d.value === activeDate)?.label ?? activeDate}
                        </Text>
                        <View style={styles.datePanelActions}>
                          <TouchableOpacity
                            style={styles.selectAllBtn}
                            onPress={() => allSelected ? deselectAllForDate(dept.id, activeDate) : selectAllForDate(dept.id, activeDate)}
                          >
                            <Text style={styles.selectAllBtnText}>{allSelected ? 'Deselect All' : 'Select All Day'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeDate(dept.id, activeDate)} style={styles.removeDateBtn}>
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
                              onPress={() => toggleTime(dept.id, activeDate, t)}
                            >
                              <Text style={[styles.timeChipText, sel && { color: '#fff' }]}>{t}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.hintText}>Tap a date to configure its slots</Text>
                  )}

                  <TouchableOpacity style={styles.saveBtn} onPress={() => saveSlots(dept)} disabled={state.saving}>
                    {state.saving
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.saveBtnText}>Update Slots for {dept.name}</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Delete store */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteBtnLarge} onPress={handleDeleteStore} disabled={deleting}>
            {deleting
              ? <ActivityIndicator color="#C62828" />
              : <>
                  <Ionicons name="trash-outline" size={18} color="#C62828" />
                  <Text style={styles.deleteBtnText}>Delete This Store</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 1 },
  deleteBtn: {
    backgroundColor: '#C62828', borderRadius: 8,
    padding: 8, alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  sectionHint: { fontSize: 12, color: '#888', marginBottom: 14 },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 32 },
  serviceCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#e0e0e0',
    marginBottom: 12, overflow: 'hidden',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  serviceMeta: { fontSize: 12, color: '#888', marginTop: 3 },
  slotConfig: { paddingHorizontal: 14, paddingBottom: 14 },
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
  datePanel: { backgroundColor: '#f8f4fc', borderRadius: 12, padding: 12, marginBottom: 12 },
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
  hintText: { fontSize: 13, color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 12 },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dangerZone: {
    marginTop: 24, borderWidth: 1.5, borderColor: '#ffcdd2',
    borderRadius: 14, padding: 16, backgroundColor: '#fff8f8',
  },
  dangerTitle: { fontSize: 13, fontWeight: '700', color: '#C62828', marginBottom: 12 },
  deleteBtnLarge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#C62828', borderRadius: 10,
    paddingVertical: 13,
  },
  deleteBtnText: { color: '#C62828', fontWeight: '700', fontSize: 14 },
});
