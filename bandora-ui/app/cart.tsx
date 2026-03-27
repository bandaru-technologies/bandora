import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

const DELIVERY_FEE = 30;

export default function CartScreen() {
  const router = useRouter();
  const { cart, storeName, removeFromCart, addToCart, clearCart, totalItems, totalPrice, storeId } = useCart();

  const items = Object.values(cart);

  const handlePlaceOrder = () => {
    router.push({
      pathname: '/payment' as any,
      params: {
        total: (totalPrice + DELIVERY_FEE).toFixed(0),
        storeName: storeName ?? '',
        itemCount: String(totalItems),
      },
    });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={72} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from a store to get started</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.shopBtnText}>Browse Stores</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.storeTag}>
        <Ionicons name="storefront-outline" size={14} color="#006491" />
        <Text style={styles.storeTagText}>{storeName}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemUnit}>{item.unit}</Text>
              <Text style={styles.itemPrice}>₹{item.price.toFixed(0)}</Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => removeFromCart(item.id)}
              >
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.counterQty}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => addToCart(item, storeId!, storeName!)}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemTotal}>₹{(item.price * item.qty).toFixed(0)}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={styles.billSection}>
            <Text style={styles.billTitle}>Bill Details</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billValue}>₹{totalPrice.toFixed(0)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>₹{DELIVERY_FEE}</Text>
            </View>
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={styles.billTotal}>Total</Text>
              <Text style={styles.billTotal}>₹{(totalPrice + DELIVERY_FEE).toFixed(0)}</Text>
            </View>
          </View>
        }
      />

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerItems}>{totalItems} item{totalItems > 1 ? 's' : ''}</Text>
          <Text style={styles.footerTotal}>₹{(totalPrice + DELIVERY_FEE).toFixed(0)}</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Place Order</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
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
  storeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E3F2FD', paddingHorizontal: 16, paddingVertical: 8,
  },
  storeTagText: { fontSize: 13, color: '#006491', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 100 },
  itemRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  itemUnit: { fontSize: 11, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 13, color: '#006491', fontWeight: '700', marginTop: 4 },
  counter: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#006491', borderRadius: 8, overflow: 'hidden',
  },
  counterBtn: { paddingHorizontal: 9, paddingVertical: 6 },
  counterQty: { minWidth: 24, textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: 14 },
  itemTotal: { fontSize: 14, fontWeight: '800', color: '#1a1a1a', minWidth: 48, textAlign: 'right' },
  separator: { height: 8 },
  billSection: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 16, gap: 10,
  },
  billTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { fontSize: 13, color: '#666' },
  billValue: { fontSize: 13, color: '#1a1a1a' },
  billDivider: { height: 1, backgroundColor: '#eee' },
  billTotal: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#006491', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14,
  },
  footerItems: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  footerTotal: { color: '#fff', fontSize: 18, fontWeight: '800' },
  placeOrderBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, gap: 6,
  },
  placeOrderText: { color: '#006491', fontWeight: '700', fontSize: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center' },
  shopBtn: {
    backgroundColor: '#006491', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
