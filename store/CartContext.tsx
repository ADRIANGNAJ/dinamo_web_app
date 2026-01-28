import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, extras: string[]) => void;
  updateQuantity: (productId: string, extras: string[], quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to compare extras without mutating original arrays
const areExtrasEqual = (extras1: string[], extras2: string[]) => {
  if (extras1.length !== extras2.length) return false;
  // Create copies before sorting to avoid mutating state
  const sorted1 = [...extras1].sort();
  const sorted2 = [...extras2].sort();
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      // Try to find exact same item (same product ID AND same extras)
      const existingIndex = prev.findIndex(
        (item) => 
          item.productId === newItem.productId && 
          areExtrasEqual(item.extras, newItem.extras)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
           ...updated[existingIndex],
           quantity: updated[existingIndex].quantity + newItem.quantity
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: string, extras: string[]) => {
    setItems((prev) => 
      prev.filter(
        (item) => 
          !(item.productId === productId && 
            areExtrasEqual(item.extras, extras))
      )
    );
  };

  const updateQuantity = (productId: string, extras: string[], quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          areExtrasEqual(item.extras, extras)
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};