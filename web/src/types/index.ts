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

// ==================== 客服系统 ====================
export type SupportTicketType = 'inquiry' | 'return' | 'exchange' | 'repair';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  ticketNo: string;
  type: SupportTicketType;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  orderId?: string;
  priority: SupportTicketPriority;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  sender: 'customer' | 'admin';
  message: string;
  createdAt: string;
}

export interface SupportTicketFormData {
  type: SupportTicketType;
  subject: string;
  description: string;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface SupportFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// ==================== 仓储系统 ====================
export type InventoryTransactionType = 'inbound' | 'outbound' | 'adjustment' | 'return';

export interface InventoryItem {
  id: string;
  sku: string;
  productId?: string;
  productName: string;
  brand?: string;
  category?: string;
  size?: string;
  color?: string;
  condition?: string;
  currentStock: number;
  minStockThreshold: number;
  unitCost?: number;
  unitPrice?: number;
  location?: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceNo?: string;
  notes?: string;
  operator?: string;
  createdAt: string;
}

export interface InventoryFormData {
  sku: string;
  productId?: string;
  productName: string;
  brand?: string;
  category?: string;
  size?: string;
  color?: string;
  condition?: string;
  currentStock: number;
  minStockThreshold?: number;
  unitCost?: number;
  unitPrice?: number;
  location?: string;
  supplier?: string;
  notes?: string;
}

// ==================== 财务系统 ====================
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

export interface FinanceRecord {
  id: string;
  type: FinanceType;
  category: FinanceCategory;
  amount: number;
  description: string;
  date: string;
  relatedOrderId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FinanceRecordFormData {
  type: FinanceType;
  category: FinanceCategory;
  amount: string;
  description: string;
  date: string;
  relatedOrderId?: string;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
}

export interface InventoryStats {
  totalSKUs: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}
