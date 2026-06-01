/**
 * SupportContext — manages support ticket state across the app.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supportApi } from '../api/support';
import type { SupportTicket, SupportTicketFormData, SupportMessage } from '../types/support';

interface SupportContextValue {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  refreshTickets: () => Promise<void>;
  createTicket: (form: SupportTicketFormData) => Promise<SupportTicket>;
  replyToTicket: (id: string, message: string) => Promise<SupportMessage>;
  resolveTicket: (id: string) => Promise<void>;
}

const SupportContext = createContext<SupportContextValue | null>(null);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportApi.list();
      setTickets(data);
    } catch {
      setError('加载客服记录失败，请刷新重试。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const createTicket = useCallback(async (form: SupportTicketFormData): Promise<SupportTicket> => {
    const ticket = await supportApi.create(form);
    setTickets(prev => [ticket, ...prev]);
    return ticket;
  }, []);

  const replyToTicket = useCallback(async (id: string, message: string): Promise<SupportMessage> => {
    const msg = await supportApi.reply(id, message);
    await refreshTickets();
    return msg;
  }, [refreshTickets]);

  const resolveTicket = useCallback(async (id: string): Promise<void> => {
    await supportApi.resolve(id);
    await refreshTickets();
  }, [refreshTickets]);

  return (
    <SupportContext.Provider value={{ tickets, loading, error, refreshTickets, createTicket, replyToTicket, resolveTicket }}>
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport(): SupportContextValue {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error('useSupport must be used within SupportProvider');
  return ctx;
}
