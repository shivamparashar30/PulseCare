import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, Medicine } from '../../../../../packages/core/src/types';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  discount: number;
  payableAmount: number;
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (medicineId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

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
      const existing = prev.find((i) => i.medicine.id === medicine.id);
      if (existing) {
        return prev.map((i) =>
          i.medicine.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((medicineId: string) => {
    setItems((prev) => prev.filter((i) => i.medicine.id !== medicineId));
  }, []);

  const updateQuantity = useCallback((medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.medicine.id !== medicineId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.medicine.id === medicineId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
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
        payableAmount,
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
