-- Chat system migration
-- Stores messages between buyers and sellers, linked to products

CREATE TABLE IF NOT EXISTS chat_conversations (
  collection TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection, key)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  collection TEXT NOT NULL DEFAULT 'chat_messages',
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
ON chat_messages(collection, created_at);
