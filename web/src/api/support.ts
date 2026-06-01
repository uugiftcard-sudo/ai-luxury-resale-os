/**
 * Support API — backed by the Express `/api/support` routes.
 */
import type {
  SupportTicket,
  SupportTicketFormData,
  SupportMessage,
  SupportFAQ,
} from '../types/support';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
};

type ApiMessage = Omit<SupportMessage, 'sender'> & {
  author?: 'customer' | 'agent';
  authorName?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || body.success === false) {
    throw new Error(body.error || body.message || `Support request failed (${res.status})`);
  }
  return body.data as T;
}

function normalizeMessage(message: ApiMessage): SupportMessage {
  return {
    id: message.id,
    ticketId: message.ticketId,
    sender: message.author === 'agent' ? 'admin' : 'customer',
    message: message.message,
    createdAt: message.createdAt,
  };
}

export const supportApi = {
  list(): Promise<SupportTicket[]> {
    return request<SupportTicket[]>('/support/tickets');
  },

  async getById(id: string): Promise<SupportTicket | null> {
    try {
      return await request<SupportTicket>(`/support/tickets/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },

  create(form: SupportTicketFormData): Promise<SupportTicket> {
    return request<SupportTicket>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  },

  async reply(id: string, message: string, sender: 'customer' | 'admin' = 'admin'): Promise<SupportMessage> {
    const apiMessage = await request<ApiMessage>(`/support/tickets/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        author: sender === 'admin' ? 'agent' : 'customer',
        authorName: sender === 'admin' ? 'CLOTH 客服' : 'Customer',
      }),
    });
    return normalizeMessage(apiMessage);
  },

  async resolve(id: string): Promise<SupportTicket | null> {
    return request<SupportTicket>(`/support/tickets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'resolved' }),
    });
  },

  async getMessages(ticketId: string): Promise<SupportMessage[]> {
    const messages = await request<ApiMessage[]>(`/support/tickets/${encodeURIComponent(ticketId)}/messages`);
    return messages.map(normalizeMessage);
  },

  getFaqs(category?: string): Promise<SupportFAQ[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<SupportFAQ[]>(`/support/faqs${query}`);
  },

  seedDemo(): void {
    // Demo seed now lives in the API SQLite collection.
  },
};
