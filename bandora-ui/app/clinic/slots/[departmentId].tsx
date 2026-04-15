import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';
import { useAppointments } from '@/context/AppointmentsContext';
import { useAuth } from '@/context/AuthContext';

type Slot = {
  id: number;
  date: string;
  time: string;
  period: string;
  available: boolean;
};

const PERIODS = ['Morning', 'Afternoon', 'Evening'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Returns true if this slot is in the future relative to now
function isSlotFuture(date: string, time: string): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (date < today) return false;
  if (date > today) return true;
  // Same day — compare time
  const [timePart, meridiem] = time.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  const slotTime = new Date();
  slotTime.setHours(h, m, 0, 0);
  return slotTime > now;
}

export default function SlotsScreen() {
  const { departmentId, deptName, storeName, doctorName, fee } = useLocalSearchParams<{
    departmentId: string;
    deptName: string;
    storeName: string;
    doctorName: string;
    fee: string;
  }>();
  const router = useRouter();
  const { addAppointment } = useAppointments();
  const { user } = useAuth();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Morning');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState(false);

  // Only future slots
  const futureSlots = slots.filter(s => isSlotFuture(s.date, s.time));

  // Unique future dates
  const dates = [...new Set(futureSlots.map(s => s.date))].sort();

  useEffect(() => {
    fetch(`${API_BASE}/api/clinics/departments/${departmentId}/slots`)
      .then(r => r.json())
      .then((data: Slot[]) => {
        setSlots(data);
        // Default to first future date
        const futureDates = [...new Set(data.filter(s => isSlotFuture(s.date, s.time)).map(s => s.date))].sort();
        if (futureDates.length > 0) setSelectedDate(futureDates[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [departmentId]);

  const filteredSlots = futureSlots.filter(
    s => s.date === selectedDate && s.period === selectedPeriod
  );

  const periodsWithSlots = PERIODS.filter(p =>
    futureSlots.some(s => s.date === selectedDate && s.period === p)
  );

  // Auto-select first period that has slots when date changes
  useEffect(() => {
    if (!periodsWithSlots.includes(selectedPeriod) && periodsWithSlots.length > 0) {
      setSelectedPeriod(periodsWithSlots[0]);
    }
  }, [selectedDate]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const res = await fetch(`${API_BASE}/api/clinics/slots/${selectedSlot.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email ?? '' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSlots(prev => prev.map(s => s.id === selectedSlot.id ? { ...s, available: false } : s));
        await addAppointment({
          slotId: selectedSlot.id,
          deptName,
          doctorName,
          storeName,
          date: selectedSlot.date,
          time: selectedSlot.time,
          fee: parseFloat(fee),
        });
        setSelectedSlot(null);
        router.replace({
          pathname: '/booking-confirmed' as any,
          params: { deptName, doctorName, storeName, date: selectedSlot.date, time: selectedSlot.time, fee },
        });
      } else {
        Alert.alert('Booking Failed', data.message || 'This slot is no longer available. Please choose another.');
        setSlots(prev => prev.map(s => s.id === selectedSlot.id ? { ...s, available: false } : s));
        setSelectedSlot(null);
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{deptName}</Text>
          <Text style={styles.headerSub}>{storeName}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#006491" />
          <Text style={styles.loadingText}>Loading slots...</Text>
        </View>
      ) : dates.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={56} color="#ccc" />
          <Text style={styles.emptyText}>No upcoming slots available</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Doctor info card */}
          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Ionicons name="person" size={28} color="#006491" />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctorName}</Text>
              <Text style={styles.deptLabel}>{deptName}</Text>
            </View>
            <View style={styles.feeChip}>
              <Text style={styles.feeLabel}>Fee</Text>
              <Text style={styles.feeAmount}>₹{parseFloat(fee).toFixed(0)}</Text>
            </View>
          </View>

          {/* Date selector */}
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
            {dates.map(date => (
              <TouchableOpacity
                key={date}
                style={[styles.dateChip, selectedDate === date && styles.dateChipActive]}
                onPress={() => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                  setSelectedPeriod('Morning');
                }}
              >
                <Text style={[styles.dateChipText, selectedDate === date && styles.dateChipTextActive]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Period tabs */}
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.periodRow}>
            {periodsWithSlots.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, selectedPeriod === p && styles.periodTabActive]}
                onPress={() => { setSelectedPeriod(p); setSelectedSlot(null); }}
              >
                <Ionicons
                  name={p === 'Morning' ? 'sunny-outline' : p === 'Afternoon' ? 'partly-sunny-outline' : 'moon-outline'}
                  size={14}
                  color={selectedPeriod === p ? '#fff' : '#666'}
                />
                <Text style={[styles.periodTabText, selectedPeriod === p && styles.periodTabTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Slots grid */}
          <View style={styles.slotsGrid}>
            {filteredSlots.length === 0 ? (
              <Text style={styles.noSlotsText}>No slots for this period</Text>
            ) : (
              filteredSlots.map(slot => (
                <TouchableOpacity
                  key={slot.id}
                  disabled={!slot.available}
                  style={[
                    styles.slotChip,
                    !slot.available && styles.slotChipBooked,
                    selectedSlot?.id === slot.id && styles.slotChipSelected,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[
                    styles.slotChipText,
                    !slot.available && styles.slotChipTextBooked,
                    selectedSlot?.id === slot.id && styles.slotChipTextSelected,
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E3F2FD' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#006491' }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Confirm button */}
      {selectedSlot && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerDate}>{formatDate(selectedSlot.date)}</Text>
            <Text style={styles.footerTime}>{selectedSlot.time}</Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={booking}>
            {booking
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#006491', paddingHorizontal: 16, paddingVertical: 14,
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  emptyText: { color: '#aaa', fontSize: 15 },
  content: { padding: 16, gap: 4, paddingBottom: 100 },
  doctorCard: {
    backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', padding: 14, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  doctorAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  deptLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  feeChip: { alignItems: 'center' },
  feeLabel: { fontSize: 10, color: '#888' },
  feeAmount: { fontSize: 16, fontWeight: '800', color: '#006491' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 10, marginTop: 4 },
  dateRow: { marginBottom: 20 },
  dateChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#fff', marginRight: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  dateChipActive: { backgroundColor: '#006491' },
  dateChipText: { fontSize: 13, fontWeight: '600', color: '#444' },
  dateChipTextActive: { color: '#fff' },
  periodRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  periodTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  periodTabActive: { backgroundColor: '#006491' },
  periodTabText: { fontSize: 12, fontWeight: '600', color: '#666' },
  periodTabTextActive: { color: '#fff' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  slotChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  slotChipBooked: { backgroundColor: '#f5f5f5' },
  slotChipSelected: { backgroundColor: '#006491' },
  slotChipText: { fontSize: 13, fontWeight: '600', color: '#1565C0' },
  slotChipTextBooked: { color: '#ccc' },
  slotChipTextSelected: { color: '#fff' },
  noSlotsText: { color: '#aaa', fontSize: 14, paddingVertical: 12 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#888' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#eee',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 4,
  },
  footerInfo: { flex: 1 },
  footerDate: { fontSize: 12, color: '#888' },
  footerTime: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  confirmBtn: {
    backgroundColor: '#006491', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 10,
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
