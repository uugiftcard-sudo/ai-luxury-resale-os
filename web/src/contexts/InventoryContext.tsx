/**
 * InventoryContext — manages inventory/warehouse state.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { inventoryApi } from '../api/inventory';
import type { InventoryItem, InventoryTransaction, InventoryFormData, InventoryStats } from '../types/warehouse';

interface InventoryContextValue {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  stats: InventoryStats;
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  createItem: (form: InventoryFormData) => Promise<InventoryItem>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  inbound: (data: Parameters<typeof inventoryApi.inbound>[0]) => Promise<void>;
  outbound: (data: Parameters<typeof inventoryApi.outbound>[0]) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ totalSKUs: 0, totalStock: 0, lowStockCount: 0, outOfStockCount: 0, totalValue: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, txsData, statsData] = await Promise.all([
        inventoryApi.list(),
        inventoryApi.getTransactions(),
        inventoryApi.getStats(),
      ]);
      setItems(itemsData);
      setTransactions(txsData);
      setStats(statsData);
    } catch {
      setError('加载数据失败，请刷新重试。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    inventoryApi.seedDemo();
    refreshAll();
  }, [refreshAll]);

  const createItem = useCallback(async (form: InventoryFormData): Promise<InventoryItem> => {
    const item = await inventoryApi.create(form);
    setItems(prev => [...prev, item]);
    await refreshAll();
    return item;
  }, [refreshAll]);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
    await inventoryApi.update(id, updates);
    await refreshAll();
  }, [refreshAll]);

  const inbound = useCallback(async (data: Parameters<typeof inventoryApi.inbound>[0]): Promise<void> => {
    await inventoryApi.inbound(data);
    await refreshAll();
  }, [refreshAll]);

  const outbound = useCallback(async (data: Parameters<typeof inventoryApi.outbound>[0]): Promise<void> => {
    await inventoryApi.outbound(data);
    await refreshAll();
  }, [refreshAll]);

  return (
    <InventoryContext.Provider value={{ items, transactions, stats, loading, error, refreshAll, createItem, updateItem, inbound, outbound }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
