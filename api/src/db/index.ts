import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface DatabaseOptions {
  dbPath?: string;
}

interface StoredRow {
  value: string;
}

type ArrayPredicate<T> = (item: T, index: number, array: T[]) => unknown;
type ArrayMapper<T, U> = (item: T, index: number, array: T[]) => U;

const DEFAULT_DB_PATH = join(__dirname, '../../data/cloth.sqlite');
const MIGRATIONS_DIR = join(__dirname, 'migrations');

let db: Database.Database | null = null;
let activeDbPath: string | null = null;

function getDbPath(options: DatabaseOptions = {}): string {
  return options.dbPath || process.env.CLOTH_DB_PATH || DEFAULT_DB_PATH;
}

function ensureParentDir(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
}

function runMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (!existsSync(MIGRATIONS_DIR)) return;

  const migrations = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const hasMigration = database.prepare(
    'SELECT 1 FROM schema_migrations WHERE id = ?'
  );
  const insertMigration = database.prepare(
    'INSERT INTO schema_migrations (id) VALUES (?)'
  );

  for (const migration of migrations) {
    if (hasMigration.get(migration)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, migration), 'utf-8');
    const apply = database.transaction(() => {
      database.exec(sql);
      insertMigration.run(migration);
    });
    apply();
  }
}

export function initializeDatabase(options: DatabaseOptions = {}): Database.Database {
  const dbPath = getDbPath(options);
  if (db && activeDbPath === dbPath) return db;
  closeDatabase();
  ensureParentDir(dbPath);
  db = new Database(dbPath);
  activeDbPath = dbPath;
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

export function getDatabase(): Database.Database {
  return initializeDatabase();
}

export function closeDatabase(): void {
  if (!db) return;
  db.close();
  db = null;
  activeDbPath = null;
}

export class SqliteCollection<T> {
  private collection: string;
  private getKey: (item: T) => string;

  constructor(collection: string, getKey: (item: T) => string, seed: T[] = []) {
    this.collection = collection;
    this.getKey = getKey;
    this.ensureSeed(seed);
  }

  private database(): Database.Database {
    return getDatabase();
  }

  private ensureSeed(seed: T[]): void {
    if (seed.length === 0 || this.count() > 0) return;
    const insertMany = this.database().transaction((items: T[]) => {
      for (const item of items) this.upsert(item);
    });
    insertMany(seed);
  }

  findAll(): T[] {
    const rows = this.database()
      .prepare('SELECT value FROM kv_collections WHERE collection = ? ORDER BY created_at ASC')
      .all(this.collection) as StoredRow[];
    return rows.map((row) => JSON.parse(row.value) as T);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    const item = this.findAll().find(predicate);
    return item ? this.wrapMutableItem(item) : undefined;
  }

  findMany(predicate: (item: T) => boolean): T[] {
    return this.findAll().filter(predicate).map((item) => this.wrapMutableItem(item));
  }

  asArray(): T[] {
    const snapshot = (): T[] => this.findAll().map((item) => this.wrapMutableItem(item));

    return new Proxy([] as T[], {
      get: (_target, property) => {
        if (property === Symbol.iterator) {
          return function* iterator() {
            yield* snapshot();
          };
        }
        if (property === 'length') return this.count();
        if (property === 'unshift' || property === 'push') {
          return (...items: T[]): number => {
            for (const item of items) this.upsert(item);
            return this.count();
          };
        }
        if (property === 'find') {
          return (predicate: ArrayPredicate<T>): T | undefined => snapshot().find(predicate);
        }
        if (property === 'findIndex') {
          return (predicate: ArrayPredicate<T>): number => snapshot().findIndex(predicate);
        }
        if (property === 'filter') {
          return (predicate: ArrayPredicate<T>): T[] => snapshot().filter(predicate);
        }
        if (property === 'slice') {
          return (start?: number, end?: number): T[] => snapshot().slice(start, end);
        }
        if (property === 'map') {
          return <U>(mapper: ArrayMapper<T, U>): U[] => snapshot().map(mapper);
        }
        if (property === 'sort') {
          return (compareFn?: (left: T, right: T) => number): T[] => snapshot().sort(compareFn);
        }
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          return snapshot()[Number(property)];
        }
        return Reflect.get(_target, property);
      },
      set: (_target, property, value) => {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          this.upsert(value as T);
          return true;
        }
        return Reflect.set(_target, property, value);
      },
    });
  }

  upsert(item: T): T {
    const key = this.getKey(item);
    const existing = this.find((candidate) => this.getKey(candidate) === key);
    const value = existing ? { ...existing, ...item } : item;
    this.database()
      .prepare(`
        INSERT INTO kv_collections (collection, key, value, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(collection, key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP
      `)
      .run(this.collection, key, JSON.stringify(value));
    return value as T;
  }

  remove(predicate: (item: T) => boolean): number {
    const toRemove = this.findAll().filter(predicate).map((item) => this.getKey(item));
    if (toRemove.length === 0) return 0;
    const removeOne = this.database().prepare(
      'DELETE FROM kv_collections WHERE collection = ? AND key = ?'
    );
    const removeMany = this.database().transaction((keys: string[]) => {
      for (const key of keys) removeOne.run(this.collection, key);
    });
    removeMany(toRemove);
    return toRemove.length;
  }

  count(): number {
    const row = this.database()
      .prepare('SELECT COUNT(*) AS count FROM kv_collections WHERE collection = ?')
      .get(this.collection) as { count: number };
    return row.count;
  }

  private wrapMutableItem(item: T): T {
    if (item === null || typeof item !== 'object') return item;
    return new Proxy(item as Record<PropertyKey, unknown>, {
      set: (target, property, value): boolean => {
        Reflect.set(target, property, value);
        this.upsert(target as T);
        return true;
      },
    }) as T;
  }
}

export function createSqliteCollection<T>(
  collection: string,
  _key: string,
  getKey: (item: T) => string,
  seed: T[] = []
): SqliteCollection<T> {
  return new SqliteCollection<T>(collection, getKey, seed);
}
