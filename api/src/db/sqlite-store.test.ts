import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  createSqliteCollection,
  initializeDatabase,
  closeDatabase,
} from './index';

interface TestProduct {
  id: string;
  title: string;
  price: number;
}

describe('SQLite collection persistence', () => {
  test('persists records across collection re-instantiation', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cloth-db-'));
    const dbPath = join(dir, 'cloth.sqlite');

    try {
      initializeDatabase({ dbPath });
      const first = createSqliteCollection<TestProduct>(
        'test_products',
        'id',
        (item) => item.id
      );

      first.upsert({ id: 'p-test', title: 'Persistent Gucci Bag', price: 6800 });
      closeDatabase();

      initializeDatabase({ dbPath });
      const second = createSqliteCollection<TestProduct>(
        'test_products',
        'id',
        (item) => item.id
      );

      assert.equal(existsSync(dbPath), true);
      assert.deepEqual(second.find((item) => item.id === 'p-test'), {
        id: 'p-test',
        title: 'Persistent Gucci Bag',
        price: 6800,
      });
      assert.equal(second.count(), 1);
    } finally {
      closeDatabase();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('persists product store writes across database restart', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cloth-store-'));
    const dbPath = join(dir, 'cloth.sqlite');
    process.env.CLOTH_DB_PATH = dbPath;

    try {
      const store = await import('../models/store');
      const product = store.saveProduct({
        id: 'p-persist-test',
        title: 'Persistent Prada Bag',
        brand: 'Prada',
        category: '包袋',
        price: 5200,
        originalPrice: 12000,
        condition: '几乎全新',
        size: 'Mini',
        description: 'Persistence test product',
        images: [],
        status: '待售',
        createdAt: new Date().toISOString(),
        market: 'ALL',
      });

      assert.equal(product.id, 'p-persist-test');
      closeDatabase();

      assert.equal(store.findProductById('p-persist-test')?.title, 'Persistent Prada Bag');
      assert.equal(store.findProductById('p-persist-test')?.price, 5200);
    } finally {
      closeDatabase();
      delete process.env.CLOTH_DB_PATH;
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('persists array-like mutations without route changes', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cloth-db-'));
    const dbPath = join(dir, 'cloth.sqlite');

    try {
      initializeDatabase({ dbPath });
      const collection = createSqliteCollection<TestProduct>(
        'array_products',
        'id',
        (item) => item.id
      );
      const items = collection.asArray();

      items.unshift({ id: 'p-array', title: 'Array Gucci Bag', price: 7200 });
      assert.equal(items.length, 1);

      const idx = items.findIndex((item) => item.id === 'p-array');
      items[idx] = { ...items[idx], price: 7600 };
      items[idx].title = 'Updated Array Gucci Bag';

      closeDatabase();
      initializeDatabase({ dbPath });
      const restored = createSqliteCollection<TestProduct>(
        'array_products',
        'id',
        (item) => item.id
      ).asArray();

      assert.deepEqual(restored[0], {
        id: 'p-array',
        title: 'Updated Array Gucci Bag',
        price: 7600,
      });
    } finally {
      closeDatabase();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
