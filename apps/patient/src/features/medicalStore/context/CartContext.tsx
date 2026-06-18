import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { CartItem, Medicine } from '../../../../../packages/core/src/types';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  discount: number;
  deliveryFee: number;
  payableAmount: number;
  storeId: string | null;
  storeName: string | null;
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (medicineId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const discount = items.reduce(
    (sum, item) =>
      sum + (item.medicine.price - item.medicine.discountedPrice) * item.quantity,
    0
  );
  const deliveryFee = totalAmount > 499 ? 0 : 49;
  const payableAmount = totalAmount - discount + deliveryFee;

  const addToCart = useCallback((medicine: Medicine) => {
    setItems((prev) => {
      // Single-store cart enforcement
      const medStoreId = medicine.storeId || null;
      if (prev.length > 0 && medStoreId && storeId && medStoreId !== storeId) {
        Alert.alert(
          'Different Store',
          `Your cart has items from ${storeName || 'another store'}. Clear cart to add items from this store?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear & Add',
              style: 'destructive',
              onPress: () => {
                setItems([{ medicine, quantity: 1 }]);
                setStoreId(medStoreId);
                setStoreName(medicine.storeName || null);
              },
            },
          ]
        );
        return prev;
      }

      // Set store on first item
      if (prev.length === 0 && medStoreId) {
        setStoreId(medStoreId);
        setStoreName(medicine.storeName || null);
      }

      const existing = prev.find((i) => i.medicine.id === medicine.id);
      if (existing) {
        return prev.map((i) =>
          i.medicine.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  }, [storeId, storeName]);

  const removeFromCart = useCallback((medicineId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.medicine.id !== medicineId);
      if (next.length === 0) {
        setStoreId(null);
        setStoreName(null);
      }
      return next;
    });
  }, []);

  const updateQuantity = useCallback((medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const next = prev.filter((i) => i.medicine.id !== medicineId);
        if (next.length === 0) {
          setStoreId(null);
          setStoreName(null);
        }
        return next;
      });
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.medicine.id === medicineId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setStoreId(null);
    setStoreName(null);
  }, []);

  const isInCart = useCallback(
    (medicineId: string) => items.some((i) => i.medicine.id === medicineId),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        discount,
        deliveryFee,
        payableAmount,
        storeId,
        storeName,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
