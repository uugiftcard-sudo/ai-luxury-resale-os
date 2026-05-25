/* eslint-env node */
/**
 * CLOTH Products Filter + Pagination — Phase 2 regression tests
 * Starts one server for all tests (like api-smoke.test.mjs).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const PORT = 3499;
const BASE = `http://127.0.0.1:${PORT}`;
const HEALTH_TRIES = 80; // seconds to wait for server startup

let server, dbDir;

async function healthCheck() {
  for (let attempt = 0; attempt < HEALTH_TRIES; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`API exited before health check passed with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(`${BASE}/api/health`);
      if (response.ok) return;
    } catch {
      // Retry until the dev server finishes booting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Timed out waiting for API health check');
}

test.before(async () => {
  dbDir = mkdtempSync(join(tmpdir(), 'cloth-filter-'));
  const dbPath = join(dbDir, 'cloth.sqlite');
  server = spawn('npm', ['run', 'dev', '--workspace=api'], {
    cwd: new URL('..', import.meta.url),
    detached: true,
    env: { ...process.env, PORT: String(PORT), CLOTH_DB_PATH: dbPath },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await healthCheck();
});

test.after(() => {
  if (!server) return;
  try {
    process.kill(-server.pid, 'SIGINT');
  } catch {
    server.kill('SIGINT');
  }
  if (dbDir) rmSync(dbDir, { recursive: true, force: true });
});

async function requestJson(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  return { response, payload: await response.json() };
}

async function createProduct(overrides = {}) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const { response, payload } = await requestJson('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Phase2 Filter ${suffix}`,
      brand: 'Gucci',
      category: '包袋',
      price: 1000,
      condition: '全新',
      size: 'Mini',
      description: `Phase2 filter smoke ${suffix}`,
      images: [],
      market: 'ALL',
      ...overrides,
    }),
  });
  assert.equal(response.status, 200);
  return payload.data;
}

async function getProducts(query) {
  const params = new URLSearchParams(query);
  const { response, payload } = await requestJson(`/api/products?${params.toString()}`);
  return { status: response.status, body: payload };
}

test('products filtering supports market, category, price, search, sort, and pagination', async () => {
  const prefix = `Phase2 ${Date.now()}`;

  await createProduct({
    title: `${prefix} Shared Gucci`,
    brand: 'Gucci',
    category: '包袋',
    price: 3000,
    description: `${prefix} shared searchable`,
    market: 'ALL',
  });
  await createProduct({
    title: `${prefix} UK Prada`,
    brand: 'Prada',
    category: '包袋',
    price: 1000,
    description: `${prefix} uk searchable`,
    market: 'UK',
  });
  await createProduct({
    title: `${prefix} HK Shoes`,
    brand: 'Chanel',
    category: '鞋履',
    price: 9000,
    description: `${prefix} hk searchable`,
    market: 'HK',
  });
  for (let i = 0; i < 4; i += 1) {
    await createProduct({
      title: `${prefix} Page ${i}`,
      brand: 'Gucci',
      category: '包袋',
      price: 2000 + i,
      description: `${prefix} page searchable`,
      market: 'ALL',
    });
  }

  const uk = await getProducts({ market: 'UK', search: prefix, limit: '50' });
  assert.equal(uk.status, 200);
  const ukMarkets = new Set(uk.body.data.data.map(product => product.market));
  assert.equal(uk.body.data.data.some(product => product.title.includes('UK Prada')), true);
  assert.equal(ukMarkets.has('ALL'), true);
  assert.equal(ukMarkets.has('UK'), true);
  assert.equal(ukMarkets.has('HK'), false);

  const bagsInRange = await getProducts({
    search: prefix,
    category: '包袋',
    minPrice: '1000',
    maxPrice: '3500',
    sort: 'price_asc',
    limit: '50',
  });
  assert.equal(bagsInRange.status, 200);
  const prices = bagsInRange.body.data.data.map(product => product.price);
  assert.deepEqual(prices, [...prices].sort((left, right) => left - right));
  assert.equal(bagsInRange.body.data.data.every(product => product.category === '包袋'), true);
  assert.equal(bagsInRange.body.data.data.every(product => product.price >= 1000 && product.price <= 3500), true);

  const page1 = await getProducts({ search: prefix, page: '1', limit: '3', sort: 'createdAt_asc' });
  const page2 = await getProducts({ search: prefix, page: '2', limit: '3', sort: 'createdAt_asc' });
  assert.equal(page1.status, 200);
  assert.equal(page2.status, 200);
  assert.equal(page1.body.data.total, page2.body.data.total);
  assert.equal(page1.body.data.page, 1);
  assert.equal(page2.body.data.page, 2);
  assert.equal(page1.body.data.limit, 3);
  assert.equal(page2.body.data.limit, 3);
  assert.notDeepEqual(
    page1.body.data.data.map(product => product.id),
    page2.body.data.data.map(product => product.id)
  );
});

test('products filtering rejects invalid query params with 400 JSON', async () => {
  const cases = [
    [{ page: 'abc' }, 'page 必须是大于等于 1 的整数'],
    [{ limit: '0' }, 'limit 必须在 1-50 之间'],
    [{ minPrice: 'abc' }, 'minPrice 必须是有效非负数字'],
    [{ minPrice: '100', maxPrice: '50' }, 'minPrice 不能大于 maxPrice'],
    [{ status: 'bad' }, 'status 必须是待售/已售/已下架'],
    [{ market: 'bad' }, 'market 必须是 ALL/UK/HK/CN'],
  ];

  for (const [query, expectedError] of cases) {
    const { status, body } = await getProducts(query);
    assert.equal(status, 400, JSON.stringify(query));
    assert.equal(body.success, false, JSON.stringify(query));
    assert.equal(body.error, expectedError, JSON.stringify(query));
    assert.equal('stack' in body, false, JSON.stringify(query));
  }
});
