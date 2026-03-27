import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { API_BASE } from '@/constants/api';
import { useCart } from '@/context/CartContext';
const API_URL = `${API_BASE}/api/stores`;

type Product = {
  id: number;
  name: string;
  description: string;
  subCategory: string;
  price: number;
  originalPrice: number;
  unit: string;
  inStock: boolean;
  stockCount: number;
};

type CartItem = Product & { qty: number };

const SUBCATEGORY_STYLE: Record<string, { bg: string; iconColor: string; icon: string }> = {
  'Fruits & Vegetables': { bg: '#E8F5E9', iconColor: '#2E7D32', icon: 'leaf-outline' },
  'Dairy':               { bg: '#FFF8E1', iconColor: '#F9A825', icon: 'water-outline' },
  'Bakery':              { bg: '#FFF3E0', iconColor: '#E65100', icon: 'nutrition-outline' },
  'Beverages':           { bg: '#E3F2FD', iconColor: '#1565C0', icon: 'cafe-outline' },
  'Snacks':              { bg: '#FCE4EC', iconColor: '#C62828', icon: 'fast-food-outline' },
  'Staples':             { bg: '#F3E5F5', iconColor: '#6A1B9A', icon: 'grid-outline' },
};

const ALL_TAB = 'All';

export default function StoreProductsScreen() {
  const { storeId, storeName } = useLocalSearchParams<{ storeId: string; storeName: string }>();
  const router = useRouter();

  const { cart: globalCart, addToCart: addToGlobalCart, removeFromCart: removeFromGlobalCart, totalItems, totalPrice } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Local view of cart counts for this store
  const cart: Record<number, number> = {};
  Object.values(globalCart).forEach(item => { cart[item.id] = item.qty; });

  useEffect(() => {
    fetch(`${API_URL}/${storeId}/products`)
      .then(r => r.json())
      .then((data: Product[]) => {
        setProducts(data);
        setFiltered(data);
        const cats = [ALL_TAB, ...Array.from(new Set(data.map(p => p.subCategory)))];
        setSubCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    let list = activeTab === ALL_TAB ? products : products.filter(p => p.subCategory === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [search, activeTab, products]);

  const addToCart = (product: Product) => {
    addToGlobalCart({ id: product.id, name: product.name, price: product.price, unit: product.unit, subCategory: product.subCategory }, storeId, storeName ?? storeId);
  };

  const removeFromCart = (productId: number) => {
    removeFromGlobalCart(productId);
  };

  const iconStyle = (sub: string) =>
    SUBCATEGORY_STYLE[sub] ?? { bg: '#F5F5F5', iconColor: '#666', icon: 'pricetag-outline' };

  const discount = (p: Product) =>
    p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

  const renderProduct = ({ item }: { item: Product }) => {
    const qty = cart[item.id] ?? 0;
    const s = iconStyle(item.subCategory);
    const disc = discount(item);

    return (
      <View style={[styles.productCard, !item.inStock && styles.productCardOOS]}>
        {/* Image */}
        <View style={[styles.productImage, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon as any} size={36} color={s.iconColor} />
          {disc > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{disc}% OFF</Text>
            </View>
          )}
          {!item.inStock && (
            <View style={styles.oosBadge}>
              <Text style={styles.oosText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productSubCat}>{item.subCategory}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.productUnit}>{item.unit}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price.toFixed(0)}</Text>
            {disc > 0 && (
              <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(0)}</Text>
            )}
          </View>

          {/* Add / Counter */}
          {item.inStock && (
            qty === 0 ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                <Text style={styles.addBtnText}>Add</Text>
                <Ionicons name="add" size={16} color="#006491" />
              </TouchableOpacity>
            ) : (
              <View style={styles.counter}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => removeFromCart(item.id)}>
                  <Ionicons name="remove" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.counterQty}>{qty}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => addToCart(item)}>
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{storeName}</Text>
          <Text style={styles.headerSub}>Grocery Store</Text>
        </View>
        <TouchableOpacity style={styles.cartIconBtn} onPress={() => router.push('/cart' as any)}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      {subCategories.length > 0 && (
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {subCategories.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#006491" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="package-variant-closed" size={56} color="#ccc" />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Cart footer */}
      {totalItems > 0 && (
        <View style={styles.cartFooter}>
          <View>
            <Text style={styles.cartFooterItems}>{totalItems} item{totalItems > 1 ? 's' : ''}</Text>
            <Text style={styles.cartFooterPrice}>₹{totalPrice.toFixed(0)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/cart' as any)}>
            <Text style={styles.checkoutText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006491',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  cartIconBtn: { position: 'relative', padding: 4 },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a', padding: 0 },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabs: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tabActive: { backgroundColor: '#006491', borderColor: '#006491' },
  tabText: { fontSize: 12, color: '#555', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  list: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 100 },
  row: { gap: 10, marginBottom: 10 },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardOOS: { opacity: 0.65 },
  productImage: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  oosBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  oosText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  productInfo: { padding: 10, flex: 1 },
  productSubCat: { fontSize: 10, color: '#888', marginBottom: 2 },
  productName: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', lineHeight: 17 },
  productDesc: { fontSize: 11, color: '#999', marginTop: 2 },
  productUnit: { fontSize: 11, color: '#006491', fontWeight: '600', marginTop: 3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  price: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  originalPrice: { fontSize: 12, color: '#aaa', textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#006491',
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 8,
    gap: 4,
  },
  addBtnText: { color: '#006491', fontSize: 13, fontWeight: '700' },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006491',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  counterBtn: { paddingHorizontal: 10, paddingVertical: 7 },
  counterQty: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  emptyText: { color: '#aaa', fontSize: 15 },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#006491',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  cartFooterItems: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  cartFooterPrice: { color: '#fff', fontSize: 18, fontWeight: '800' },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  checkoutText: { color: '#006491', fontWeight: '700', fontSize: 14 },
});
