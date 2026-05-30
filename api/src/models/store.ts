/**
 * SQLite-backed data store.
 * All products have a `market` field so the API can filter by region.
 * Shared products (market: 'ALL') appear in every region.
 * Market-specific products only appear in their region.
 */
import { Product, Order, Brand, Category, OrderStatus } from './types';
import { createSqliteCollection } from '../db';

type MarketScope = 'UK' | 'HK' | 'CN' | 'ALL';

function mkProduct(overrides: Partial<Product> & { id: string; title: string; brand: string; category: string; price: number; originalPrice: number; condition: Product['condition']; size: string; description: string; images: string[]; market: MarketScope }, market: MarketScope = 'ALL'): Product {
  return {
    id: overrides.id,
    title: overrides.title,
    brand: overrides.brand,
    category: overrides.category,
    price: overrides.price,
    originalPrice: overrides.originalPrice,
    condition: overrides.condition,
    size: overrides.size,
    description: overrides.description,
    images: overrides.images,
    platform: overrides.platform,
    status: '待售',
    createdAt: overrides.createdAt ?? '2024-01-15T10:00:00Z',
    market: overrides.market ?? market,
  };
}

// ==================== 品牌数据 ====================
export const brands: Brand[] = [
  { id: '1', name: '古驰', nameEn: 'Gucci', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Gucci_logo.svg/200px-Gucci_logo.svg.png' },
  { id: '2', name: '普拉达', nameEn: 'Prada', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Prada_logo.svg/200px-Prada_logo.svg.png' },
  { id: '3', name: '香奈儿', nameEn: 'Chanel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Chanel_logo.svg/200px-Chanel_logo.svg.png' },
  { id: '4', name: '路易威登', nameEn: 'Louis Vuitton', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Louis_Vuitton_logo_%28vector%29.svg/200px-Louis_Vuitton_logo_%28vector%29.svg.png' },
  { id: '5', name: '迪奥', nameEn: 'Dior', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Dior_Logo.svg/200px-Dior_Logo.svg.png' },
  { id: '6', name: '爱马仕', nameEn: 'Hermès', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Herm%C3%A8s_Paris.svg/200px-Herm%C3%A8s_Paris.svg.png' },
  { id: '7', name: '博柏利', nameEn: 'Burberry', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Burberry_logo.svg/200px-Burberry_logo.svg.png' },
  { id: '8', name: '巴黎世家', nameEn: 'Balenciaga', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Balenciaga_logo.svg/200px-Balenciaga_logo.svg.png' },
  { id: '9', name: '芬迪', nameEn: 'Fendi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Fendi_logo.svg/200px-Fendi_logo.svg.png' },
  { id: '10', name: '赛琳', nameEn: 'Celine', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Celine_logo.svg/200px-Celine_logo.svg.png' },
];

// ==================== 分类数据 ====================
export const categories: Category[] = [
  { id: '1', name: '包袋', icon: '👜' },
  { id: '2', name: '服饰', icon: '👗' },
  { id: '3', name: '鞋履', icon: '👠' },
  { id: '4', name: '配饰', icon: '⌚' },
  { id: '5', name: '珠宝', icon: '💎' },
];

// ==================== 商品种子数据 (CNY prices) ====================
// CNY base prices — UK/HK will see converted GBP/HKD amounts on the frontend.
const _seedProducts: Product[] = [
  // ── 包袋 (Bags) ──────────────────────────────────────────────────────────
  mkProduct({
    id: 'p001', market: 'ALL',
    title: 'Gucci GG Marmont 链条斜挎包 黑色',
    brand: 'Gucci', category: '包袋',
    price: 6800, originalPrice: 19500,
    condition: '几乎全新', size: 'Mini',
    description: '2023年购入，仅试背过一次，配件齐全，防尘袋包装。外观无划痕，内里干净。链条未氧化。五金光泽完好。',
    images: [
      '/images/bag1.jpg',
      '/images/bag2.jpg',
    ],
    platform: 'Depop', createdAt: '2024-01-15T10:00:00Z',
  }),
  mkProduct({
    id: 'p002', market: 'ALL',
    title: 'Chanel Classic Flap 中号 黑色羊皮',
    brand: 'Chanel', category: '包袋',
    price: 42000, originalPrice: 76000,
    condition: '轻微使用痕迹', size: 'Medium',
    description: '2019年款，使用频率较低，整体成色很好。金属扣无氧化，包角轻微磨损（已拍摄细节图）。附原始购买小票复印件。',
    images: [
      '/images/bag2.jpg',
      '/images/bag1.jpg',
    ],
    platform: 'Vestiaire', createdAt: '2024-01-16T14:30:00Z',
  }),
  mkProduct({
    id: 'p003', market: 'ALL',
    title: 'Prada Re-Edition 2005 三角包 红色',
    brand: 'Prada', category: '包袋',
    price: 4200, originalPrice: 13900,
    condition: '全新', size: 'One Size',
    description: '官网购入，盒子配件齐全未拆封。时尚博主同款，颜色非常正。',
    images: [
      '/images/bag3.jpg',
      '/images/bag1.jpg',
    ],
    createdAt: '2024-01-17T09:15:00Z',
  }),
  mkProduct({
    id: 'p004', market: 'ALL',
    title: 'Louis Vuitton Alma BB 老花 手提包',
    brand: 'Louis Vuitton', category: '包袋',
    price: 7800, originalPrice: 14100,
    condition: '轻微使用痕迹', size: 'BB',
    description: '2018年购入，平时使用较多，但保养得当。皮革已自然变色（lv老花特点），四角无破损，拉链顺畅。',
    images: [
      '/images/bag4.jpg',
      '/images/bag1.jpg',
    ],
    platform: '小红书', createdAt: '2024-01-18T16:45:00Z',
  }),
  mkProduct({
    id: 'p005', market: 'ALL',
    title: 'Dior Book Tote 蓝色 Toile de Jouy',
    brand: 'Dior', category: '包袋',
    price: 14500, originalPrice: 28000,
    condition: '几乎全新', size: 'One Size',
    description: '出差时购入，仅使用过一次。刺绣精致，无任何瑕疵。内有防尘袋和包装盒。',
    images: [
      '/images/bag1.jpg',
      '/images/bag2.jpg',
    ],
    createdAt: '2024-01-19T11:20:00Z',
  }),
  mkProduct({
    id: 'p006', market: 'ALL',
    title: 'Hermès Birkin 25 黑色Togo皮',
    brand: 'Hermès', category: '包袋',
    price: 120000, originalPrice: 85000,
    condition: '全新', size: '25cm',
    description: '专柜配货购入，从未使用。带锁具、钥匙、防尘袋、雨衣、小票。爱马仕铂金包，收藏级。',
    images: [
      '/images/bag5.jpg',
      '/images/bag1.jpg',
    ],
    createdAt: '2024-01-20T08:00:00Z',
  }),
  mkProduct({
    id: 'p007', market: 'ALL',
    title: 'Balenciaga Hourglass 沙漏包 白色',
    brand: 'Balenciaga', category: '包袋',
    price: 6800, originalPrice: 19900,
    condition: '几乎全新', size: 'Small',
    description: '季末折扣购入，背了两次。皮质很好，有轻微使用痕迹（已在图上标注）。整体成色新。',
    images: [
      '/images/bag4.jpg',
      '/images/bag2.jpg',
    ],
    createdAt: '2024-01-21T13:10:00Z',
  }),
  mkProduct({
    id: 'p008', market: 'ALL',
    title: 'Celine Triomphe 豆腐包 焦糖色',
    brand: 'Celine', category: '包袋',
    price: 8900, originalPrice: 24500,
    condition: '全新', size: 'Small',
    description: '欧洲旅游时购入，多买了一支。全新带盒，配件齐全。',
    images: [
      '/images/bag1.jpg',
      '/images/bag2.jpg',
    ],
    createdAt: '2024-01-22T10:40:00Z',
  }),
  // ── 服饰 (Clothing) ────────────────────────────────────────────────────────
  mkProduct({
    id: 'p009', market: 'ALL',
    title: 'Burberry 格纹羊毛大衣 驼色',
    brand: 'Burberry', category: '服饰',
    price: 5200, originalPrice: 15900,
    condition: '轻微使用痕迹', size: 'M',
    description: '2022年购入，秋冬季穿了几次。羊毛面料，格纹经典款。内衬干净，无脱线。',
    images: [
      '/images/bag6.jpg',
      '/images/clothing1.jpg',
    ],
    createdAt: '2024-01-23T15:30:00Z',
  }),
  mkProduct({
    id: 'p010', market: 'ALL',
    title: 'Gucci GG Supreme 双肩背包 老花',
    brand: 'Gucci', category: '包袋',
    price: 5800, originalPrice: 11500,
    condition: '几乎全新', size: 'One Size',
    description: '朋友送的礼物，自己已经有一款类似的。全新未拆封，适合日常通勤。',
    images: [
      '/images/bag4.jpg',
      '/images/bag1.jpg',
    ],
    createdAt: '2024-01-24T09:00:00Z',
  }),
  // ── 鞋履 (Shoes) ───────────────────────────────────────────────────────────
  mkProduct({
    id: 'p011', market: 'ALL',
    title: 'Chanel 双色玛丽珍鞋 黑色漆皮',
    brand: 'Chanel', category: '鞋履',
    price: 3800, originalPrice: 6950,
    condition: '全新', size: '36',
    description: '欧洲购入，尺码不合适所以转让。全新带原盒，无穿着痕迹。',
    images: [
      '/images/shoes1.jpg',
    ],
    createdAt: '2024-01-25T12:00:00Z',
  }),
  mkProduct({
    id: 'p012', market: 'ALL',
    title: 'Prada 乐福鞋 亮面黑色',
    brand: 'Prada', category: '鞋履',
    price: 2800, originalPrice: 7500,
    condition: '轻微使用痕迹', size: '38',
    description: '穿了2次，皮质依旧光亮。鞋底有轻微磨损，不影响外观。附鞋撑和防尘袋。',
    images: [
      '/images/shoes1.jpg',
    ],
    createdAt: '2024-01-26T14:00:00Z',
  }),
  // ── UK-only products ─────────────────────────────────────────────────────────
  mkProduct({
    id: 'pUK001', market: 'UK',
    title: 'Gucci Horsebit 1955 Mini Crossbody 象牙白',
    brand: 'Gucci', category: '包袋',
    price: 5200, originalPrice: 14900,
    condition: '几乎全新', size: 'Mini',
    description: 'Purchased from Harrods in 2023, tried once. Comes with box, dust bag and receipt copy. Hardware perfectly polished.',
    images: [
      '/images/bag1.jpg',
      '/images/bag3.jpg',
    ],
    platform: 'Selfridges', createdAt: '2024-02-01T10:00:00Z',
  }),
  mkProduct({
    id: 'pUK002', market: 'UK',
    title: 'Louis Vuitton Neverfull MM Damier Ebene',
    brand: 'Louis Vuitton', category: '包袋',
    price: 4800, originalPrice: 10900,
    condition: '轻微使用痕迹', size: 'MM',
    description: 'Bought 2021, used weekly for 18 months. Interior immaculate, exterior shows light handle wear. A reliable everyday tote.',
    images: [
      '/images/bag4.jpg',
    ],
    platform: 'eBay', createdAt: '2024-02-03T11:00:00Z',
  }),
  mkProduct({
    id: 'pUK003', market: 'UK',
    title: 'Burberry Kensington Trench Coat 蜂蜜色',
    brand: 'Burberry', category: '服饰',
    price: 7500, originalPrice: 22900,
    condition: '全新', size: 'UK 8',
    description: 'Brand new with tags — ordered the wrong size. Classic honey gabardine trench, all original buttons and belt included.',
    images: [
      '/images/bag6.jpg',
    ],
    platform: 'Burberry.com', createdAt: '2024-02-05T09:00:00Z',
  }),
  // ── HK-only products ─────────────────────────────────────────────────────────
  mkProduct({
    id: 'pHK001', market: 'HK',
    title: 'Chanel Classic Flap 小号 粉肤色 lambskin',
    brand: 'Chanel', category: '包袋',
    price: 38500, originalPrice: 72000,
    condition: '几乎全新', size: 'Small',
    description: '2023年專門店購入，只試用過一次。附完整包裝、防塵袋及專門店單據副本。性價比極高。',
    images: [
      '/images/bag2.jpg',
      '/images/bag1.jpg',
    ],
    platform: '專門店', createdAt: '2024-02-01T14:00:00Z',
  }),
  mkProduct({
    id: 'pHK002', market: 'HK',
    title: 'Hermès Constance 18 黑色 epsom 金扣',
    brand: 'Hermès', category: '包袋',
    price: 95000, originalPrice: 78000,
    condition: '全新', size: '18cm',
    description: '專門店配貨購入，從未使用。附鎖頭、鑰匙全套配件。收藏價值極高。',
    images: [
      '/images/bag5.jpg',
    ],
    createdAt: '2024-02-02T10:00:00Z',
  }),
  mkProduct({
    id: 'pHK003', market: 'HK',
    title: 'Dior Saddle 馬鞍包 黑色經典款',
    brand: 'Dior', category: '包袋',
    price: 11500, originalPrice: 32000,
    condition: '轻微使用痕迹', size: 'One Size',
    description: '中古購入，使用次數不多。皮革狀態良好，金屬扣輕微磨損（已拍細節圖）。適合日常使用。',
    images: [
      '/images/bag1.jpg',
    ],
    platform: 'Vestiaire', createdAt: '2024-02-04T16:00:00Z',
  }),
];

// SQLite product store — mutable at runtime and persistent across restarts.
const productCollection = createSqliteCollection<Product>(
  'products',
  'id',
  (product) => product.id,
  _seedProducts
);

// ==================== 订单数据 ====================
const _seedOrders: Order[] = [
  {
    id: 'o001',
    productId: 'p001',
    buyerInfo: {
      name: '张小明',
      phone: '13812345678',
      address: '上海市静安区南京西路1266号',
    },
    status: '待发货',
    totalPrice: 6800,
    createdAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 'o002',
    productId: 'p003',
    buyerInfo: {
      name: '李婷婷',
      phone: '13987654321',
      address: '北京市朝阳区三里屯太古里北区',
    },
    status: '已发货',
    totalPrice: 4200,
    createdAt: '2024-01-26T16:30:00Z',
  },
];

const orderCollection = createSqliteCollection<Order>(
  'orders',
  'id',
  (order) => order.id,
  _seedOrders
);

export const products = productCollection.asArray();
export const orders = orderCollection.asArray();

// ==================== 辅助函数 ====================

export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

export function findProductById(id: string): Product | undefined {
  return productCollection.find(p => p.id === id);
}

export function findOrderById(id: string): Order | undefined {
  return orderCollection.find(o => o.id === id);
}

export function listProducts(): Product[] {
  return productCollection.findAll();
}

export function saveProduct(product: Product): Product {
  return productCollection.upsert(product);
}

export function updateProduct(id: string, changes: Partial<Product>): Product | undefined {
  const current = findProductById(id);
  if (!current) return undefined;
  return saveProduct({
    ...current,
    ...changes,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: changes.updatedAt ?? new Date().toISOString(),
  });
}

export function listOrders(): Order[] {
  return orderCollection.findAll();
}

export function saveOrder(order: Order): Order {
  return orderCollection.upsert(order);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const current = findOrderById(id);
  if (!current) return undefined;
  return saveOrder({
    ...current,
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Returns products visible in a given market scope.
 * 'ALL' products appear everywhere; market-specific products only in their region.
 */
export function filterProductsByMarket(market: string) {
  const allProducts = productCollection.findAll();
  if (!market || market === 'ALL') return allProducts;
  return allProducts.filter(p => p.market === 'ALL' || p.market === market);
}
