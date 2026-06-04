/**
 * ChatWindow Component
 * Slide-out panel with conversation list and message thread.
 */
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import styles from './ChatWindow.module.css';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: string[];
  productId?: string;
  productTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: Record<string, number>;
  createdAt: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('cloth_jwt');
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
  return data.data as T;
}

const MARKET_TITLES: Record<string, string> = {
  UK: 'Messages',
  HK: '訊息',
  CN: '消息',
};

const PLACEHOLDER_MSGS: Record<string, string> = {
  UK: 'Type a message...',
  HK: '輸入訊息...',
  CN: '输入消息...',
};

interface ChatWindowProps {
  market?: string;
  onClose: () => void;
}

export default function ChatWindow({ market = 'CN', onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { setConversations, setUnreadTotal, unreadTotal, messagesByConversation, setMessagesByConversation } = useChat();
  const { showToast } = useToast();
  const [open, setOpen] = useState(true);
  const [conversations, setLocalConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const t = MARKET_TITLES[market] ?? MARKET_TITLES.CN;

  // Connect to socket.io
  useEffect(() => {
    const token = localStorage.getItem('cloth_jwt');
    if (!token || !user) return;

    // Use existing socket or create new
    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('[ChatWindow] Socket connected'));
    socket.on('disconnect', () => console.log('[ChatWindow] Socket disconnected'));

    // New message
    socket.on('chat:new_message', (msg: ChatMessage) => {
      setMessages(prev => {
        // Only add if it's for the active conversation
        if (msg.conversationId !== activeConvId) return prev;
        return [...prev, msg];
      });
      setMessagesByConversation(prev => ({
        ...prev,
        [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
      }));
      // Update conversation list
      setLocalConversations(prev => prev.map(c =>
        c.id === msg.conversationId
          ? { ...c, lastMessage: msg.message, lastMessageAt: msg.createdAt }
          : c
      ));
      scrollToBottom();
    });

    // Unread update
    socket.on('chat:unread_update', (payload: { conversationId: string; count: number }) => {
      setLocalConversations(prev => prev.map(c =>
        c.id === payload.conversationId
          ? {
              ...c,
              unreadCount: {
                ...c.unreadCount,
                [user.id]: payload.count === 0 ? 0 : (c.unreadCount[user.id] || 0) + payload.count,
              },
            }
          : c
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Load conversations on mount
  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch<{ conversations: Conversation[]; totalUnread: number }>(
          '/chat/conversations'
        );
        setLocalConversations(data.conversations);
        setConversations(data.conversations);
        setUnreadTotal(data.totalUnread);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!activeConvId || !user) return;

    async function loadMessages() {
      setLoading(true);
      try {
        const data = await apiFetch<{ conversation: Conversation; messages: ChatMessage[] }>(
          `/chat/${activeConvId}`
        );
        setMessages(data.messages);
        // Mark as read
        await apiFetch(`/chat/${activeConvId}/read`, { method: 'POST' });
        const userId = user?.id ?? '';
        setLocalConversations(prev => prev.map(c =>
          c.id === activeConvId
            ? { ...c, unreadCount: { ...c.unreadCount, [userId]: 0 } }
            : c
        ));
        const currentUnread = (data.conversation?.unreadCount?.[userId] ?? 0);
        setUnreadTotal(Math.max(0, unreadTotal - currentUnread));
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [activeConvId, user]);

  // Also sync with context messages
  useEffect(() => {
    if (activeConvId && messagesByConversation[activeConvId]) {
      setMessages(messagesByConversation[activeConvId]);
      scrollToBottom();
    }
  }, [messagesByConversation, activeConvId]);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  async function handleSend() {
    if (!messageText.trim() || !activeConvId || !user) return;

    setSending(true);
    try {
      const conv = conversations.find(c => c.id === activeConvId);
      const receiverId = conv?.participants.find(p => p !== user.id) || '';

      const newMsg = await apiFetch<ChatMessage>('/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: activeConvId,
          receiverId,
          message: messageText.trim(),
          productId: conv?.productId,
        }),
      });

      // Optimistic update
      setMessages(prev => [...prev, newMsg]);
      setLocalConversations(prev => prev.map(c =>
        c.id === activeConvId
          ? { ...c, lastMessage: newMsg.message, lastMessageAt: newMsg.createdAt }
          : c
      ));
      setMessageText('');
      scrollToBottom();

      // Emit socket event
      socketRef.current?.emit('chat:send', newMsg);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '发送失败', 'error');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClose() {
    setOpen(false);
    onClose();
  }

  const otherUserId = user?.id;
  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount[otherUserId || ''] || 0),
    0,
  );

  return (
    <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3>{t}</h3>
          {totalUnread > 0 && (
            <span className={styles.unreadBadge}>{totalUnread}</span>
          )}
        </div>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        {/* Conversation List */}
        {!activeConvId && (
          <div className={styles.convList}>
            {loading ? (
              <div className={styles.emptyState}>
                <div className="spinner" />
              </div>
            ) : conversations.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>暂无消息</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherId = conv.participants.find(p => p !== user?.id);
                const unread = conv.unreadCount[user?.id || ''] || 0;
                return (
                  <div
                    key={conv.id}
                    className={`${styles.convItem} ${unread > 0 ? styles.convUnread : ''}`}
                    onClick={() => setActiveConvId(conv.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setActiveConvId(conv.id)}
                  >
                    <div className={styles.convAvatar}>
                      {otherId ? otherId.substring(0, 2).toUpperCase() : '??'}
                    </div>
                    <div className={styles.convContent}>
                      <div className={styles.convTop}>
                        <span className={styles.convUser}>
                          {conv.productTitle ? `关于: ${conv.productTitle}` : `用户 ${otherId?.substring(0, 6)}`}
                        </span>
                        {conv.lastMessageAt && (
                          <span className={styles.convTime}>
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className={styles.convPreview}>{conv.lastMessage}</p>
                      )}
                    </div>
                    {unread > 0 && (
                      <span className={styles.unreadDot}>{unread}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Message Thread */}
        {activeConvId && (
          <div className={styles.thread}>
            <div className={styles.threadHeader}>
              <button className={styles.backBtn} onClick={() => setActiveConvId(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <span className={styles.threadTitle}>
                {conversations.find(c => c.id === activeConvId)?.productTitle || '对话'}
              </span>
            </div>

            <div className={styles.messageList}>
              {loading ? (
                <div className={styles.emptyState}><div className="spinner" /></div>
              ) : messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>暂无消息，开始对话吧！</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${isMine ? styles.messageMine : styles.messageTheirs}`}
                    >
                      <div className={styles.bubble}>{msg.message}</div>
                      <span className={styles.msgTime}>{formatTime(msg.createdAt)}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <textarea
                className={styles.input}
                placeholder={PLACEHOLDER_MSGS[market] ?? PLACEHOLDER_MSGS.CN}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={sending}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!messageText.trim() || sending}
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
