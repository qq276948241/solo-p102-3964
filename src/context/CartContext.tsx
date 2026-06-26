import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, Order } from '../types';
import { storage, generateOrderNumber, calculateEstimatedTime } from '../services/storage';

interface CartContextType {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addItem: (product: Product, event?: React.MouseEvent) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (notes: string) => Order;
  lastOrder: Order | null;
  cartBounceKey: number;
  badgePopKey: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [cartBounceKey, setCartBounceKey] = useState(0);
  const [badgePopKey, setBadgePopKey] = useState(0);

  useEffect(() => {
    setItems(storage.getCart());
    setLastOrder(storage.getLastOrder());
  }, []);

  useEffect(() => {
    storage.setCart(items);
  }, [items]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const triggerAnimations = useCallback(() => {
    setCartBounceKey(prev => prev + 1);
    setBadgePopKey(prev => prev + 1);
  }, []);

  const addItem = useCallback((product: Product, event?: React.MouseEvent) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerAnimations();

    if (event) {
      const button = event.currentTarget as HTMLElement;
      const buttonRect = button.getBoundingClientRect();
      const cartIcon = document.querySelector('.cart-btn');
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const flyElement = document.createElement('div');
        flyElement.className = 'plus-fly';
        flyElement.textContent = '+';
        flyElement.style.left = `${buttonRect.left + buttonRect.width / 2 - 20}px`;
        flyElement.style.top = `${buttonRect.top + buttonRect.height / 2 - 20}px`;
        const deltaX = cartRect.left + cartRect.width / 2 - (buttonRect.left + buttonRect.width / 2);
        const deltaY = cartRect.top + cartRect.height / 2 - (buttonRect.top + buttonRect.height / 2);
        flyElement.style.setProperty('--fly-x', `${deltaX}px`);
        flyElement.style.setProperty('--fly-y', `${deltaY}px`);
        document.body.appendChild(flyElement);
        setTimeout(() => flyElement.remove(), 800);
      }
    }
  }, [triggerAnimations]);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    storage.clearCart();
  }, []);

  const checkout = useCallback((notes: string): Order => {
    const order: Order = {
      orderNumber: generateOrderNumber(),
      items: [...items],
      total: totalPrice,
      notes,
      createdAt: Date.now(),
      estimatedTime: calculateEstimatedTime(totalQuantity)
    };
    setLastOrder(order);
    storage.setOrder(order);
    clearCart();
    return order;
  }, [items, totalPrice, totalQuantity, clearCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkout,
        lastOrder,
        cartBounceKey,
        badgePopKey
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
