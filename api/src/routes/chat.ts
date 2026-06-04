/**
 * Chat Routes
 * REST API + Socket.IO events for buyer/seller real-time messaging.
 */
import { Router, Request, Response } from 'express';
import { ok, fail, serverError } from '../middleware/response';
import { requireAuth } from '../middleware/auth';
import {
  saveMessage,
  saveConversation,
  findConversationById,
  findConversationsForUser,
  findMessagesByConversation,
  getOrCreateConversation,
  markMessagesAsRead,
  getTotalUnreadCount,
  generateMessageId,
  ChatMessage,
} from '../models/chat';

const router = Router();

// Socket.IO instance — injected via setSocketIO
let _io: import('socket.io').Server | null = null;

export function setSocketIO(io: import('socket.io').Server): void {
  _io = io;
}

function emitNewMessage(conversationId: string, message: ChatMessage): void {
  if (!_io) return;
  // Emit to the conversation room
  _io.to(`conv:${conversationId}`).emit('chat:new_message', message);
  // Also emit unread count update to each participant's personal room
  _io.to(`user:${message.receiverId}`).emit('chat:unread_update', {
    conversationId,
    count: 1,
  });
}

/**
 * GET /api/chat/conversations
 * List all conversations for the logged-in user.
 */
router.get('/conversations', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const convs = findConversationsForUser(userId);
    const totalUnread = getTotalUnreadCount(userId);

    ok(res, { conversations: convs, totalUnread });
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * GET /api/chat/:conversationId
 * Get a specific conversation with its message history.
 */
router.get('/:conversationId', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const conv = findConversationById(req.params.conversationId);

    if (!conv) {
      fail(res, 404, '对话不存在');
      return;
    }

    if (!conv.participants.includes(userId)) {
      fail(res, 403, '无权限访问此对话');
      return;
    }

    // Mark messages as read
    markMessagesAsRead(req.params.conversationId, userId);

    const messages = findMessagesByConversation(req.params.conversationId);
    ok(res, { conversation: conv, messages });
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * POST /api/chat/start
 * Start a new conversation with a seller/buyer.
 * Body: { receiverId, productId?, productTitle? }
 */
router.post('/start', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { receiverId, productId, productTitle } = req.body as {
      receiverId: string;
      productId?: string;
      productTitle?: string;
    };

    if (!receiverId) {
      fail(res, 400, '请提供 receiverId');
      return;
    }

    if (receiverId === userId) {
      fail(res, 400, '不能与自己对话');
      return;
    }

    const conv = getOrCreateConversation(userId, receiverId, productId, productTitle);
    ok(res, conv, '对话已创建或已存在');
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * POST /api/chat/send
 * Send a message in a conversation.
 * Body: { conversationId, receiverId, message, productId? }
 */
router.post('/send', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { conversationId, receiverId, message, productId } = req.body as {
      conversationId?: string;
      receiverId?: string;
      message?: string;
      productId?: string;
    };

    if (!message?.trim()) {
      fail(res, 400, '消息内容不能为空');
      return;
    }

    let convId = conversationId;
    let conv;

    if (convId) {
      conv = findConversationById(convId);
      if (!conv) {
        fail(res, 404, '对话不存在');
        return;
      }
      if (!conv.participants.includes(userId)) {
        fail(res, 403, '无权限');
        return;
      }
    } else if (receiverId) {
      conv = getOrCreateConversation(userId, receiverId, productId);
      convId = conv.id;
    } else {
      fail(res, 400, '请提供 conversationId 或 receiverId');
      return;
    }

    const msg: ChatMessage = {
      id: generateMessageId(),
      conversationId: convId!,
      senderId: userId,
      receiverId: conv!.participants.find(p => p !== userId) || receiverId || '',
      productId,
      message: message.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    const savedMsg = saveMessage(msg);

    // Update conversation's last message
    saveConversation({
      ...conv!,
      lastMessage: message.trim(),
      lastMessageAt: savedMsg.createdAt,
      updatedAt: savedMsg.createdAt,
    });

    // Emit socket event for real-time delivery
    emitNewMessage(convId!, savedMsg);

    ok(res, savedMsg, '消息已发送');
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * POST /api/chat/:conversationId/read
 * Mark all messages in a conversation as read.
 */
router.post('/:conversationId/read', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const conv = findConversationById(req.params.conversationId);

    if (!conv) {
      fail(res, 404, '对话不存在');
      return;
    }
    if (!conv.participants.includes(userId)) {
      fail(res, 403, '无权限');
      return;
    }

    markMessagesAsRead(req.params.conversationId, userId);

    // Emit unread update
    if (_io) {
      _io.to(`user:${userId}`).emit('chat:unread_update', {
        conversationId: req.params.conversationId,
        count: 0,
      });
    }

    ok(res, { success: true });
  } catch (err) {
    serverError(res, err);
  }
});

/**
 * GET /api/chat/unread/total
 * Get total unread message count for the current user.
 */
router.get('/unread/total', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const count = getTotalUnreadCount(userId);
    ok(res, { totalUnread: count });
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
