/**
 * ChatButton Component
 * Floating action button showing unread message count.
 * Only visible when user is logged in.
 */
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import styles from './ChatButton.module.css';

interface ChatButtonProps {
  onClick: () => void;
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  const { unreadTotal } = useChat();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <button
      className={styles.fab}
      onClick={onClick}
      title="Chat"
      aria-label={`Open chat${unreadTotal > 0 ? ` (${unreadTotal} unread)` : ''}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      {unreadTotal > 0 && (
        <span className={styles.badge}>
          {unreadTotal > 99 ? '99+' : unreadTotal}
        </span>
      )}
    </button>
  );
}
