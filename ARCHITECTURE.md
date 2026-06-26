# 巷口咖啡 · 架构速览

一份给新接手同学看的大白话文档，别当论文读，核心概念明白了直接改代码。

---

## 一、怎么跑起来

```bash
npm install        # 第一次需要
npm run dev        # 开发模式，Vite 自己起服务，端口看终端输出（默认 5173，被占就往后滚）
npm run build      # 生产构建，输出到 dist/
npm run preview    # 本地预览构建产物
```

技术栈：**React 18 + TypeScript + Vite + React Router 6**。没有 Redux、没有 MobX，状态全靠 React Context。

---

## 二、项目结构（一眼看哪改哪）

```
src/
├── main.tsx              # 入口，ReactDOM.render <App />
├── App.tsx               # 顶层装配：路由 + CartProvider + Header
├── types/index.ts        # 所有 TypeScript 类型定义（Product、CartItem、Order…）
│
├── data/
│   └── products.ts       # 纯数据：20 个商品 + 4 个分类（拿铁/美式/手冲/甜点）
│
├── utils/
│   └── price.ts          # ⭐ 价格计算唯一真相源
│                         #   calcPrice()、buildDisplayProduct()、getCartItemKey()、
│                         #   SPEC_GROUPS（温度/杯型配置）、DEFAULT_SPEC
│                         #   【改价改规格只动这里】
│
├── services/
│   └── storage.ts        # localStorage 读写 + 字段 sanitize（防老数据崩页面）
│
├── context/
│   └── CartContext.tsx   # ⭐ 全局购物车状态（useReducer 风格的 useState 实现）
│                         #   addItem / removeItem / updateQuantity / checkout
│                         #   normalizeItems 在这里做老数据兼容
│
├── components/
│   ├── Header.tsx        # 顶部毛玻璃导航栏 + 右上角购物车按钮+角标
│   ├── ProductCard.tsx   # 商品卡片 + ⚙️规格弹窗（咖啡类点+会弹）
│   └── CartBadge.tsx     # 角标数字+弹跳动画（如果单独拆了的话）
│
├── pages/
│   ├── MenuPage.tsx      # /     — 菜单页：4 个分类 Tabs + 3 列网格
│   ├── CartPage.tsx      # /cart — 左商品列表 + 右结算面板
│   └── SuccessPage.tsx   # /success — 下单成功：取餐号 + 订单清单
│
└── styles/
    ├── theme.css         # ⭐ 全局 CSS 变量（颜色/圆角/阴影/字体）+ reset + @keyframes
    └── App.css           # 页面/组件具体样式（类名）
```

**新人改代码导航**：
- 改商品数据/加商品 → [data/products.ts](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/data/products.ts)
- 改价格规则/加新选项（比如甜度）→ [utils/price.ts](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/utils/price.ts)
- 改主题色/圆角/字体 → [styles/theme.css](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/styles/theme.css)
- 改加购逻辑/结算/购物车增删 → [context/CartContext.tsx](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/context/CartContext.tsx)
- 改页面布局 → 去 `pages/` 下对应文件

---

## 三、三页面怎么切

[App.tsx](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/App.tsx) 里用 `BrowserRouter` 包了三个路由：

| URL | 页面 | 说明 |
|---|---|---|
| `/` | [MenuPage](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/pages/MenuPage.tsx) | 菜单，点 + 加购 |
| `/cart` | [CartPage](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/pages/CartPage.tsx) | 购物车，点「去下单」→ checkout → navigate 到 `/success` |
| `/success` | [SuccessPage](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/pages/SuccessPage.tsx) | 取餐号展示，点「再来一单」回 `/` |

页面切换有淡入动画，用的 trick：外层 `page-wrapper` 的 `key={location.pathname}`，切路由 key 变了 React 就卸载重挂载，触发 `fadeInUp` 关键帧。

---

## 四、核心数据流（点加购 → 下单成功）

```
┌───────────────────────────────────────────────────────────────────┐
│  用户点 ProductCard 的「+」按钮                                     │
│      │                                                            │
│      ▼                                                            │
│  ProductCard 判断 hasSpecOptions(product.category)                 │
│   ├─ 咖啡类 → 弹规格弹窗（选温度/杯型）→ 点「加入购物车」             │
│   └─ 甜点类 → 直接进下一步                                          │
│      │                                                            │
│      ▼                                                            │
│  CartContext.addItem(product, spec, event)                         │
│      │                                                            │
│      ├─① price.ts::calcPrice(basePrice, spec) → 算出 unitPrice      │
│      ├─② price.ts::getCartItemKey(productId, spec) → 生成唯一键     │
│      │     (格式: "latte-001_iced_large"，甜点直接用 productId)    │
│      ├─③ price.ts::buildDisplayProduct() → 浅拷贝 product，改写    │
│      │     id=cartKey、price=unitPrice、name="拿铁 · 冰 / 大杯"     │
│      │     （★ 这个技巧让购物车/成功页不用改代码就能显示规格）        │
│      ├─④ 查 items 里有没有同 cartKey → 有就 quantity+1，没有就新增  │
│      ├─⑤ 触发弹跳动画（购物车图标 +1 都 spring 一下）                │
│      └─⑥ 飞行动画：DOM 造个 + div 从按钮飞到右上角购物车图标         │
│      │                                                            │
│      ▼                                                            │
│  items 状态变化 → useEffect 自动 → storage.setCart(items)          │
│                    → localStorage['lane-coffee-cart'] 落盘 ✅       │
│      │                                                            │
│      ▼            ▼            ▼            ▼                     │
│  Header 角标    MenuPage      CartPage      （其它消费方）          │
│   数字变了      （不受影响）    列表刷新                              │
│   弹跳一次                                                     │
│                                                                   │
│  …… 用户点购物车页「去下单」……                                        │
│      │                                                            │
│      ▼                                                            │
│  CartContext.checkout(notes)                                       │
│      │                                                            │
│      ├─① 生成取餐号（时间戳后4位+3位随机）                           │
│      ├─② 构造 Order 对象（items/total/notes/时间/预计取餐分钟）      │
│      ├─③ storage.setOrder(order) → localStorage 落盘              │
│      ├─④ clearCart() → items 清空 + storage.clearCart()          │
│      └─⑤ navigate('/success')                                     │
│      │                                                            │
│      ▼                                                            │
│  SuccessPage 读 CartContext.lastOrder → 渲染取餐号/订单清单/预计时间 │
└───────────────────────────────────────────────────────────────────┘
```

一句话总结：**ProductCard 只管收数据 → CartContext 算钱改状态 → useEffect 写 localStorage → 所有页面通过 useCart() 读同一个状态**。

---

## 五、CartContext 喂四处的原理

[CartContext.tsx](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/context/CartContext.tsx) 里 `CartProvider` 包在 App 的最外层，整个应用所有组件都能调 `useCart()` 拿到同一个对象：

```typescript
{
  items,            // 购物车条目数组（带 cartKey / spec / unitPrice）
  totalQuantity,    // 总件数（Header 角标用）
  totalPrice,       // 总金额（结算面板用）
  addItem,          // 加购
  removeItem,       // 按 cartKey 删除（同名不同规格互删不冲突）
  updateQuantity,   // 按 cartKey 改数量
  clearCart,        // 清空
  checkout,         // 下单
  lastOrder,        // 最近一笔订单（SuccessPage 用）
  cartBounceKey,    // 变一下触发购物车图标重绘 → CSS 重放动画
  badgePopKey       // 变一下触发角标重绘 → CSS 重放动画
}
```

四处消费方：

| 消费方 | 读什么 | 做什么 |
|---|---|---|
| **ProductCard** | `addItem()` | 唯一的写入入口 |
| **Header** | `totalQuantity`、`cartBounceKey`、`badgePopKey` | 角标显示数字，弹跳动画 |
| **CartPage** | `items`、`totalPrice`、`removeItem()`、`updateQuantity()`、`checkout()` | 列表渲染、增减、删除、结算 |
| **SuccessPage** | `lastOrder` | 渲染取餐号和订单清单 |

因为是同一个 Context，**任何一处 addItem，另外三处自动重渲染**，没有事件总线、没有手动订阅。

---

## 六、localStorage：何时落盘、何时回血

两个 key：

| Key | 存什么 | 落盘时机 | 回血时机 |
|---|---|---|---|
| `lane-coffee-cart` | 购物车 items 数组 | CartContext 里 `useEffect(() => storage.setCart(items), [items])`，**items 每次变就写** | 页面初次加载时 CartProvider 的另一个 useEffect：`storage.getCart()` → normalizeItems → setItems |
| `lane-coffee-last-order` | 最近一笔 Order | 点「去下单」checkout() 内调 `storage.setOrder(order)` | 同 cart 一起，`storage.getLastOrder()` → setLastOrder |

**回血时的兼容处理**（[context/CartContext.tsx](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/context/CartContext.tsx) 的 `normalizeItems` + [services/storage.ts](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/services/storage.ts) 的 sanitize）：
- storage 层先做字段类型校验，非法数据直接过滤，防止 `product.price` 是 undefined 渲染崩
- CartContext 层识别老数据（缺 `cartKey` / `unitPrice` / 咖啡名没「·」）：
  - 补 `spec = DEFAULT_SPEC`（冰 + 中杯）
  - **unitPrice 信任老数据存的成交价**，不重算（这是修过的 bug：以前拿脏 price 再 calc 一次会多钱）
  - 同 cartKey 的老数据和新数据做数量合并，不重复显示

---

## 七、样式系统（主题色 + 全局样式）

两层：

**[theme.css](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/styles/theme.css)** — 设计 tokens，CSS 变量全在这，改一处全局生效：

```css
:root {
  --color-bg: #FAF7F2;           /* 米白背景 */
  --color-primary: #4A2C1A;      /* 深棕主色 */
  --color-accent: #C4956A;       /* 焦糖辅色 */
  --radius-sm/md/lg/xl/full: ...;/* 圆角层级 */
  --shadow-sm/md/lg/xl: ...;     /* 阴影层级 */
  --font-serif/sans: ...;        /* 思源宋体/黑体 */
  --ease-spring: ...;            /* 弹性曲线 */
}
```

底下还有一份基础 reset（margin/padding 清零、body 背景、h1-h6 字体、button 默认样式）+ 7 组 `@keyframes` 动画（fadeInUp / scaleIn / bounceSoft / cartBounce / slideInRight / floatUp / flyToCart）。

**[App.css](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/styles/App.css)** — 具体类名样式（导航栏、菜单页、商品卡片、购物车页、成功页），全部消费上面的 CSS 变量。组件里偶尔有 `style={{ ... }}` 是规格弹窗那种一次性布局，不抽类。

改颜色/圆角/阴影**只动 theme.css**，别去 App.css 里硬编码改数值。

---

## 八、规格系统（温度/杯型）

全在 [utils/price.ts](file:///D:/code/ai-prompt/solo-chrome-dev-F12/repos/repo102/project102/src/utils/price.ts) 的 `SPEC_GROUPS`：

```typescript
export const SPEC_GROUPS = [
  {
    key: 'temperature', label: '温度', icon: '🌡️',
    options: [
      { value: 'iced',  label: '冰', icon: '🧊', priceDelta: 0 },
      { value: 'hot',   label: '热', icon: '🔥', priceDelta: 0 }
    ]
  },
  {
    key: 'cupSize', label: '杯型', icon: '🥤',
    options: [
      { value: 'medium', label: '中杯', suffix: 'M', priceDelta: 0 },
      { value: 'large',  label: '大杯', suffix: 'L', priceDelta: 3 }
    ]
  }
];
```

加新选项（比如「甜度」「浓度」）三步走：
1. `ProductSpec` 接口加字段
2. `SPEC_GROUPS` 加一组配置（含每个选项的 `priceDelta`）
3. `DEFAULT_SPEC` 给默认值

ProductCard 的弹窗是 `SPEC_GROUPS.map(...)` 动态渲染的，**不用改模板**，价格计算 `calcPrice()` 也是遍历 SPEC_GROUPS，自动累加 delta。

---

看到这里应该足够定位问题了。改代码前先确认好你动的是「数据 / 价格 / 样式 / 状态 / 页面」哪一层，按上面的文件映射找对应文件就不会乱。
