import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BookingConfirmedScreen() {
  const { deptName, doctorName, storeName, date, time, fee } = useLocalSearchParams<{
    deptName: string;
    doctorName: string;
    storeName: string;
    date: string;
    time: string;
    fee: string;
  }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your appointment has been successfully booked</Text>

        {/* Appointment details card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="medical-outline" size={18} color="#006491" />
            <View style={styles.cardTextBlock}>
              <Text style={styles.cardLabel}>Service</Text>
              <Text style={styles.cardValue}>{deptName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={18} color="#006491" />
            <View style={styles.cardTextBlock}>
              <Text style={styles.cardLabel}>Doctor / Stylist</Text>
              <Text style={styles.cardValue}>{doctorName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Ionicons name="storefront-outline" size={18} color="#006491" />
            <View style={styles.cardTextBlock}>
              <Text style={styles.cardLabel}>Location</Text>
              <Text style={styles.cardValue}>{storeName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={18} color="#006491" />
            <View style={styles.cardTextBlock}>
              <Text style={styles.cardLabel}>Date &amp; Time</Text>
              <Text style={styles.cardValue}>{formatDate(date)}</Text>
              <Text style={styles.cardValueSub}>{time}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Ionicons name="cash-outline" size={18} color="#006491" />
            <View style={styles.cardTextBlock}>
              <Text style={styles.cardLabel}>Fee</Text>
              <Text style={styles.cardValue}>₹{parseFloat(fee).toFixed(0)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/appointments' as any)}
        >
          <Ionicons name="calendar-outline" size={18} color="#006491" />
          <Text style={styles.btnSecondaryText}>View Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.btnPrimaryText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 48 },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#2E7D32',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%',
    paddingHorizontal: 20, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14 },
  cardTextBlock: { flex: 1 },
  cardLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  cardValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  cardValueSub: { fontSize: 13, color: '#006491', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  actions: {
    paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16, gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#006491', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: '#006491',
    borderRadius: 12, paddingVertical: 14,
  },
  btnSecondaryText: { color: '#006491', fontWeight: '700', fontSize: 15 },
});
