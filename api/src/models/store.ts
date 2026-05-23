/**
 * 内存数据存储
 * 初始化种子数据，支持增删改查操作
 */
import { Product, Order, Brand, Category } from './types';

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

// ==================== 商品种子数据 ====================
export const products: Product[] = [
  {
    id: 'p001',
    title: 'Gucci GG Marmont 链条斜挎包 黑色',
    brand: 'Gucci',
    category: '包袋',
    price: 6800,
    originalPrice: 19500,
    condition: '几乎全新',
    size: 'Mini',
    description: '2023年购入，仅试背过一次，配件齐全，防尘袋包装。外观无划痕，内里干净。链条未氧化。五金光泽完好。',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    ],
    platform: 'Depop',
    status: '待售',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'p002',
    title: 'Chanel Classic Flap 中号 黑色羊皮',
    brand: 'Chanel',
    category: '包袋',
    price: 42000,
    originalPrice: 76000,
    condition: '轻微使用痕迹',
    size: 'Medium',
    description: '2019年款，使用频率较低，整体成色很好。金属扣无氧化，包角轻微磨损（已拍摄细节图）。附原始购买小票复印件。',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    ],
    platform: 'Vestiaire',
    status: '待售',
    createdAt: '2024-01-16T14:30:00Z',
  },
  {
    id: 'p003',
    title: 'Prada Re-Edition 2005 三角包 红色',
    brand: 'Prada',
    category: '包袋',
    price: 4200,
    originalPrice: 13900,
    condition: '全新',
    size: 'One Size',
    description: '官网购入，盒子配件齐全未拆封。时尚博主同款，颜色非常正。',
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-17T09:15:00Z',
  },
  {
    id: 'p004',
    title: 'Louis Vuitton Alma BB 老花 手提包',
    brand: 'Louis Vuitton',
    category: '包袋',
    price: 7800,
    originalPrice: 14100,
    condition: '轻微使用痕迹',
    size: 'BB',
    description: '2018年购入，平时使用较多，但保养得当。皮革已自然变色（lv老花特点），四角无破损，拉链顺畅。',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    ],
    platform: '小红书',
    status: '待售',
    createdAt: '2024-01-18T16:45:00Z',
  },
  {
    id: 'p005',
    title: 'Dior Book Tote 蓝色 Toile de Jouy',
    brand: 'Dior',
    category: '包袋',
    price: 14500,
    originalPrice: 28000,
    condition: '几乎全新',
    size: 'One Size',
    description: '出差时购入，仅使用过一次。刺绣精致，无任何瑕疵。内有防尘袋和包装盒。',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-19T11:20:00Z',
  },
  {
    id: 'p006',
    title: 'Hermès Birkin 25 黑色Togo皮',
    brand: 'Hermès',
    category: '包袋',
    price: 120000,
    originalPrice: 85000,
    condition: '全新',
    size: '25cm',
    description: '专柜配货购入，从未使用。带锁具、钥匙、防尘袋、雨衣、小票。爱马仕铂金包，收藏级。',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'p007',
    title: 'Balenciaga Hourglass 沙漏包 白色',
    brand: 'Balenciaga',
    category: '包袋',
    price: 6800,
    originalPrice: 19900,
    condition: '几乎全新',
    size: 'Small',
    description: '季末折扣购入，背了两次。皮质很好，有轻微使用痕迹（已在图上标注）。整体成色新。',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-21T13:10:00Z',
  },
  {
    id: 'p008',
    title: 'Celine Triomphe 豆腐包 焦糖色',
    brand: 'Celine',
    category: '包袋',
    price: 8900,
    originalPrice: 24500,
    condition: '全新',
    size: 'Small',
    description: '欧洲旅游时购入，多买了一支。全新带盒，配件齐全。',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-22T10:40:00Z',
  },
  {
    id: 'p009',
    title: 'Burberry 格纹羊毛大衣 驼色',
    brand: 'Burberry',
    category: '服饰',
    price: 5200,
    originalPrice: 15900,
    condition: '轻微使用痕迹',
    size: 'M',
    description: '2022年购入，秋冬季穿了几次。羊毛面料，格纹经典款。内衬干净，无脱线。',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-23T15:30:00Z',
  },
  {
    id: 'p010',
    title: 'Gucci GG Supreme 双肩背包 老花',
    brand: 'Gucci',
    category: '包袋',
    price: 5800,
    originalPrice: 11500,
    condition: '几乎全新',
    size: 'One Size',
    description: '朋友送的礼物，自己已经有一款类似的。全新未拆封，适合日常通勤。',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-24T09:00:00Z',
  },
  {
    id: 'p011',
    title: 'Chanel 双色玛丽珍鞋 黑色漆皮',
    brand: 'Chanel',
    category: '鞋履',
    price: 3800,
    originalPrice: 6950,
    condition: '全新',
    size: '36',
    description: '欧洲购入，尺码不合适所以转让。全新带原盒，无穿着痕迹。',
    images: [
      'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'p012',
    title: 'Prada 乐福鞋 亮面黑色',
    brand: 'Prada',
    category: '鞋履',
    price: 2800,
    originalPrice: 7500,
    condition: '轻微使用痕迹',
    size: '38',
    description: '穿了2次，皮质依旧光亮。鞋底有轻微磨损，不影响外观。附鞋撑和防尘袋。',
    images: [
      'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800',
    ],
    status: '待售',
    createdAt: '2024-01-26T14:00:00Z',
  },
];

// ==================== 订单数据 ====================
export const orders: Order[] = [
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

// ==================== 辅助函数 ====================

// 生成唯一ID
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

// 根据ID查找商品
export function findProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// 根据ID查找订单
export function findOrderById(id: string): Order | undefined {
  return orders.find(o => o.id === id);
}
