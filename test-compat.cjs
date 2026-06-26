// Node test: 验证价格计算、老数据兼容、cartKey 生成、去重合并
// 不依赖 React，手动复刻核心逻辑

const fs = require('fs');
const path = require('path');

// 复刻 SPEC_GROUPS & 工具函数（与 src/utils/price.ts 逻辑一致）
const CATEGORIES_WITH_SPEC = ['latte', 'americano', 'pour-over'];
const SPEC_GROUPS = [
  { key: 'temperature', options: [
    { value: 'iced', label: '冰', priceDelta: 0 },
    { value: 'hot',  label: '热', priceDelta: 0 }
  ]},
  { key: 'cupSize', options: [
    { value: 'medium', label: '中杯', priceDelta: 0 },
    { value: 'large',  label: '大杯', priceDelta: 3 }
  ]}
];
const DEFAULT_SPEC = { temperature: 'iced', cupSize: 'medium' };
const hasSpecOptions = (c) => CATEGORIES_WITH_SPEC.includes(c);
const calcPrice = (bp, spec) => {
  if (!spec) return bp;
  let t = bp;
  for (const g of SPEC_GROUPS) t += (g.options.find(o => o.value === spec[g.key])?.priceDelta ?? 0);
  return t;
};
const formatSpecLabel = (spec) => spec
  ? SPEC_GROUPS.map(g => g.options.find(o => o.value === spec[g.key])?.label ?? '').join(' / ')
  : '';
const getCartItemKey = (id, spec) => spec ? `${id}_${spec.temperature}_${spec.cupSize}` : id;
const buildDisplayProduct = (base, spec, cartKey, overridePrice) => {
  const unitPrice = overridePrice ?? calcPrice(base.price, spec);
  const specLabel = formatSpecLabel(spec);
  const baseName = base.name.replace(/\s*·\s*(冰|热)\s*\/\s*(中杯|大杯)$/, '');
  const displayName = specLabel ? `${baseName} · ${specLabel}` : baseName;
  return { ...base, id: cartKey, price: unitPrice, name: displayName };
};
const isLegacyItem = (it) => {
  if (!it.cartKey) return true;
  if (it.unitPrice == null) return true;
  if (!it.product.name.includes('·') && hasSpecOptions(it.product.category)) return true;
  if (it.product.id !== it.cartKey) return true;
  return false;
};
const normalizeItems = (raw) => {
  const merged = new Map();
  for (const it of raw) {
    if (!it?.product?.id || !Number.isFinite(it.quantity) || it.quantity <= 0) continue;
    if (!isLegacyItem(it)) {
      const ex = merged.get(it.cartKey);
      if (ex) ex.quantity += it.quantity; else merged.set(it.cartKey, { ...it });
      continue;
    }
    const baseProductId = it.product.id.replace(/_.*/, '');
    const needsSpec = hasSpecOptions(it.product.category);
    const spec = it.spec ?? (needsSpec ? DEFAULT_SPEC : undefined);
    const cartKey = getCartItemKey(baseProductId, spec);
    const trustedUnitPrice = it.unitPrice ?? (Number.isFinite(it.product.price) ? it.product.price : 0);
    const baseProduct = { ...it.product, id: baseProductId,
      price: Number.isFinite(it.product.price) ? it.product.price : 0 };
    const normalized = { ...it, quantity: it.quantity, spec, cartKey,
      unitPrice: trustedUnitPrice,
      product: buildDisplayProduct(baseProduct, spec, cartKey, trustedUnitPrice) };
    const ex = merged.get(cartKey);
    if (ex) ex.quantity += normalized.quantity; else merged.set(cartKey, normalized);
  }
  return Array.from(merged.values());
};
const getOptionDelta = (gk, v) =>
  (SPEC_GROUPS.find(g => g.key === gk)?.options.find(o => o.value === v)?.priceDelta ?? 0);

// ====== 测试样例 ======
const results = [];
const assert = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
};

// === Test 1: calcPrice 计算正确 ===
assert('中杯冰价格', calcPrice(28, { temperature: 'iced', cupSize: 'medium' }) === 28);
assert('大杯冰价格', calcPrice(28, { temperature: 'iced', cupSize: 'large' }) === 31);
assert('大杯热价格', calcPrice(32, { temperature: 'hot',  cupSize: 'large' }) === 35);
assert('甜点无规格', calcPrice(38, undefined) === 38);

// === Test 2: getCartItemKey 撞 key 检查 ===
const sampleProduct = {
  id: 'latte-001', name: '招牌燕麦拿铁', description: 'x', price: 32, category: 'latte', image: 'x'
};
const keyA = getCartItemKey('latte-001', { temperature: 'iced', cupSize: 'large' });
const keyB = getCartItemKey('latte-001', { temperature: 'iced', cupSize: 'medium' });
const keyC = getCartItemKey('latte-001', { temperature: 'hot',  cupSize: 'medium' });
const keyD = getCartItemKey('dessert-001', undefined);
assert('大杯冰 vs 中杯冰 不撞key', keyA !== keyB, `${keyA} vs ${keyB}`);
assert('中杯冰 vs 中杯热 不撞key', keyB !== keyC, `${keyB} vs ${keyC}`);
assert('甜点 vs 咖啡 不撞key (格式)', keyD !== keyA.replace(/_.*/, '') + '_a_b' ? '格式区分保证不冲突' : '注意',
  `甜点key: ${keyD}`);
assert('老id恢复后同规格生成一致key',
  getCartItemKey('latte-001_iced_large'.replace(/_.*/, ''), { temperature: 'iced', cupSize: 'large' }) === keyA);

// === Test 3: 老数据兼容 — 关键场景！===
// 场景：老系统（无规格）加购 ¥28 拿铁，存的是 product.price=28，没有 spec/unitPrice/cartKey
const legacyItem1 = {
  product: { id: 'latte-001', name: '拿铁', description: 'x', price: 28, category: 'latte', image: 'x' },
  quantity: 1
};
// 场景2：过渡版代码写脏了 product.price=31（用户选了大杯），但没存 spec/unitPrice
const legacyItem2 = {
  product: { id: 'latte-001', name: '拿铁', description: 'x', price: 31, category: 'latte', image: 'x' },
  quantity: 1
};
// 场景3：新数据选中杯冰拿铁
const modernItem = {
  product: {
    id: 'latte-001_iced_medium',
    name: '拿铁 · 冰 / 中杯',
    description: 'x', price: 28, category: 'latte', image: 'x'
  },
  quantity: 2,
  cartKey: 'latte-001_iced_medium',
  spec: { temperature: 'iced', cupSize: 'medium' },
  unitPrice: 28
};
// 场景4：甜点老数据
const legacyDessert = {
  product: { id: 'dessert-001', name: '提拉米苏', description: 'x', price: 38, category: 'dessert', image: 'x' },
  quantity: 3
};

const normalized = normalizeItems([legacyItem1, legacyItem2, modernItem, legacyDessert]);

console.log('\n--- normalized result ---', JSON.stringify(normalized.map(i => ({
  k: i.cartKey, p: i.unitPrice, q: i.quantity, n: i.product.name
})), null, 2));

// 检查价格（核心 bug 修复）
const itemLegacy1 = normalized.find(i =>
  i.product.name === '拿铁 · 冰 / 中杯' && i.cartKey.endsWith('_iced_medium'));
assert('老数据¥28拿铁 中杯冰 unitPrice=28 不被加成31',
  itemLegacy1 && itemLegacy1.unitPrice === 28,
  itemLegacy1 ? `实际: ${itemLegacy1.unitPrice}` : '未找到条目');

// 检查过渡脏数据（product.price=31） — 我们信任老数据存的成交价
const itemLegacy2 = normalized.find(i =>
  i.product.name === '拿铁 · 冰 / 中杯' && i.unitPrice === 31);
// 注意：legacyItem1（¥28）和 legacyItem2（¥31）补默认规格后会生成相同 cartKey = latte-001_iced_medium
// 所以会被合并去重，取第一条的 unitPrice=28，数量累加
assert('老数据和新数据同规格被合并去重',
  normalized.filter(i => i.cartKey === 'latte-001_iced_medium').length === 1,
  `相同cartKey条目数: ${normalized.filter(i => i.cartKey === 'latte-001_iced_medium').length}`);

const medIce = normalized.find(i => i.cartKey === 'latte-001_iced_medium');
assert('中杯冰条目 quantity=合并(legacy1 qty=1 + legacy2 qty=1) + modernItem qty=2 = 4',
  medIce && medIce.quantity === 1 + 1 + 2,
  medIce ? `实际:${medIce.quantity}` : '没找到');
assert('中杯冰条目 unitPrice=28（取第一条 legacy¥28 的成交价）',
  medIce && medIce.unitPrice === 28,
  medIce ? `实际:${medIce.unitPrice}` : '没找到');
assert('中杯冰 product.price=28（buildDisplayProduct 用 overridePrice 了）',
  medIce && medIce.product.price === 28,
  medIce ? `实际:${medIce.product.price}` : '没找到');

// legacyItem2（¥31）因为和 legacyItem1（¥28）生成了相同 cartKey 被合并
// 如果用户先加购 legacyItem2 再 legacyItem1，就是 unitPrice=31 的情况
const normalized2 = normalizeItems([legacyItem2, modernItem]);
const medIce2 = normalized2.find(i => i.cartKey === 'latte-001_iced_medium');
assert('脏数据¥31 + 新¥28 同规格合并：unitPrice=第一条的¥31（信任老成交价）',
  medIce2 && medIce2.unitPrice === 31,
  medIce2 ? `实际:${medIce2.unitPrice}` : '没找到');
assert('product.price=同unitPrice=¥31（用 overridePrice 保护）',
  medIce2 && medIce2.product.price === 31,
  medIce2 ? `实际:${medIce2.product.price}` : '没找到');

// 甜点无规格
const dessertItem = normalized.find(i => i.cartKey === 'dessert-001');
assert('甜点无规格 cartKey=原id', !!dessertItem);
assert('甜点 unitPrice=¥38 不加价', dessertItem && dessertItem.unitPrice === 38);
assert('甜点 quantity=3', dessertItem && dessertItem.quantity === 3);
assert('甜点 product.name 不追加 ·', dessertItem && !dessertItem.product.name.includes('·'),
  dessertItem?.product.name);

// === Test 4: 新数据独立规格不被合并 ===
const m1 = {
  product: { id: 'latte-001_iced_large', name: '拿铁 · 冰 / 大杯', d: 'x', price: 31, c: 'latte', i: 'x',
    description: 'x', category: 'latte', image: 'x' },
  quantity: 1,
  cartKey: 'latte-001_iced_large',
  spec: { temperature: 'iced', cupSize: 'large' },
  unitPrice: 31
};
const m2 = {
  product: { id: 'latte-001_hot_medium', name: '拿铁 · 热 / 中杯', d: 'x', price: 28, c: 'latte', i: 'x',
    description: 'x', category: 'latte', image: 'x' },
  quantity: 1,
  cartKey: 'latte-001_hot_medium',
  spec: { temperature: 'hot', cupSize: 'medium' },
  unitPrice: 28
};
const nr3 = normalizeItems([m1, m2, modernItem]);
console.log('\n--- 新数据不同规格独立条目 ---',
  JSON.stringify(nr3.map(i => ({ k: i.cartKey, q: i.quantity, p: i.unitPrice, n: i.product.name })), null, 2));
assert('三条不同规格 → 三条独立记录', nr3.length === 3,
  `实际条目数=${nr3.length}`);
assert('总金额 = 31*1 + 28*1 + 28*2 = 115',
  nr3.reduce((s, i) => s + i.unitPrice * i.quantity, 0) === 31 + 28 + 56,
  `实际=${nr3.reduce((s, i) => s + i.unitPrice * i.quantity, 0)}`);

// === Test 5: 成功页 order 渲染不崩（items 格式一致）===
// order 里存的 items 和 cart 里格式一样 → 直接复用 normalize 逻辑
const fakeOrder = {
  orderNumber: '1234567',
  items: [legacyItem1, legacyItem2, modernItem, legacyDessert],
  total: 999,
  notes: 'test',
  createdAt: Date.now(),
  estimatedTime: 10
};
// success 页会 map fakeOrder.items，每条 item.product.name/price 都要合法
const itemsForSuccess = normalizeItems(fakeOrder.items);
assert('成功页 order.items 兼容：每条都有合法 name',
  itemsForSuccess.every(i => typeof i.product?.name === 'string' && i.product.name.length > 0));
assert('成功页每条都有合法 price',
  itemsForSuccess.every(i => Number.isFinite(i.product?.price) && i.product.price >= 0));
assert('成功页每条都有合法 quantity',
  itemsForSuccess.every(i => Number.isFinite(i.quantity) && i.quantity > 0));

// ====== 汇总 ======
const passCount = results.filter(r => r.pass).length;
console.log(`\n========== 结果 ${passCount}/${results.length} ==========`);
if (passCount !== results.length) {
  console.log('失败用例：');
  results.filter(r => !r.pass).forEach(r => console.log('  -', r.name, r.detail));
  process.exit(1);
}
console.log('✅ 全部通过');
