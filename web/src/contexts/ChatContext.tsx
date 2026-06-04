/**
 * Chat Context
 * Provides Socket.IO connection and chat state management.
 * Shows chat button only for logged-in users.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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

interface ChatContextValue {
  isConnected: boolean;
  unreadTotal: number;
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  connect: (token: string) => void;
  disconnect: () => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  setConversations: (convs: Conversation[]) => void;
  setUnreadTotal: (count: number) => void;
  setMessagesByConversation: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
}

const ChatContext = createContext<ChatContextValue>({
  isConnected: false,
  unreadTotal: 0,
  conversations: [],
  messagesByConversation: {},
  connect: () => {},
  disconnect: () => {},
  joinConversation: () => {},
  leaveConversation: () => {},
  setConversations: () => {},
  setUnreadTotal: () => {},
  setMessagesByConversation: () => {},
});

export function useChat(): ChatContextValue {
  return useContext(ChatContext);
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const { user } = useAuth();

  function connect(token: string) {
    if (socket?.connected) return;

    const newSocket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[Chat] Connected to Socket.IO');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Chat] Disconnected from Socket.IO');
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[Chat] Connection error:', err.message);
    });

    // New message received
    newSocket.on('chat:new_message', (msg: ChatMessage) => {
      setMessagesByConversation(prev => ({
        ...prev,
        [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
      }));

      // Increment unread if we're not in this conversation
      // (The server also sends unread_update events)
    });

    // Unread count update
    newSocket.on('chat:unread_update', (payload: { conversationId: string; count: number }) => {
      setUnreadTotal(prev => {
        // When count is 0, it means the conversation was read
        if (payload.count === 0) return prev;
        return prev + payload.count;
      });
    });

    setSocket(newSocket);
  }

  function disconnect() {
    socket?.disconnect();
    setSocket(null);
    setIsConnected(false);
    setUnreadTotal(0);
    setConversations([]);
    setMessagesByConversation({});
  }

  function joinConversation(conversationId: string) {
    socket?.emit('chat:join', conversationId);
  }

  function leaveConversation(conversationId: string) {
    socket?.emit('chat:leave', conversationId);
  }

  // Auto-connect when user logs in; disconnect on logout
  useEffect(() => {
    const token = localStorage.getItem('cloth_jwt');
    if (token && user) {
      connect(token);
    } else {
      disconnect();
    }
    return () => {
      socket?.disconnect();
    };
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        unreadTotal,
        conversations,
        messagesByConversation,
        connect,
        disconnect,
        joinConversation,
        leaveConversation,
        setConversations,
        setUnreadTotal,
        setMessagesByConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
