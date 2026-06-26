import { CartItem, Order } from '../types';

const CART_KEY = 'lane-coffee-cart';
const ORDER_KEY = 'lane-coffee-last-order';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const isValidNumber = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n);

const sanitizeItem = (raw: unknown): CartItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (!r.product || typeof r.product !== 'object') return null;
  const p = r.product as Record<string, unknown>;

  if (typeof p.id !== 'string' || !p.id) return null;
  if (typeof p.name !== 'string') return null;
  if (typeof p.category !== 'string') return null;
  if (typeof p.image !== 'string') return null;
  if (typeof p.description !== 'string') return null;
  if (!isValidNumber(p.price)) return null;

  const qty = isValidNumber(r.quantity) && (r.quantity as number) > 0
    ? Math.floor(r.quantity as number)
    : 1;

  return {
    product: {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price as number,
      category: p.category,
      image: p.image,
      ...(typeof p.tag === 'string' ? { tag: p.tag } : {})
    },
    quantity: qty,
    ...(typeof r.cartKey === 'string' ? { cartKey: r.cartKey } : {}),
    ...(r.spec && typeof r.spec === 'object' ? { spec: r.spec } : {}),
    ...(isValidNumber(r.unitPrice) ? { unitPrice: r.unitPrice as number } : {})
  } as CartItem;
};

const sanitizeItems = (raw: unknown): CartItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(sanitizeItem)
    .filter((it): it is CartItem => it !== null);
};

const sanitizeOrder = (raw: unknown): Order | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.orderNumber !== 'string' || !r.orderNumber) return null;
  if (!isValidNumber(r.total)) return null;
  if (!isValidNumber(r.createdAt)) return null;
  if (!isValidNumber(r.estimatedTime)) return null;

  const notes = typeof r.notes === 'string' ? r.notes : '';
  const items = sanitizeItems(r.items);

  return {
    orderNumber: r.orderNumber,
    items,
    total: r.total as number,
    notes,
    createdAt: r.createdAt as number,
    estimatedTime: r.estimatedTime as number
  };
};

export const storage = {
  getCart(): CartItem[] {
    return sanitizeItems(safeParse<unknown>(localStorage.getItem(CART_KEY), []));
  },

  setCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  getLastOrder(): Order | null {
    return sanitizeOrder(safeParse<unknown>(localStorage.getItem(ORDER_KEY), null));
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
