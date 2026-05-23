/**
 * CLOTH Mock Storage Layer
 * Simulates a backend database using localStorage.
 * Replace with real Supabase API calls once credentials are configured.
 */

const STORAGE_KEYS = {
  SUPPORT_TICKETS: 'cloth_support_tickets',
  SUPPORT_MESSAGES: 'cloth_support_messages',
  INVENTORY: 'cloth_inventory',
  INVENTORY_TRANSACTIONS: 'cloth_inventory_transactions',
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateTicketNo(): string {
  const year = new Date().getFullYear();
  const key = 'cloth_ticket_seq';
  const seq = parseInt(localStorage.getItem(key) ?? '0', 10) + 1;
  localStorage.setItem(key, String(seq));
  return `CS-${year}-${String(seq).padStart(5, '0')}`;
}

function read<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Support Tickets ───────────────────────────────────────────────────────────
export interface StoredTicket {
  id: string;
  ticketNo: string;
  type: 'inquiry' | 'return' | 'exchange' | 'repair';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  orderId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoredMessage {
  id: string;
  ticketId: string;
  sender: 'customer' | 'admin';
  message: string;
  createdAt: string;
}

export const supportStorage = {
  getTickets(): StoredTicket[] {
    return read<StoredTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, []);
  },

  createTicket(data: Omit<StoredTicket, 'id' | 'ticketNo' | 'createdAt'>): StoredTicket {
    const tickets = this.getTickets();
    const ticket: StoredTicket = {
      ...data,
      id: generateId(),
      ticketNo: generateTicketNo(),
      createdAt: new Date().toISOString(),
    };
    tickets.unshift(ticket);
    write(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return ticket;
  },

  updateTicket(id: string, updates: Partial<StoredTicket>): StoredTicket | null {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tickets[idx] = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() };
    write(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return tickets[idx];
  },

  getTicketById(id: string): StoredTicket | null {
    return this.getTickets().find(t => t.id === id) ?? null;
  },

  getMessages(ticketId: string): StoredMessage[] {
    return read<StoredMessage[]>(STORAGE_KEYS.SUPPORT_MESSAGES, [])
      .filter(m => m.ticketId === ticketId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  addMessage(data: Omit<StoredMessage, 'id' | 'createdAt'>): StoredMessage {
    const messages = read<StoredMessage[]>(STORAGE_KEYS.SUPPORT_MESSAGES, []);
    const msg: StoredMessage = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    messages.push(msg);
    write(STORAGE_KEYS.SUPPORT_MESSAGES, messages);
    return msg;
  },

  seedDemoTickets(): void {
    if (this.getTickets().length > 0) return;
    const demoTickets: StoredTicket[] = [
      {
        id: generateId(),
        ticketNo: 'CS-2026-00001',
        type: 'inquiry',
        status: 'open',
        subject: '订单 CS20260520001 的发货进度查询',
        description: '您好，我于 5 月 20 日下单购买的 Gucci 迷你肩背包，请问预计什么时候发货？',
        orderId: 'CS20260520001',
        priority: 'normal',
        customerName: '王小明',
        customerEmail: 'xiaoming@example.com',
        customerPhone: '13812345678',
        createdAt: '2026-05-20T09:30:00Z',
      },
      {
        id: generateId(),
        ticketNo: 'CS-2026-00002',
        type: 'return',
        status: 'in_progress',
        subject: 'Chanel 链条包尺码不符申请退换',
        description: '收到实物后尺寸与描述不符，申请退换货处理，请尽快联系我。',
        orderId: 'CS20260515002',
        priority: 'high',
        customerName: '李小姐',
        customerEmail: 'lixiaojie@example.com',
        customerPhone: '13987654321',
        adminReply: '您好，我们已收到您的退换申请，正在处理中，预计 2 个工作日内回复。',
        createdAt: '2026-05-15T14:20:00Z',
        updatedAt: '2026-05-16T10:00:00Z',
      },
      {
        id: generateId(),
        ticketNo: 'CS-2026-00003',
        type: 'repair',
        status: 'resolved',
        subject: 'Prada 钱包五金件氧化保养咨询',
        description: '购买 Prada 皮质钱包已使用一年，五金出现氧化，请问有提供保养维修服务吗？',
        priority: 'low',
        customerName: '陈先生',
        customerEmail: 'chen@example.com',
        createdAt: '2026-05-01T11:00:00Z',
        updatedAt: '2026-05-03T16:00:00Z',
        adminReply: '您好，我们目前暂不提供维修服务，建议您联系品牌官方售后或专业皮具护理店保养。',
      },
    ];
    write(STORAGE_KEYS.SUPPORT_TICKETS, demoTickets);
  },
};

// ── Inventory ─────────────────────────────────────────────────────────────────
export interface StoredInventoryItem {
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

export interface StoredInventoryTransaction {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  type: 'inbound' | 'outbound' | 'adjustment' | 'return';
  quantity: number;
  referenceNo?: string;
  notes?: string;
  operator?: string;
  createdAt: string;
}

export const inventoryStorage = {
  getItems(): StoredInventoryItem[] {
    return read<StoredInventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
  },

  getItemById(id: string): StoredInventoryItem | null {
    return this.getItems().find(i => i.id === id) ?? null;
  },

  createItem(data: Omit<StoredInventoryItem, 'id' | 'createdAt' | 'minStockThreshold'> & { id?: string; createdAt?: string; minStockThreshold?: number }): StoredInventoryItem {
    const items = this.getItems();
    const item: StoredInventoryItem = {
      ...data,
      id: data.id ?? generateId(),
      createdAt: data.createdAt ?? new Date().toISOString(),
      minStockThreshold: data.minStockThreshold ?? 3,
    };
    items.push(item);
    write(STORAGE_KEYS.INVENTORY, items);
    return item;
  },

  updateItem(id: string, updates: Partial<StoredInventoryItem>): StoredInventoryItem | null {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    write(STORAGE_KEYS.INVENTORY, items);
    return items[idx];
  },

  adjustStock(id: string, delta: number): StoredInventoryItem | null {
    const item = this.getItemById(id);
    if (!item) return null;
    const newStock = Math.max(0, item.currentStock + delta);
    return this.updateItem(id, { currentStock: newStock });
  },

  getTransactions(): StoredInventoryTransaction[] {
    return read<StoredInventoryTransaction[]>(STORAGE_KEYS.INVENTORY_TRANSACTIONS, [])
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  addTransaction(data: Omit<StoredInventoryTransaction, 'id' | 'createdAt'>): StoredInventoryTransaction {
    const txs = this.getTransactions();
    const tx: StoredInventoryTransaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    txs.unshift(tx);
    write(STORAGE_KEYS.INVENTORY_TRANSACTIONS, txs);
    return tx;
  },

  seedDemoInventory(): void {
    if (this.getItems().length > 0) return;
    const now = new Date().toISOString();
    const demoItems: StoredInventoryItem[] = [
      {
        id: generateId(), sku: 'GC-BAG-001', productName: 'Gucci GG Marmont 链条肩背包',
        brand: 'Gucci', category: '包袋', size: 'Mini', color: '米色/金色',
        condition: '几乎全新', currentStock: 2, minStockThreshold: 3,
        unitCost: 4200, unitPrice: 6800, location: 'A-01-2', supplier: '欧洲直采', createdAt: now,
      },
      {
        id: generateId(), sku: 'CH-BAG-002', productName: 'Chanel Classic Flap 单宁包',
        brand: 'Chanel', category: '包袋', size: 'Medium', color: '丹宁蓝',
        condition: '轻微使用痕迹', currentStock: 1, minStockThreshold: 2,
        unitCost: 18000, unitPrice: 28000, location: 'B-03-1', supplier: '日本中古', createdAt: now,
      },
      {
        id: generateId(), sku: 'PR-SHOE-003', productName: 'Prada 乐福鞋 漆皮',
        brand: 'Prada', category: '鞋履', size: '38', color: '黑色',
        condition: '全新', currentStock: 0, minStockThreshold: 2,
        unitCost: 2400, unitPrice: 3900, location: 'C-02-4', supplier: '欧洲直采', createdAt: now,
      },
      {
        id: generateId(), sku: 'LV-CLO-004', productName: 'Louis Vuitton 老花拼接卫衣',
        brand: 'Louis Vuitton', category: '服饰', size: 'M', color: '老花/白色',
        condition: '几乎全新', currentStock: 1, minStockThreshold: 2,
        unitCost: 1600, unitPrice: 2600, location: 'A-04-3', supplier: '欧洲直采', createdAt: now,
      },
      {
        id: generateId(), sku: 'HM-BAG-005', productName: 'Hermès Birkin 25 金扣 Togo',
        brand: 'Hermès', category: '包袋', size: '25', color: '黑色/金色',
        condition: '全新', currentStock: 1, minStockThreshold: 1,
        unitCost: 65000, unitPrice: 98000, location: '保险柜-01', supplier: 'VIP客户寄存', createdAt: now,
      },
    ];
    write(STORAGE_KEYS.INVENTORY, demoItems);
  },
};
