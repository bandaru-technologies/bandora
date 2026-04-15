import {
  View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppointments, Appointment } from '@/context/AppointmentsContext';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function isPast(date: string, time: string) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (date < today) return true;
  if (date > today) return false;
  const [timePart, meridiem] = time.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  const slotTime = new Date(); slotTime.setHours(h, m, 0, 0);
  return slotTime <= now;
}

export default function AppointmentsScreen() {
  const { appointments, loading, cancelAppointment, refreshAppointments } = useAppointments();
  const router = useRouter();

  useFocusEffect(useCallback(() => {
    refreshAppointments();
  }, [refreshAppointments]));

  const upcoming = appointments.filter(a => !isPast(a.date, a.time));
  const past = appointments.filter(a => isPast(a.date, a.time));

  const handleCancel = (item: Appointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Cancel ${item.deptName} with ${item.doctorName} on ${formatDate(item.date)} at ${item.time}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelAppointment(item.id);
          },
        },
      ]
    );
  };

  const renderUpcomingCard = (item: Appointment) => (
    <View style={styles.card} key={item.id}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Ionicons name="calendar" size={22} color="#006491" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.deptName}>{item.deptName}</Text>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.storeName}>{item.storeName}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={12} color="#006491" />
            <Text style={styles.timeText}>{formatDate(item.date)} · {item.time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.feeAmount}>₹{item.fee.toFixed(0)}</Text>
        <View style={styles.badgeUpcoming}>
          <Text style={styles.statusUpcoming}>Upcoming</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item)}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPastCard = (item: Appointment) => (
    <View style={[styles.card, styles.cardDimmed]} key={item.id}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconBox, styles.iconBoxDimmed]}>
          <Ionicons name="calendar" size={22} color="#aaa" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.deptName, styles.dimText]}>{item.deptName}</Text>
          <Text style={[styles.doctorName, styles.dimText]}>{item.doctorName}</Text>
          <Text style={styles.storeName}>{item.storeName}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={12} color="#bbb" />
            <Text style={[styles.timeText, styles.dimText]}>{formatDate(item.date)} · {item.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.feeAmount, styles.dimText]}>₹{item.fee.toFixed(0)}</Text>
        <View style={styles.badgePast}>
          <Text style={styles.statusPast}>Past</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#006491" />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptySub}>Book a clinic or salon appointment to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {upcoming.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Upcoming</Text>
                  {upcoming.map(renderUpcomingCard)}
                </>
              )}
              {past.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Past</Text>
                  {past.map(renderPastCard)}
                </>
              )}
            </>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#006491', paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  cardDimmed: { opacity: 0.75 },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  iconBox: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center',
  },
  iconBoxDimmed: { backgroundColor: '#f0f0f0' },
  cardInfo: { flex: 1 },
  deptName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  doctorName: { fontSize: 13, color: '#555', marginTop: 2 },
  storeName: { fontSize: 12, color: '#888', marginTop: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  timeText: { fontSize: 12, color: '#006491', fontWeight: '600' },
  rightCol: { alignItems: 'flex-end', gap: 6, minWidth: 72 },
  feeAmount: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  badgeUpcoming: {
    backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgePast: {
    backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusUpcoming: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  statusPast: { fontSize: 11, fontWeight: '700', color: '#aaa' },
  cancelBtn: {
    borderWidth: 1.5, borderColor: '#c0392b', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 2,
  },
  cancelBtnText: { fontSize: 12, fontWeight: '700', color: '#c0392b' },
  dimText: { color: '#aaa' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center' },
});
