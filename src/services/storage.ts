import { CartItem, Order } from '../types';

const CART_KEY = 'lane-coffee-cart';
const ORDER_KEY = 'lane-coffee-last-order';

export const storage = {
  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  getLastOrder(): Order | null {
    try {
      const data = localStorage.getItem(ORDER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setOrder(order: Order): void {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  },

  clearOrder(): void {
    localStorage.removeItem(ORDER_KEY);
  }
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 900 + 100).toString();
  return `${timestamp}${random}`;
};

export const calculateEstimatedTime = (itemCount: number): number => {
  const baseTime = 5;
  const perItemTime = itemCount <= 3 ? 1 : itemCount <= 6 ? 0.8 : 0.5;
  return Math.round(baseTime + itemCount * perItemTime);
};

export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`;
};
