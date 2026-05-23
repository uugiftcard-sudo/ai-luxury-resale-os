/**
 * CLOTH 共享类型定义
 */

// ==================== 商品相关 ====================
export type ProductStatus = '待售' | '已售' | '已下架';

export type ProductCondition =
  | '全新'
  | '几乎全新'
  | '轻微使用痕迹'
  | '有明显使用痕迹';

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: ProductCondition;
  size: string;
  description: string;
  images: string[];
  platform?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt?: string;
}

// ==================== 订单相关 ====================
export type OrderStatus =
  | '待付款'
  | '待发货'
  | '已发货'
  | '已完成'
  | '已取消';

export interface BuyerInfo {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  productId: string;
  buyerInfo: BuyerInfo;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  product?: Product;
}

// ==================== 品牌 & 分类 ====================
export interface Brand {
  id: string;
  name: string;
  nameEn: string;
  logo?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

// ==================== API 响应 ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== 筛选参数 ====================
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

// ==================== 购物车 ====================
export interface CartItem {
  product: Product;
  quantity: number;
}

// ==================== 订单表单 ====================
export interface OrderFormData {
  productId: string;
  buyerInfo: BuyerInfo;
}
