/**
 * CLOTH Supabase Client
 *
 * Currently configured for localStorage mock mode.
 * To connect to real Supabase:
 *   1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in web/.env
 *   2. Replace MOCK_MODE = true → MITE_SUPABASE_URL !== undefined
 *   3. Apply the SQL migrations in /supabase/migrations/
 */

export const MOCK_MODE = true;

// ── Supabase (real) ────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let _supabase: ReturnType<typeof createClient> | null = null;

function createClient(url: string, key: string) {
  // Lazy-load so the bundle doesn't crash when @supabase/supabase-js is not configured
  const { createClient: factory } = require('@supabase/supabase-js');
  return factory(url, key);
}

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// ── Type exports for Supabase tables ──────────────────────────────────────────
// These match the Supabase schema documented in types/support.ts and types/warehouse.ts
export type Database = {
  public: {
    Tables: {
      support_tickets: {
        Row: import('../types/support').SupportTicket;
        Insert: Omit<import('../types/support').SupportTicket, 'id' | 'ticketNo' | 'createdAt'>;
        Update: Partial<import('../types/support').SupportTicket>;
      };
      support_messages: {
        Row: import('../types/support').SupportMessage;
        Insert: Omit<import('../types/support').SupportMessage, 'id' | 'createdAt'>;
        Update: Partial<import('../types/support').SupportMessage>;
      };
      inventory: {
        Row: import('../types/warehouse').InventoryItem;
        Insert: Omit<import('../types/warehouse').InventoryItem, 'id' | 'createdAt'>;
        Update: Partial<import('../types/warehouse').InventoryItem>;
      };
      inventory_transactions: {
        Row: import('../types/warehouse').InventoryTransaction;
        Insert: Omit<import('../types/warehouse').InventoryTransaction, 'id' | 'createdAt'>;
        Update: Partial<import('../types/warehouse').InventoryTransaction>;
      };
    };
  };
};

export const SUPABASE_MOCK_TABLES = {
  support_tickets: 'support_tickets',
  support_messages: 'support_messages',
  inventory: 'inventory',
  inventory_transactions: 'inventory_transactions',
} as const;
