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
  const { storeName, storeId } = useLocalSearchParams<{ storeName: string; storeId: string }>();
  const name = storeName ? decodeURIComponent(storeName) : 'Your store';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>You're Live on LocalVibe! 🎉</Text>
        <Text style={styles.heroSub}>{name} is now visible to customers</Text>
      </View>

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
          onPress={() => router.replace((`/vendor/manage?storeId=${storeId}&storeName=${encodeURIComponent(name)}`) as any)}
        >
          <MaterialCommunityIcons name="store-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Manage My Store</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
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
