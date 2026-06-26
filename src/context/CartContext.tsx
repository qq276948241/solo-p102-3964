import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, Order } from '../types';
import { storage, generateOrderNumber, calculateEstimatedTime } from '../services/storage';
import {
  ProductSpec,
  getCartItemKey,
  calcPrice,
  DEFAULT_SPEC,
  hasSpecOptions,
  buildDisplayProduct
} from '../utils/price';

interface CartItemWithSpec extends CartItem {
  cartKey: string;
  spec?: ProductSpec;
  unitPrice: number;
}

interface CartContextType {
  items: CartItemWithSpec[];
  totalQuantity: number;
  totalPrice: number;
  addItem: (product: Product, spec?: ProductSpec, event?: React.MouseEvent) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (notes: string) => Order;
  lastOrder: Order | null;
  cartBounceKey: number;
  badgePopKey: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeItems = (raw: CartItemWithSpec[]): CartItemWithSpec[] => {
  return raw.map(it => {
    if (it.cartKey && it.unitPrice != null && it.product.name.includes('·')) return it;
    const spec = it.spec ?? (hasSpecOptions(it.product.category) ? DEFAULT_SPEC : undefined);
    const cartKey = getCartItemKey(it.product.id.replace(/_.*/, ''), spec);
    const unitPrice = it.unitPrice ?? calcPrice(it.product.price, spec);
    return {
      ...it,
      spec,
      cartKey,
      unitPrice,
      product: buildDisplayProduct(it.product, spec, cartKey)
    };
  });
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemWithSpec[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [cartBounceKey, setCartBounceKey] = useState(0);
  const [badgePopKey, setBadgePopKey] = useState(0);

  useEffect(() => {
    setItems(normalizeItems(storage.getCart() as CartItemWithSpec[]));
    setLastOrder(storage.getLastOrder());
  }, []);

  useEffect(() => {
    storage.setCart(items as unknown as CartItem[]);
  }, [items]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const triggerAnimations = useCallback(() => {
    setCartBounceKey(prev => prev + 1);
    setBadgePopKey(prev => prev + 1);
  }, []);

  const addItem = useCallback((product: Product, spec?: ProductSpec, event?: React.MouseEvent) => {
    const finalSpec = hasSpecOptions(product.category) ? (spec ?? DEFAULT_SPEC) : undefined;
    const cartKey = getCartItemKey(product.id, finalSpec);
    const unitPrice = calcPrice(product.price, finalSpec);
    const adaptedProduct = buildDisplayProduct(product, finalSpec, cartKey);

    setItems(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product: adaptedProduct,
          quantity: 1,
          cartKey,
          spec: finalSpec,
          unitPrice
        }
      ];
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

  const removeItem = useCallback((cartKey: string) => {
    setItems(prev => prev.filter(item => item.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.cartKey !== cartKey));
    } else {
      setItems(prev =>
        prev.map(item =>
          item.cartKey === cartKey ? { ...item, quantity } : item
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
      items: [...items] as unknown as CartItem[],
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

export type { CartItemWithSpec };
