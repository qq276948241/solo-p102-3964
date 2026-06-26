export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryType;
  image: string;
  tag?: string;
}

export type CategoryType = 'latte' | 'americano' | 'pour-over' | 'dessert';

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  orderNumber: string;
  items: CartItem[];
  total: number;
  notes: string;
  createdAt: number;
  estimatedTime: number;
}

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  'latte': '☕',
  'americano': '🫖',
  'pour-over': '🫗',
  'dessert': '🍰'
};
