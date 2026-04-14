import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ACCENT = '#6A1B9A';

const INFO_CARDS = [
  { icon: 'search' as const, title: 'Customers can find you', sub: 'Your store is live on the LocalVibe marketplace' },
  { icon: 'calendar-outline' as const, title: 'Manage bookings anytime', sub: 'Track all your appointments in one place' },
  { icon: 'notifications-outline' as const, title: 'Get notified on every booking', sub: 'Instant alerts for new appointments' },
];

export default function SuccessScreen() {
  const router = useRouter();
  const { storeName, vendorEmail } = useLocalSearchParams<{ storeName: string; vendorEmail: string }>();
  const name = storeName ? decodeURIComponent(storeName) : 'Your store';
  const email = vendorEmail ? decodeURIComponent(vendorEmail) : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Store Listed!</Text>
        <Text style={styles.heroSub}>{name} has been added to LocalVibe</Text>
      </View>

      {email ? (
        <View style={styles.vendorCard}>
          <Ionicons name="person-circle-outline" size={24} color={ACCENT} />
          <View style={{ flex: 1 }}>
            <Text style={styles.vendorCardTitle}>Vendor login activated</Text>
            <Text style={styles.vendorCardEmail}>{email}</Text>
            <Text style={styles.vendorCardHint}>The vendor can now log in and set up services & slots</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.cards}>
        {INFO_CARDS.map(card => (
          <View key={card.title} style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name={card.icon} size={22} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>{card.title}</Text>
              <Text style={styles.infoSub}>{card.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ACCENT },
  hero: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 10,
  },
  heroSub: {
    fontSize: 15, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 22,
  },
  vendorCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 14,
    marginHorizontal: 20, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  vendorCardTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  vendorCardEmail: { fontSize: 14, fontWeight: '800', color: '#fff', marginTop: 2 },
  vendorCardHint: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, lineHeight: 16 },
  cards: {
    paddingHorizontal: 20, gap: 10, paddingBottom: 12,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14,
  },
  infoIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  infoSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, lineHeight: 17 },
  actions: { padding: 20, gap: 12 },
  primaryBtn: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { color: ACCENT, fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 12,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
