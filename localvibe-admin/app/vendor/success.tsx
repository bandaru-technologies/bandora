import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GREEN_DARK = '#1E3932';
const GREEN = '#00704A';
const MINT = '#D4E9E2';

export default function SuccessScreen() {
  const router = useRouter();
  const { storeName, vendorEmail } = useLocalSearchParams<{ storeName: string; vendorEmail: string }>();
  const name = storeName ? decodeURIComponent(storeName) : 'Your store';
  const email = vendorEmail ? decodeURIComponent(vendorEmail) : '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top hero area */}
      <View style={styles.hero}>
        <View style={styles.checkRing}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
        </View>
        <Text style={styles.heroTitle}>Store Listed!</Text>
        <Text style={styles.heroSub}>{name} is now live on LocalVibe</Text>
      </View>

      {/* White bottom sheet */}
      <View style={styles.sheet}>
        {email ? (
          <View style={styles.vendorCard}>
            <View style={styles.vendorIconWrap}>
              <Ionicons name="person-circle" size={28} color={GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorCardTitle}>Vendor login activated</Text>
              <Text style={styles.vendorCardEmail}>{email}</Text>
              <Text style={styles.vendorCardHint}>This vendor can now log in to manage services & slots</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.infoList}>
          {[
            { icon: 'search', text: 'Store is visible to customers on LocalVibe' },
            { icon: 'calendar-outline', text: 'Vendor can set up services and appointment slots' },
            { icon: 'notifications-outline', text: 'Customers can book appointments directly' },
          ].map(item => (
            <View key={item.text} style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name={item.icon as any} size={18} color={GREEN} />
              </View>
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/vendor/onboard' as any)}
        >
          <Ionicons name="add" size={18} color={GREEN} />
          <Text style={styles.secondaryBtnText}>List Another Business</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GREEN_DARK },
  hero: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkRing: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36, gap: 14,
  },
  vendorCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: MINT, borderRadius: 14, padding: 14,
  },
  vendorIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  vendorCardTitle: { fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 },
  vendorCardEmail: { fontSize: 14, fontWeight: '800', color: GREEN_DARK, marginTop: 2 },
  vendorCardHint: { fontSize: 12, color: '#666', marginTop: 4, lineHeight: 16 },
  infoList: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: MINT, alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },
  primaryBtn: {
    backgroundColor: GREEN, borderRadius: 12,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderWidth: 1.5, borderColor: GREEN, borderRadius: 12,
    paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtnText: { color: GREEN, fontWeight: '700', fontSize: 15 },
});
