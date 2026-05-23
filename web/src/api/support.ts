/**
 * Support API — routes requests through mockStorage or Supabase.
 * Swap MOCK_MODE in supabase.ts to switch to real backend.
 */
import {
  supportStorage,
  StoredTicket,
} from '../lib/mockStorage';
import type {
  SupportTicket,
  SupportTicketFormData,
  SupportMessage,
} from '../types/support';

function toTicket(s: StoredTicket): SupportTicket {
  return {
    id: s.id,
    ticketNo: s.ticketNo,
    type: s.type,
    status: s.status,
    subject: s.subject,
    description: s.description,
    orderId: s.orderId,
    priority: s.priority,
    customerName: s.customerName,
    customerEmail: s.customerEmail,
    customerPhone: s.customerPhone,
    adminReply: s.adminReply,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const supportApi = {
  list(): Promise<SupportTicket[]> {
    return Promise.resolve(supportStorage.getTickets().map(toTicket));
  },

  getById(id: string): Promise<SupportTicket | null> {
    const t = supportStorage.getTicketById(id);
    return Promise.resolve(t ? toTicket(t) : null);
  },

  create(form: SupportTicketFormData): Promise<SupportTicket> {
    const ticket = supportStorage.createTicket({
      type: form.type,
      status: 'open',
      subject: form.subject,
      description: form.description,
      orderId: form.orderId,
      priority: 'normal',
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
    });
    return Promise.resolve(toTicket(ticket));
  },

  reply(id: string, message: string, sender: 'customer' | 'admin' = 'admin'): Promise<SupportMessage> {
    const msg = supportStorage.addMessage({ ticketId: id, sender, message });
    if (sender === 'admin') {
      supportStorage.updateTicket(id, { adminReply: message, status: 'in_progress' });
    }
    return Promise.resolve(msg);
  },

  resolve(id: string): Promise<SupportTicket | null> {
    const t = supportStorage.updateTicket(id, { status: 'resolved' });
    return Promise.resolve(t ? toTicket(t) : null);
  },

  getMessages(ticketId: string): Promise<SupportMessage[]> {
    return Promise.resolve(supportStorage.getMessages(ticketId));
  },

  seedDemo(): void {
    supportStorage.seedDemoTickets();
  },
};
