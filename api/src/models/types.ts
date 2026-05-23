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

// 商品接口
export interface Product {
  id: string;
  title: string;           // 商品标题
  brand: string;           // 品牌：Gucci, Prada, Chanel, etc.
  category: string;        // 分类：包、衣服、鞋、配饰
  price: number;            // 售价
  originalPrice: number;    // 原价
  condition: ProductCondition;
  size: string;             // 尺寸
  description: string;      // 商品描述
  images: string[];         // 图片URL列表
  platform?: string;        // 来源平台
  status: ProductStatus;
  createdAt: string;
  updatedAt?: string;
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
