/**
 * Chat Model
 * Buyer/Seller real-time messaging, persisted in SQLite.
 */
import { createSqliteCollection } from '../db';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];       // [buyerId, sellerId]
  productId?: string;
  productTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: Record<string, number>; // unread count per userId
  createdAt: string;
  updatedAt?: string;
}

// SQLite collections for chat
const messageCollection = createSqliteCollection<ChatMessage>(
  'chat_messages',
  'id',
  (m) => m.id,
  [],
);

const conversationCollection = createSqliteCollection<Conversation>(
  'chat_conversations',
  'id',
  (c) => c.id,
  [],
);

export const messages = messageCollection.asArray();
export const conversations = conversationCollection.asArray();

// ==================== Helpers ====================

export function generateMessageId(prefix: string = 'msg'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

export function generateConversationId(prefix: string = 'conv'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

export function findConversationById(id: string): Conversation | undefined {
  return conversationCollection.find(c => c.id === id);
}

export function findMessagesByConversation(conversationId: string): ChatMessage[] {
  return messageCollection
    .findAll()
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function findConversationsForUser(userId: string): Conversation[] {
  return conversationCollection
    .findAll()
    .filter(c => c.participants.includes(userId))
    .sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
}

export function saveMessage(message: ChatMessage): ChatMessage {
  return messageCollection.upsert(message);
}

export function saveConversation(conversation: Conversation): Conversation {
  return conversationCollection.upsert(conversation);
}

export function getOrCreateConversation(
  userIdA: string,
  userIdB: string,
  productId?: string,
  productTitle?: string,
): Conversation {
  // Find existing conversation between these two users for this product
  const existing = conversationCollection.findAll().find(c =>
    c.participants.includes(userIdA) &&
    c.participants.includes(userIdB) &&
    (productId ? c.productId === productId : !c.productId)
  );

  if (existing) return existing;

  const newConv: Conversation = {
    id: generateConversationId(),
    participants: [userIdA, userIdB],
    productId,
    productTitle,
    unreadCount: { [userIdA]: 0, [userIdB]: 0 },
    createdAt: new Date().toISOString(),
  };

  return conversationCollection.upsert(newConv);
}

export function markMessagesAsRead(conversationId: string, userId: string): void {
  const msgs = findMessagesByConversation(conversationId);
  for (const msg of msgs) {
    if (msg.receiverId === userId && !msg.read) {
      messageCollection.upsert({ ...msg, read: true });
    }
  }

  // Reset unread count for this user
  const conv = findConversationById(conversationId);
  if (conv) {
    conversationCollection.upsert({
      ...conv,
      unreadCount: { ...conv.unreadCount, [userId]: 0 },
      updatedAt: new Date().toISOString(),
    });
  }
}

export function getTotalUnreadCount(userId: string): number {
  return conversationCollection
    .findAll()
    .filter(c => c.participants.includes(userId))
    .reduce((sum, c) => sum + (c.unreadCount[userId] || 0), 0);
}
