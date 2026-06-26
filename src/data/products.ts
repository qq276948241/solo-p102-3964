import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: 'latte', name: '拿铁', icon: '☕' },
  { id: 'americano', name: '美式', icon: '🫖' },
  { id: 'pour-over', name: '手冲', icon: '🫗' },
  { id: 'dessert', name: '甜点', icon: '🍰' }
];

export const products: Product[] = [
  {
    id: 'latte-001',
    name: '招牌燕麦拿铁',
    description: '醇香燕麦奶与意式浓缩的完美融合，丝滑细腻，回味悠长',
    price: 32,
    category: 'latte',
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600&h=450&fit=crop',
    tag: '招牌'
  },
  {
    id: 'latte-002',
    name: '海盐焦糖拿铁',
    description: '手工焦糖酱搭配轻盈海盐，甜咸交织的奇妙味觉体验',
    price: 36,
    category: 'latte',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=450&fit=crop',
    tag: '人气'
  },
  {
    id: 'latte-003',
    name: '玫瑰荔枝拿铁',
    description: '浪漫玫瑰花瓣与清甜荔枝果泥的限定搭配，少女心满满',
    price: 42,
    category: 'latte',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=450&fit=crop',
    tag: '限定'
  },
  {
    id: 'latte-004',
    name: '抹茶红豆拿铁',
    description: '宇治抹茶粉与蜜红豆的经典搭配，东方风味层次分明',
    price: 38,
    category: 'latte',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=450&fit=crop'
  },
  {
    id: 'latte-005',
    name: '榛果香草拿铁',
    description: '烘烤榛果香与甜美香草的温暖组合，适合冬日独享',
    price: 34,
    category: 'latte',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&h=450&fit=crop'
  },
  {
    id: 'latte-006',
    name: '脏脏咖啡',
    description: '冰牛奶撞上温热浓缩，层层分明的视觉与味觉双重享受',
    price: 32,
    category: 'latte',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&h=450&fit=crop',
    tag: '网红'
  },
  {
    id: 'americano-001',
    name: '经典美式',
    description: '精选阿拉比卡豆，醇厚回甘，是咖啡爱好者的日常首选',
    price: 26,
    category: 'americano',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=450&fit=crop'
  },
  {
    id: 'americano-002',
    name: '冰美式',
    description: '双倍浓缩加冰，清爽醒神，工作学习的最佳拍档',
    price: 26,
    category: 'americano',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=450&fit=crop'
  },
  {
    id: 'americano-003',
    name: '柠香美式',
    description: '新鲜黄柠檬汁邂逅意式浓缩，酸甜苦的三重奏',
    price: 30,
    category: 'americano',
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&h=450&fit=crop',
    tag: '新品'
  },
  {
    id: 'americano-004',
    name: '黑糖姜汁美式',
    description: '暖心黑糖配老姜汁，驱寒暖身，女生专属特调',
    price: 32,
    category: 'americano',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop'
  },
  {
    id: 'pour-over-001',
    name: '埃塞俄比亚耶加雪菲',
    description: '柑橘花香与茉莉风味，明亮果酸，清爽干净的余韵',
    price: 58,
    category: 'pour-over',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop',
    tag: '精品'
  },
  {
    id: 'pour-over-002',
    name: '哥伦比亚慧兰',
    description: '焦糖甜感搭配坚果风味，醇厚平衡，适合入门手冲',
    price: 48,
    category: 'pour-over',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=450&fit=crop'
  },
  {
    id: 'pour-over-003',
    name: '肯尼亚AA',
    description: '黑加仑与番茄的复杂果酸，酒香余韵，风味层次丰富',
    price: 62,
    category: 'pour-over',
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=450&fit=crop',
    tag: '店长推荐'
  },
  {
    id: 'pour-over-004',
    name: '云南日晒红樱桃',
    description: '国产精品豆，红糖甜感与红茶尾韵，支持国货之光',
    price: 42,
    category: 'pour-over',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=450&fit=crop',
    tag: '国产'
  },
  {
    id: 'dessert-001',
    name: '提拉米苏',
    description: '马斯卡彭芝士与浓缩咖啡的经典意式甜品，绵密浓郁',
    price: 38,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=450&fit=crop',
    tag: '必点'
  },
  {
    id: 'dessert-002',
    name: '巴斯克芝士蛋糕',
    description: '焦香外皮与流心内馅的完美对比，浓郁芝士香气扑鼻',
    price: 36,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=450&fit=crop'
  },
  {
    id: 'dessert-003',
    name: '抹茶千层',
    description: '宇治抹茶与动物奶油的层层叠加，口感丰富不甜腻',
    price: 42,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd21536583?w=600&h=450&fit=crop',
    tag: '人气'
  },
  {
    id: 'dessert-004',
    name: '可颂三明治',
    description: '层层酥脆的手工可颂搭配火腿芝士，咸香满足',
    price: 32,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=450&fit=crop'
  },
  {
    id: 'dessert-005',
    name: '焦糖布丁',
    description: '滑嫩布丁搭配焦香琥珀色焦糖酱，简单却令人怀念的味道',
    price: 28,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=450&fit=crop'
  },
  {
    id: 'dessert-006',
    name: '蓝莓司康',
    description: '手工制作的酥松司康，内嵌饱满蓝莓果粒，搭配果酱更佳',
    price: 24,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=450&fit=crop'
  }
];
