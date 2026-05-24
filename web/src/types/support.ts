/**
 * CLOTH 客户服务中心类型定义
 *
 * Supabase schema reference (future migration):
 *
 * CREATE TABLE support_tickets (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   ticket_no TEXT UNIQUE NOT NULL,          -- e.g. "CS-2026-00001"
 *   type TEXT NOT NULL CHECK (type IN ('inquiry', 'return', 'exchange', 'repair')),
 *   status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
 *   subject TEXT NOT NULL,
 *   description TEXT NOT NULL,
 *   order_id TEXT,
 *   priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
 *   customer_name TEXT NOT NULL,
 *   customer_email TEXT NOT NULL,
 *   customer_phone TEXT,
 *   admin_reply TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE support_messages (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
 *   sender TEXT NOT NULL CHECK (sender IN ('customer','admin')),
 *   message TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow all" ON support_tickets FOR ALL USING (true);
 * CREATE POLICY "Allow all" ON support_messages FOR ALL USING (true);
 */

export type SupportTicketType = 'inquiry' | 'return' | 'exchange' | 'repair';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  ticketNo: string; // e.g. "CS-2026-00001"
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

export interface SupportApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
