import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function QuestionSentScreen() {
  const { storeName } = useLocalSearchParams<{ storeName: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </View>
        <Text style={styles.title}>Question Sent!</Text>
        <Text style={styles.subtitle}>
          Your question has been sent to{'\n'}
          <Text style={styles.storeName}>{storeName}</Text>
        </Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={20} color="#C62828" />
            <Text style={styles.cardText}>Vendor typically responds within a few hours</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="call-outline" size={20} color="#C62828" />
            <Text style={styles.cardText}>They may call or WhatsApp you directly</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#C62828" />
            <Text style={styles.cardText}>Your contact details are shared securely</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()}>
          <Text style={styles.btnSecondaryText}>Ask Another Question</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnPrimaryText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 60 },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#C62828',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#C62828', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  storeName: { fontWeight: '700', color: '#1a1a1a' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%',
    padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },
  actions: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16, gap: 12 },
  btnPrimary: {
    backgroundColor: '#C62828', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    borderWidth: 1.5, borderColor: '#C62828',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  btnSecondaryText: { color: '#C62828', fontWeight: '700', fontSize: 15 },
});
