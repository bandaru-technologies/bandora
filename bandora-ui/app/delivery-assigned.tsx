import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

const AGENTS = [
  { name: 'Ravi Kumar',   phone: '+91 98765 43210', rating: 4.8, eta: '15–20 min', vehicle: 'Bike · KA 05 AB 1234' },
  { name: 'Suresh Babu',  phone: '+91 91234 56789', rating: 4.6, eta: '20–25 min', vehicle: 'Bike · KA 03 XY 5678' },
  { name: 'Ankit Sharma', phone: '+91 87654 32109', rating: 4.9, eta: '10–15 min', vehicle: 'Scooter · KA 01 MN 9012' },
];

export default function DeliveryAssignedScreen() {
  const { total, storeName, itemCount } = useLocalSearchParams<{
    total: string;
    storeName: string;
    itemCount: string;
  }>();
  const router = useRouter();
  const { clearCart } = useCart();

  const [assigning, setAssigning] = useState(true);
  const [agent] = useState(() => AGENTS[Math.floor(Math.random() * AGENTS.length)]);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Clear cart once we land here
  useEffect(() => {
    clearCart();
  }, []);

  useEffect(() => {
    // Simulate agent assignment delay
    const t = setTimeout(() => setAssigning(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // Pulse animation while assigning
  useEffect(() => {
    if (!assigning) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [assigning]);

  const orderId = `BND${Date.now().toString().slice(-6)}`;

  if (assigning) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.assigningScreen}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialCommunityIcons name="moped" size={48} color="#006491" />
          </Animated.View>
          <Text style={styles.assigningTitle}>Finding delivery agent...</Text>
          <Text style={styles.assigningSub}>Order confirmed! Assigning the nearest agent</Text>
          <ActivityIndicator color="#006491" style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollableContent>
        {/* Order confirmed banner */}
        <View style={styles.confirmedBanner}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color="#fff" />
          </View>
          <Text style={styles.confirmedTitle}>Order Placed!</Text>
          <Text style={styles.confirmedSub}>Your order #{orderId} is confirmed</Text>
        </View>

        {/* Agent card */}
        <View style={styles.agentCard}>
          <View style={styles.agentCardHeader}>
            <MaterialCommunityIcons name="moped" size={18} color="#006491" />
            <Text style={styles.agentCardTitle}>Delivery Agent Assigned</Text>
          </View>

          <View style={styles.agentRow}>
            <View style={styles.agentAvatar}>
              <Ionicons name="person" size={28} color="#006491" />
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F9A825" />
                <Text style={styles.agentRating}>{agent.rating}</Text>
              </View>
              <Text style={styles.agentVehicle}>{agent.vehicle}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color="#006491" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={16} color="#2E7D32" />
            <Text style={styles.etaText}>Estimated delivery: <Text style={styles.etaBold}>{agent.eta}</Text></Text>
          </View>
        </View>

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Ionicons name="storefront-outline" size={16} color="#888" />
            <Text style={styles.summaryText}>{storeName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="bag-outline" size={16} color="#888" />
            <Text style={styles.summaryText}>{itemCount} item{Number(itemCount) > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Paid</Text>
            <Text style={styles.summaryTotalAmount}>₹{total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollableContent>
    </SafeAreaView>
  );
}

// Simple wrapper to avoid importing ScrollView at top level
function ScrollableContent({ children }: { children: React.ReactNode }) {
  const { ScrollView } = require('react-native');
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  assigningScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  pulseCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center',
  },
  assigningTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  assigningSub: { fontSize: 14, color: '#666', textAlign: 'center' },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  confirmedBanner: {
    backgroundColor: '#006491', borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 8,
  },
  checkCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  confirmedTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  confirmedSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  agentCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  agentCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  agentCardTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  agentAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center',
  },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  agentRating: { fontSize: 13, fontWeight: '600', color: '#555' },
  agentVehicle: { fontSize: 12, color: '#888', marginTop: 3 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  etaText: { fontSize: 13, color: '#555' },
  etaBold: { fontWeight: '700', color: '#2E7D32' },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  summaryText: { flex: 1, fontSize: 13, color: '#555' },
  summaryTotalLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  summaryTotalAmount: { fontSize: 16, fontWeight: '800', color: '#006491' },
  homeBtn: {
    backgroundColor: '#006491', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  homeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
