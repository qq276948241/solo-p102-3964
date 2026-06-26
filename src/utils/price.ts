import { CategoryType, Product } from '../types';

export type Temperature = 'hot' | 'iced';
export type CupSize = 'medium' | 'large';

export interface ProductSpec {
  temperature: Temperature;
  cupSize: CupSize;
}

export interface SpecOption<T extends string = string> {
  value: T;
  label: string;
  icon: string;
  suffix?: string;
  priceDelta: number;
}

export type SpecGroup = {
  key: keyof ProductSpec;
  label: string;
  icon: string;
  options: SpecOption[];
};

const CATEGORIES_WITH_SPEC: CategoryType[] = ['latte', 'americano', 'pour-over'];

export const SPEC_GROUPS: SpecGroup[] = [
  {
    key: 'temperature',
    label: '温度',
    icon: '🌡️',
    options: [
      { value: 'iced', label: '冰', icon: '🧊', priceDelta: 0 },
      { value: 'hot', label: '热', icon: '🔥', priceDelta: 0 }
    ]
  },
  {
    key: 'cupSize',
    label: '杯型',
    icon: '🥤',
    options: [
      { value: 'medium', label: '中杯', icon: '', suffix: 'M', priceDelta: 0 },
      { value: 'large', label: '大杯', icon: '', suffix: 'L', priceDelta: 3 }
    ]
  }
];

export const DEFAULT_SPEC: ProductSpec = {
  temperature: 'iced',
  cupSize: 'medium'
};

export const hasSpecOptions = (category: CategoryType): boolean => {
  return CATEGORIES_WITH_SPEC.includes(category);
};

export const getSpecGroup = (key: keyof ProductSpec): SpecGroup => {
  return SPEC_GROUPS.find(g => g.key === key)!;
};

export const getOptionDelta = (groupKey: keyof ProductSpec, value: string): number => {
  const group = getSpecGroup(groupKey);
  return group.options.find(o => o.value === value)?.priceDelta ?? 0;
};

export const calcPrice = (basePrice: number, spec?: ProductSpec): number => {
  if (!spec) return basePrice;
  let total = basePrice;
  for (const group of SPEC_GROUPS) {
    const selected = spec[group.key] as string;
    total += getOptionDelta(group.key, selected);
  }
  return total;
};

export const calcTotalDelta = (spec?: ProductSpec): number => {
  if (!spec) return 0;
  let delta = 0;
  for (const group of SPEC_GROUPS) {
    const selected = spec[group.key] as string;
    delta += getOptionDelta(group.key, selected);
  }
  return delta;
};

export const formatSpecLabel = (spec?: ProductSpec): string => {
  if (!spec) return '';
  return SPEC_GROUPS.map(group => {
    const opt = group.options.find(o => o.value === (spec[group.key] as string));
    return opt?.label ?? '';
  }).join(' / ');
};

export const getCartItemKey = (productId: string, spec?: ProductSpec): string => {
  if (!spec) return productId;
  return `${productId}_${spec.temperature}_${spec.cupSize}`;
};

export const buildDisplayProduct = (
  base: Product,
  spec: ProductSpec | undefined,
  cartKey: string,
  overridePrice?: number
): Product => {
  const unitPrice = overridePrice ?? calcPrice(base.price, spec);
  const specLabel = formatSpecLabel(spec);
  const baseName = base.name.replace(/\s*·\s*(冰|热)\s*\/\s*(中杯|大杯)$/, '');
  const displayName = specLabel ? `${baseName} · ${specLabel}` : baseName;
  return { ...base, id: cartKey, price: unitPrice, name: displayName };
};

export const getMaxDelta = (groupKey: keyof ProductSpec): number => {
  const group = getSpecGroup(groupKey);
  return Math.max(...group.options.map(o => o.priceDelta));
};
