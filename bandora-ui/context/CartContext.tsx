import { createContext, useContext, useState } from 'react';

export type CartProduct = {
  id: number;
  name: string;
  price: number;
  unit: string;
  subCategory: string;
};

export type CartItem = CartProduct & { qty: number };

type CartContextType = {
  cart: Record<number, CartItem>;
  storeId: string | null;
  storeName: string | null;
  addToCart: (product: CartProduct, storeId: string, storeName: string) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);

  const addToCart = (product: CartProduct, sid: string, sname: string) => {
    if (storeId && storeId !== sid) {
      // Different store — clear old cart first
      setCart({});
    }
    setStoreId(sid);
    setStoreName(sname);
    setCart(prev => ({
      ...prev,
      [product.id]: { ...product, qty: (prev[product.id]?.qty ?? 0) + 1 },
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const qty = (prev[productId]?.qty ?? 0) - 1;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: { ...prev[productId], qty } };
    });
  };

  const clearCart = () => {
    setCart({});
    setStoreId(null);
    setStoreName(null);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  const totalPrice = Object.values(cart).reduce((a, b) => a + b.qty * b.price, 0);

  return (
    <CartContext.Provider value={{ cart, storeId, storeName, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
