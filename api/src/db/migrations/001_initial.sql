CREATE TABLE IF NOT EXISTS kv_collections (
  collection TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection, key)
);

CREATE INDEX IF NOT EXISTS idx_kv_collections_collection
  ON kv_collections(collection);
