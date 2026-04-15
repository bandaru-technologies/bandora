import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const ACCENT = '#6A1B9A';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_CHIPS: Record<string, string[]> = {
  Salon:          ['Haircut', 'Hair Color', 'Facial', 'Manicure', 'Pedicure', 'Bridal Makeup', 'Head Spa', 'Massage'],
  'Doctor/Clinic':['General Consultation', 'Follow-up Visit', 'Blood Test', 'ECG', 'X-Ray', 'Vaccination'],
  Pharmacy:       ['Prescription Pickup', 'OTC Medicines', 'Blood Pressure Test', 'Blood Sugar Test'],
  Electronics:    ['Mobile Repair', 'Laptop Repair', 'Screen Replacement', 'Battery Replacement'],
};

const STAFF_LABEL: Record<string, string> = {
  Salon: 'Stylist Name', 'Doctor/Clinic': 'Doctor Name',
  Pharmacy: 'Pharmacist Name', Electronics: 'Technician Name',
};

interface Service {
  id: number;
  name: string;
  description: string;
  doctorName: string;
  consultationFee: number;
}

interface SlotState {
  expanded: boolean;
  activeDate: string | null;
  slotsByDate: Record<string, string[]>;
  saving: boolean;
  loading: boolean;
  totalSlots: number;
  totalDays: number;
}

function generateNext14Days() {
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

function generateTimeSlots() {
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

function isTimeFuture(date: string, time: string): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (date > today) return true;
  if (date < today) return false;
  const [timePart, meridiem] = time.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  const slotTime = new Date();
  slotTime.setHours(h, m, 0, 0);
  return slotTime > now;
}

export default function ManageSlotsScreen() {
  const router = useRouter();
  const { storeId, storeName, category } = useLocalSearchParams<{
    storeId: string; storeName: string; category: string;
  }>();

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [slotStates, setSlotStates] = useState<Record<number, SlotState>>({});

  // Add service form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStaff, setNewStaff] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [addingService, setAddingService] = useState(false);

  const days = useMemo(() => generateNext14Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const chips = CATEGORY_CHIPS[category ?? ''] ?? CATEGORY_CHIPS['Salon'];
  const staffLabel = STAFF_LABEL[category ?? ''] ?? 'Staff Name';

  useEffect(() => {
    fetchServices();
  }, [storeId]);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await fetch(`${API_BASE}/api/clinics/${storeId}/departments`);
      const data: Service[] = await res.json();
      setServices(data);
      // Load existing slots for each service
      const states: Record<number, SlotState> = {};
      await Promise.all(data.map(async (svc) => {
        try {
          const slotRes = await fetch(`${API_BASE}/api/clinics/departments/${svc.id}/slots`);
          const slotData: { date: string; time: string }[] = await slotRes.json();
          const slotsByDate: Record<string, string[]> = {};
          slotData.forEach(s => {
            if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
            slotsByDate[s.date].push(s.time);
          });
          const totalSlots = slotData.length;
          const totalDays = Object.keys(slotsByDate).length;
          states[svc.id] = {
            expanded: false, activeDate: null,
            slotsByDate, saving: false, loading: false,
            totalSlots, totalDays,
          };
        } catch {
          states[svc.id] = {
            expanded: false, activeDate: null,
            slotsByDate: {}, saving: false, loading: false,
            totalSlots: 0, totalDays: 0,
          };
        }
      }));
      setSlotStates(states);
    } catch {
      Alert.alert('Error', 'Could not load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const toggleExpand = (id: number) => {
    setSlotStates(prev => {
      const cur = prev[id];
      const firstDate = Object.keys(cur.slotsByDate)[0] ?? null;
      return {
        ...prev,
        [id]: { ...cur, expanded: !cur.expanded, activeDate: cur.activeDate ?? firstDate },
      };
    });
  };

  const selectDate = (id: number, date: string) => {
    setSlotStates(prev => {
      const cur = prev[id].slotsByDate;
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
      const newActive = prev[id].activeDate === date ? (remaining[0] ?? null) : prev[id].activeDate;
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

  const selectAllDay = (id: number, date: string, visibleSlots: string[]) => {
    setSlotStates(prev => {
      const cur = prev[id].slotsByDate[date] ?? [];
      const allSelected = visibleSlots.every(t => cur.includes(t));
      return {
        ...prev,
        [id]: { ...prev[id], slotsByDate: { ...prev[id].slotsByDate, [date]: allSelected ? [] : [...visibleSlots] } },
      };
    });
  };

  const saveSlots = async (svc: Service) => {
    const state = slotStates[svc.id];
    const dates = Object.keys(state.slotsByDate);
    const hasAny = dates.some(d => state.slotsByDate[d].length > 0);
    if (!hasAny) { Alert.alert('Select at least one time slot'); return; }

    setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], saving: true } }));
    try {
      const payload: { date: string; time: string; period: string; available: boolean }[] = [];
      dates.forEach(date => {
        state.slotsByDate[date].forEach(time => {
          const h = parseInt(time.split(':')[0]);
          const pm = time.includes('PM');
          const h24 = pm ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
          const period = h24 < 12 ? 'Morning' : h24 < 17 ? 'Afternoon' : 'Evening';
          payload.push({ date, time, period, available: true });
        });
      });
      const res = await fetch(`${API_BASE}/api/clinics/departments/${svc.id}/slots/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update slots');
      const totalSlots = payload.length;
      const totalDays = dates.filter(d => state.slotsByDate[d].length > 0).length;
      setSlotStates(prev => ({
        ...prev,
        [svc.id]: { ...prev[svc.id], saving: false, expanded: false, totalSlots, totalDays },
      }));
      Alert.alert('Updated', `Slots updated for ${svc.name}`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
      setSlotStates(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], saving: false } }));
    }
  };

  const addService = async (name: string, desc = '', staff = '', price = '') => {
    if (!name.trim()) { Alert.alert('Enter a service name'); return; }
    setAddingService(true);
    try {
      const res = await fetch(`${API_BASE}/api/clinics/${storeId}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), description: desc, doctorName: staff,
          consultationFee: price ? parseFloat(price) : 0, icon: '',
        }),
      });
      if (!res.ok) throw new Error('Failed to add service');
      const data: Service = await res.json();
      setServices(prev => [...prev, data]);
      setSlotStates(prev => ({
        ...prev,
        [data.id]: { expanded: false, activeDate: null, slotsByDate: {}, saving: false, loading: false, totalSlots: 0, totalDays: 0 },
      }));
      setShowAddForm(false);
      setNewName(''); setNewDesc(''); setNewStaff(''); setNewPrice('');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not add service');
    } finally {
      setAddingService(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Services & Slots</Text>
          <Text style={styles.headerSub}>Tap a service to adjust its availability</Text>
        </View>
      </View>

      {loadingServices ? (
        <View style={styles.center}>
          <ActivityIndicator color={ACCENT} size="large" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Existing services */}
          {services.map(svc => {
            const state = slotStates[svc.id];
            if (!state) return null;
            const activeDate = state.activeDate;
            const activeSlots = activeDate ? (state.slotsByDate[activeDate] ?? []) : [];
            const visibleSlots = activeDate ? timeSlots.filter(t => isTimeFuture(activeDate, t)) : timeSlots;
            const allSelected = activeDate ? visibleSlots.every(t => activeSlots.includes(t)) : false;

            return (
              <View key={svc.id} style={styles.serviceCard}>
                {/* Card header */}
                <TouchableOpacity style={styles.cardTop} onPress={() => toggleExpand(svc.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{svc.name}</Text>
                    <Text style={styles.serviceMeta}>
                      {svc.doctorName ? `${svc.doctorName} · ` : ''}
                      {svc.consultationFee > 0 ? `₹${svc.consultationFee.toFixed(0)} · ` : ''}
                      {state.totalSlots > 0
                        ? `${state.totalSlots} slots across ${state.totalDays} day${state.totalDays > 1 ? 's' : ''}`
                        : 'No slots set'}
                    </Text>
                  </View>
                  <Ionicons
                    name={state.expanded ? 'chevron-up' : 'chevron-down'}
                    size={20} color="#888"
                  />
                </TouchableOpacity>

                {/* Slot editor */}
                {state.expanded && (
                  <View style={styles.slotEditor}>
                    <Text style={styles.subLabel}>Select Dates</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
                      {days.map(day => {
                        const isSelected = !!state.slotsByDate[day.value];
                        const isActive = activeDate === day.value;
                        const count = state.slotsByDate[day.value]?.length ?? 0;
                        return (
                          <TouchableOpacity
                            key={day.value}
                            style={[styles.dayChip, isSelected && styles.dayChipSelected, isActive && styles.dayChipActive]}
                            onPress={() => selectDate(svc.id, day.value)}
                          >
                            <Text style={[styles.dayChipText, (isSelected || isActive) && { color: '#fff' }]}>
                              {day.label}
                            </Text>
                            {isSelected && count > 0 && (
                              <Text style={styles.daySlotCount}>{count}</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {activeDate ? (
                      <View style={styles.datePanel}>
                        <View style={styles.datePanelHeader}>
                          <Text style={styles.datePanelTitle}>
                            {days.find(d => d.value === activeDate)?.label ?? activeDate}
                          </Text>
                          <View style={styles.datePanelActions}>
                            <TouchableOpacity
                              style={styles.selectAllBtn}
                              onPress={() => selectAllDay(svc.id, activeDate, visibleSlots)}
                            >
                              <Text style={styles.selectAllBtnText}>
                                {allSelected ? 'Deselect All' : 'Select All Day'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeDate(svc.id, activeDate)}>
                              <Ionicons name="close-circle" size={20} color="#e57373" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.timeGrid}>
                          {visibleSlots.map(t => {
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
                      <Text style={styles.hint}>Tap a date above to set time slots</Text>
                    )}

                    <TouchableOpacity
                      style={[styles.updateBtn, state.saving && { opacity: 0.6 }]}
                      onPress={() => saveSlots(svc)}
                      disabled={state.saving}
                    >
                      {state.saving
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.updateBtnText}>Update Slots for {svc.name}</Text>
                      }
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {/* Add service section */}
          <Text style={styles.sectionTitle}>
            {services.length === 0 ? 'Add Your First Service' : 'Add Another Service'}
          </Text>

          {/* Quick chips */}
          <View style={styles.chipsWrap}>
            {chips.filter(c => !services.find(s => s.name === c)).map(chip => (
              <TouchableOpacity
                key={chip}
                style={styles.chip}
                onPress={() => addService(chip)}
                disabled={addingService}
              >
                <Ionicons name="add" size={14} color={ACCENT} />
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom form toggle */}
          {!showAddForm ? (
            <TouchableOpacity style={styles.addCustomBtn} onPress={() => setShowAddForm(true)}>
              <Ionicons name="add-circle-outline" size={20} color={ACCENT} />
              <Text style={styles.addCustomText}>Add Custom Service</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addForm}>
              <Text style={styles.addFormTitle}>New Service</Text>
              <TextInput style={styles.input} placeholder="Service name *" placeholderTextColor="#aaa" value={newName} onChangeText={setNewName} />
              <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#aaa" value={newDesc} onChangeText={setNewDesc} />
              <TextInput style={styles.input} placeholder={staffLabel} placeholderTextColor="#aaa" value={newStaff} onChangeText={setNewStaff} />
              <TextInput style={styles.input} placeholder="Price ₹" placeholderTextColor="#aaa" value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" />
              <View style={styles.addFormBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveServiceBtn, addingService && { opacity: 0.6 }]}
                  onPress={() => addService(newName, newDesc, newStaff, newPrice)}
                  disabled={addingService}
                >
                  {addingService
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.saveServiceBtnText}>Save Service</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  serviceCard: {
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  serviceName: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  serviceMeta: { fontSize: 12, color: '#888', marginTop: 3 },
  slotEditor: { paddingHorizontal: 16, paddingBottom: 16 },
  subLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 10 },
  daysScroll: { marginBottom: 12 },
  dayChip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 24,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    backgroundColor: '#fff', alignItems: 'center', minWidth: 64,
  },
  dayChipSelected: { backgroundColor: '#9c4dcc', borderColor: '#9c4dcc' },
  dayChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  dayChipText: { fontSize: 12, fontWeight: '700', color: '#555' },
  daySlotCount: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  datePanel: { backgroundColor: '#f8f4fc', borderRadius: 14, padding: 14, marginBottom: 12 },
  datePanelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  datePanelTitle: { fontSize: 15, fontWeight: '800', color: ACCENT },
  datePanelActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectAllBtn: { backgroundColor: '#ede7f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  selectAllBtnText: { fontSize: 11, fontWeight: '700', color: ACCENT },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: '#fff', width: '30%', alignItems: 'center',
  },
  timeChipSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  timeChipText: { fontSize: 12, fontWeight: '600', color: '#555' },
  hint: { fontSize: 13, color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 16 },
  updateBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  updateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginTop: 8 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  addCustomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: ACCENT, borderStyle: 'dashed',
  },
  addCustomText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  addForm: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    gap: 10,
  },
  addFormTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa',
  },
  addFormBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#666' },
  saveServiceBtn: {
    flex: 2, backgroundColor: ACCENT, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  saveServiceBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
