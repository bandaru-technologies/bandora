import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod' | 'pickup';

const UPI_APPS = [
  { id: 'gpay',    label: 'Google Pay',  icon: 'google',         color: '#4285F4' },
  { id: 'phonepe', label: 'PhonePe',     icon: 'phone',          color: '#5F259F' },
  { id: 'paytm',   label: 'Paytm',       icon: 'alpha-p-circle', color: '#00B9F1' },
  { id: 'bhim',    label: 'BHIM UPI',    icon: 'bank',           color: '#00529C' },
];

export default function PaymentScreen() {
  const { total, storeName, itemCount } = useLocalSearchParams<{
    total: string;
    storeName: string;
    itemCount: string;
  }>();
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [selectedUpi, setSelectedUpi] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    if (method === 'upi' && !selectedUpi && !upiId.trim()) return;
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      router.replace({
        pathname: '/delivery-assigned' as any,
        params: { total, storeName, itemCount, method },
      });
    }, 2000);
  };

  const canPay =
    method === 'cod' ||
    method === 'pickup' ||
    method === 'netbanking' ||
    method === 'card' ||
    (method === 'upi' && (selectedUpi !== null || upiId.trim().length > 5));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Order summary strip */}
        <View style={styles.summaryStrip}>
          <View>
            <Text style={styles.summaryStore}>{storeName}</Text>
            <Text style={styles.summaryItems}>{itemCount} item{Number(itemCount) > 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.summaryTotal}>₹{total}</Text>
        </View>

        <Text style={styles.sectionLabel}>Choose Payment Method</Text>

        {/* UPI */}
        <TouchableOpacity
          style={[styles.methodRow, method === 'upi' && styles.methodRowActive]}
          onPress={() => setMethod('upi')}
          activeOpacity={0.8}
        >
          <View style={styles.methodLeft}>
            <MaterialCommunityIcons name="cellphone" size={22} color={method === 'upi' ? '#006491' : '#555'} />
            <Text style={[styles.methodLabel, method === 'upi' && styles.methodLabelActive]}>UPI</Text>
          </View>
          <View style={[styles.radio, method === 'upi' && styles.radioActive]}>
            {method === 'upi' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {method === 'upi' && (
          <View style={styles.upiExpanded}>
            {/* UPI app buttons */}
            <View style={styles.upiApps}>
              {UPI_APPS.map(app => (
                <TouchableOpacity
                  key={app.id}
                  style={[styles.upiApp, selectedUpi === app.id && styles.upiAppSelected]}
                  onPress={() => { setSelectedUpi(app.id); setUpiId(''); }}
                >
                  <MaterialCommunityIcons
                    name={app.icon as any}
                    size={26}
                    color={selectedUpi === app.id ? '#fff' : app.color}
                  />
                  <Text style={[styles.upiAppLabel, selectedUpi === app.id && styles.upiAppLabelSelected]}>
                    {app.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Manual UPI ID */}
            <Text style={styles.orText}>— or enter UPI ID —</Text>
            <View style={[styles.upiInput, upiId.length > 0 && styles.upiInputActive]}>
              <TextInput
                style={styles.upiInputText}
                placeholder="yourname@upi"
                placeholderTextColor="#aaa"
                value={upiId}
                onChangeText={t => { setUpiId(t); setSelectedUpi(null); }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>
        )}

        {/* Card */}
        <TouchableOpacity
          style={[styles.methodRow, method === 'card' && styles.methodRowActive]}
          onPress={() => setMethod('card')}
          activeOpacity={0.8}
        >
          <View style={styles.methodLeft}>
            <Ionicons name="card-outline" size={22} color={method === 'card' ? '#006491' : '#555'} />
            <Text style={[styles.methodLabel, method === 'card' && styles.methodLabelActive]}>
              Credit / Debit Card
            </Text>
          </View>
          <View style={[styles.radio, method === 'card' && styles.radioActive]}>
            {method === 'card' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {method === 'card' && (
          <View style={styles.cardExpanded}>
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Card Number</Text>
              <TextInput style={styles.cardInput} placeholder="1234 5678 9012 3456" placeholderTextColor="#aaa" keyboardType="number-pad" maxLength={19} />
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.cardField, { flex: 1 }]}>
                <Text style={styles.cardFieldLabel}>Expiry</Text>
                <TextInput style={styles.cardInput} placeholder="MM / YY" placeholderTextColor="#aaa" keyboardType="number-pad" maxLength={7} />
              </View>
              <View style={[styles.cardField, { flex: 1 }]}>
                <Text style={styles.cardFieldLabel}>CVV</Text>
                <TextInput style={styles.cardInput} placeholder="•••" placeholderTextColor="#aaa" keyboardType="number-pad" maxLength={3} secureTextEntry />
              </View>
            </View>
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Name on Card</Text>
              <TextInput style={styles.cardInput} placeholder="Full Name" placeholderTextColor="#aaa" />
            </View>
          </View>
        )}

        {/* Net Banking */}
        <TouchableOpacity
          style={[styles.methodRow, method === 'netbanking' && styles.methodRowActive]}
          onPress={() => setMethod('netbanking')}
          activeOpacity={0.8}
        >
          <View style={styles.methodLeft}>
            <MaterialCommunityIcons name="bank-outline" size={22} color={method === 'netbanking' ? '#006491' : '#555'} />
            <Text style={[styles.methodLabel, method === 'netbanking' && styles.methodLabelActive]}>
              Net Banking
            </Text>
          </View>
          <View style={[styles.radio, method === 'netbanking' && styles.radioActive]}>
            {method === 'netbanking' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Cash on Delivery */}
        <TouchableOpacity
          style={[styles.methodRow, method === 'cod' && styles.methodRowActive]}
          onPress={() => setMethod('cod')}
          activeOpacity={0.8}
        >
          <View style={styles.methodLeft}>
            <MaterialCommunityIcons name="cash" size={22} color={method === 'cod' ? '#006491' : '#555'} />
            <Text style={[styles.methodLabel, method === 'cod' && styles.methodLabelActive]}>
              Cash on Delivery
            </Text>
          </View>
          <View style={[styles.radio, method === 'cod' && styles.radioActive]}>
            {method === 'cod' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Pay at Store Pickup */}
        <TouchableOpacity
          style={[styles.methodRow, method === 'pickup' && styles.methodRowActive]}
          onPress={() => setMethod('pickup')}
          activeOpacity={0.8}
        >
          <View style={styles.methodLeft}>
            <MaterialCommunityIcons name="store-outline" size={22} color={method === 'pickup' ? '#006491' : '#555'} />
            <Text style={[styles.methodLabel, method === 'pickup' && styles.methodLabelActive]}>
              Pay at Store Pickup
            </Text>
          </View>
          <View style={[styles.radio, method === 'pickup' && styles.radioActive]}>
            {method === 'pickup' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, !canPay && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={!canPay || processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={styles.payBtnText}>
                {method === 'cod' || method === 'pickup' ? `Confirm Order · ₹${total}` : `Pay ₹${total}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.secureNote}>
          <Ionicons name="shield-checkmark-outline" size={11} color="#888" /> 100% Secure Payment
        </Text>
      </View>
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
  scroll: { padding: 16 },
  summaryStrip: {
    backgroundColor: '#006491', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  summaryStore: { color: '#fff', fontWeight: '700', fontSize: 15 },
  summaryItems: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  summaryTotal: { color: '#fff', fontWeight: '900', fontSize: 22 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 12 },
  methodRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  methodRowActive: { borderColor: '#006491', backgroundColor: '#F0F8FF' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  methodLabelActive: { color: '#006491' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#006491' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#006491' },
  upiExpanded: { marginBottom: 10, marginTop: -4 },
  upiApps: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  upiApp: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#e0e0e0',
  },
  upiAppSelected: { backgroundColor: '#006491', borderColor: '#006491' },
  upiAppLabel: { fontSize: 10, fontWeight: '600', color: '#333', textAlign: 'center' },
  upiAppLabelSelected: { color: '#fff' },
  orText: { textAlign: 'center', fontSize: 12, color: '#aaa', marginBottom: 10 },
  upiInput: {
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5,
    borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 12,
  },
  upiInputActive: { borderColor: '#006491' },
  upiInputText: { fontSize: 14, color: '#1a1a1a' },
  cardExpanded: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, marginTop: -4, gap: 12 },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardField: { gap: 4 },
  cardFieldLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  cardInput: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a',
  },
  footer: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  payBtn: {
    backgroundColor: '#006491', borderRadius: 12,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  payBtnDisabled: { backgroundColor: '#b0c4ce' },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secureNote: { textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 8 },
});
