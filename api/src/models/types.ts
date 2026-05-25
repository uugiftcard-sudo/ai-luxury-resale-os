/**
 * CLOTH 数据模型
 * 定义商品、订单、品牌、分类等核心数据结构
 */

// 商品状态
export type ProductStatus = '待售' | '已售' | '已下架';

// 成色等级
export type ProductCondition =
  | '全新'
  | '几乎全新'
  | '轻微使用痕迹'
  | '有明显使用痕迹';

// 市场范围
export type MarketScope = 'UK' | 'HK' | 'CN' | 'ALL';

// 商品接口
export interface Product {
  id: string;
  title: string;           // 商品标题
  brand: string;           // 品牌：Gucci, Prada, Chanel, etc.
  category: string;        // 分类：包、衣服、鞋、配饰
  price: number;            // 售价 (CNY)
  originalPrice: number;    // 原价 (CNY)
  condition: ProductCondition;
  size: string;             // 尺寸
  description: string;      // 商品描述
  images: string[];         // 图片URL列表
  platform?: string;        // 来源平台
  status: ProductStatus;
  createdAt: string;
  updatedAt?: string;
  market?: MarketScope;     // 所属市场：UK/HK/CN/ALL，未定义时默认ALL
}

// 订单状态
export type OrderStatus =
  | '待付款'
  | '待发货'
  | '已发货'
  | '已完成'
  | '已取消';

// 买家信息
export interface BuyerInfo {
  name: string;
  phone: string;
  address: string;
}

// 订单接口
export interface Order {
  id: string;
  productId: string;
  buyerInfo: BuyerInfo;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
}

// 品牌数据
export interface Brand {
  id: string;
  name: string;             // 中文名
  nameEn: string;           // 英文名
  logo?: string;             // Logo URL
}

// 分类数据
export interface Category {
  id: string;
  name: string;             // 中文名
  icon?: string;            // 图标
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 商品筛选参数
export interface ProductFilter {
  brand?: string;
  category?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// 财务类型
export type FinanceType = '收入' | '支出';

export type FinanceCategory =
  | '商品销售收入'
  | '其他收入'
  | '商品采购'
  | '物流运输'
  | '平台费用'
  | '仓储费用'
  | '营销推广'
  | '人力成本'
  | '税费'
  | '其他支出';

// 财务记录接口
export interface FinanceRecord {
  id: string;
  type: FinanceType;
  category: FinanceCategory;
  amount: number;
  description: string;
  date: string;
  market?: string;
  relatedOrderId?: string;
  createdAt: string;
  updatedAt?: string;
}

// AI 虛擬主播帶貨任務
export type LiveAccountStyle = 'educational' | 'luxury_editor' | 'deal_hunter' | 'community_host';

export interface LiveSellingPlan {
  planId: string;
  productId?: string;
  productTitle: string;
  accountStyle: LiveAccountStyle;
  hook: string;
  script: string;
  interactionPrompts: string[];
  cta: string;
  inventoryCheck: {
    sku?: string;
    status: 'ready' | 'low_stock' | 'out_of_stock' | 'unknown';
    message: string;
  };
  financeCheck: {
    expectedRevenue: number;
    estimatedPlatformFee: number;
    estimatedAdCost: number;
    estimatedInventoryCost: number;
    estimatedRefundReserve: number;
    estimatedNetProfit: number;
  };
  supportNotes: string[];
  safetyNote: string;
  createdAt: string;
}
