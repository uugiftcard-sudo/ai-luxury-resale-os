/**
 * FinanceContext — 全局财务记录状态管理
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { financeApi } from '../api/finance';
import { useMarket } from '../hooks/useMarket';
import type { FinanceRecord, FinanceStats } from '../types';

interface FinanceContextValue {
  records: FinanceRecord[];
  stats: FinanceStats | null;
  loading: boolean;
  refresh: () => void;
  addRecord: (record: FinanceRecord) => void;
  updateRecord: (record: FinanceRecord) => void;
  removeRecord: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { market } = useMarket();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recordData, statsData] = await Promise.all([
        financeApi.list(market),
        financeApi.stats(market),
      ]);
      setRecords(recordData);
      setStats(statsData);
    } catch {
      // silent — error state is already set
    } finally {
      setLoading(false);
    }
  }, [market]);

  useEffect(() => {
    load();
  }, [load]);

  function addRecord(record: FinanceRecord) {
    setRecords(prev => [record, ...prev]);
    setStats(prev => {
      if (!prev) return prev;
      const amount = record.type === '收入' ? record.amount : -record.amount;
      return {
        ...prev,
        totalIncome: prev.totalIncome + (record.type === '收入' ? record.amount : 0),
        totalExpense: prev.totalExpense + (record.type === '支出' ? record.amount : 0),
        netProfit: prev.netProfit + amount,
        incomeCount: prev.incomeCount + (record.type === '收入' ? 1 : 0),
        expenseCount: prev.expenseCount + (record.type === '支出' ? 1 : 0),
      };
    });
  }

  function updateRecord(record: FinanceRecord) {
    setRecords(prev => prev.map(r => r.id === record.id ? record : r));
    load();
  }

  function removeRecord(id: string) {
    setRecords(prev => prev.filter(r => r.id !== id));
    setStats(prev => {
      if (!prev) return prev;
      const removed = records.find(r => r.id === id);
      if (!removed) return prev;
      const amount = removed.type === '收入' ? -removed.amount : removed.amount;
      return {
        ...prev,
        totalIncome: prev.totalIncome - (removed.type === '收入' ? removed.amount : 0),
        totalExpense: prev.totalExpense - (removed.type === '支出' ? removed.amount : 0),
        netProfit: prev.netProfit + amount,
        incomeCount: prev.incomeCount - (removed.type === '收入' ? 1 : 0),
        expenseCount: prev.expenseCount - (removed.type === '支出' ? 1 : 0),
      };
    });
  }

  return (
    <FinanceContext.Provider value={{ records, stats, loading, refresh: load, addRecord, updateRecord, removeRecord }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
