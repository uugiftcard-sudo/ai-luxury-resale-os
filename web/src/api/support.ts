/**
 * Support API — calls the real backend Express API.
 * Endpoints:
 *   GET    /api/support/tickets
 *   GET    /api/support/tickets/:id
 *   POST   /api/support/tickets
 *   PUT    /api/support/tickets/:id
 *   GET    /api/support/tickets/:id/messages
 *   POST   /api/support/tickets/:id/messages
 *   GET    /api/support/faqs
 *   POST   /api/support/faqs
 */
import type {
  SupportTicket,
  SupportTicketFormData,
  SupportMessage,
  SupportFAQ,
} from '../types/support';

const BASE = '/api/support';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const json = (await res.json()) as { success: boolean; data?: T; error?: string };
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `请求失败 (${res.status})`);
  }
  return json.data as T;
}

// ── Response shape normalisation ─────────────────────────────────────────────────

// Raw shape returned by the backend
interface RawSupportMessage {
  id: string;
  ticketId: string;
  author: 'customer' | 'admin';
  authorName: string;
  message: string;
  createdAt: string;
}

/** Backend sends `author`; frontend expects `sender`. */
function toMessage(m: RawSupportMessage): SupportMessage {
  return {
    id: m.id,
    ticketId: m.ticketId,
    sender: m.author,
    message: m.message,
    createdAt: m.createdAt,
  };
}

export const supportApi = {
  list(): Promise<SupportTicket[]> {
    return apiFetch<SupportTicket[]>('/tickets');
  },

  getById(id: string): Promise<SupportTicket | null> {
    return apiFetch<SupportTicket>(`/tickets/${id}`);
  },

  create(form: SupportTicketFormData): Promise<SupportTicket> {
    return apiFetch<SupportTicket>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        type: form.type,
        subject: form.subject,
        description: form.description,
        orderId: form.orderId,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
      }),
    });
  },

  addMessage(ticketId: string, message: string, authorName: string): Promise<SupportMessage> {
    return apiFetch<RawSupportMessage>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        author: 'customer',
        authorName,
        message,
      }),
    }).then(toMessage);
  },

  resolve(id: string): Promise<SupportTicket | null> {
    return apiFetch<SupportTicket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'resolved' }),
    });
  },

  getMessages(ticketId: string): Promise<SupportMessage[]> {
    return apiFetch<RawSupportMessage[]>(`/tickets/${ticketId}/messages`)
      .then(msgs => msgs.map(toMessage));
  },

  getFaqs(): Promise<SupportFAQ[]> {
    return apiFetch<SupportFAQ[]>('/faqs');
  },
};
