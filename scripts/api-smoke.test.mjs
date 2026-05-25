* eslint-env node *
/**
 * CLOTH API Smoke Contracts — P1-D (single-server version)
 * 啟動一個 server，跑晒所有 smoke。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const PORT = 3499;
const BASE = `http://127.0.0.1:${PORT}`;
const HEALTH_TRIES = 30; // seconds to wait for server startup

let server, dbDir;

test.before(async () => {
  dbDir = mkdtempSync(join(tmpdir(), 'cloth-smoke-all-'));
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
  try { process.kill(-server.pid, 'SIGINT'); } catch { server.kill('SIGINT'); }
  rmSync(dbDir, { recursive: true, force: true });
});

async function healthCheck() {
  for (let i = 0; i < HEALTH_TRIES * 10; i++) {
    if (server.exitCode !== null) throw new Error(`Server died with ${server.exitCode}`);
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Health check timeout');
}

// ── Assertions ───────────────────────────────────────────────────────────────

function ok(r)  { return r.json().then(b => ({ status: r.status, body: b })); }
function post(path, body) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(ok);
}
function get(path)  { return fetch(`${BASE}${path}`).then(ok); }
function put(path, body) {
  return fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(ok);
}
function del(path)  { return fetch(`${BASE}${path}`, { method: 'DELETE' }).then(ok); }

// ── PRODUCTS ───────────────────────────────────────────────────────────────

test('Products GET → 200 + array', async () => {
  const { status, body } = await get('/api/products');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data?.data));
});

test('Products POST → 200 + created with market', async () => {
  const { status, body } = await post('/api/products', {
    title: 'Smoke Bag', brand: 'Prada', category: '包袋',
    price: 5200, condition: '全新', size: 'Mini', description: 'Smoke', images: [], market: 'UK',
  });
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data?.id);
  assert.equal(body.data?.market, 'UK');
});

test('Products POST missing required → 400', async () => {
  const { status, body } = await post('/api/products', { title: 'No brand' });
  assert.equal(status, 400);
  assert.equal(body.success, false);
});

test('Products market filter finds UK products', async () => {
  const title = `UK Filter Smoke ${Date.now()}`;
  await post('/api/products', {
    title, brand: 'Dior', category: '包袋',
    price: 12000, condition: '全新', size: 'Small', description: 'UK', images: [], market: 'UK',
  });
  const { status, body } = await get(`/api/products?market=UK&search=${encodeURIComponent(title)}&limit=50`);
  assert.equal(status, 200);
  const uk = body.data?.data?.filter(p => p.market === 'UK');
  assert.ok(uk?.length > 0, 'should have UK products');
});

test('Products PUT updates + persists', async () => {
  const { body: created } = await post('/api/products', {
    title: 'Original', brand: 'Gucci', category: '包袋',
    price: 9000, condition: '全新', size: 'Mini', description: 'Orig', images: [], market: 'HK',
  });
  const id = created.data.id;
  const { status, body: updated } = await put(`/api/products/${id}`, { title: 'Updated', price: 9500 });
  assert.equal(status, 200);
  assert.equal(updated.data.title, 'Updated');
  assert.equal(updated.data.price, 9500);

  // Read back
  const { body: read } = await get(`/api/products/${id}`);
  assert.equal(read.data.title, 'Updated');
});

test('Products DELETE → soft-deleted (status=已下架)', async () => {
  const { body: created } = await post('/api/products', {
    title: 'ToDelete', brand: 'Hermes', category: '包袋',
    price: 50000, condition: '全新', size: '25cm', description: 'Del', images: [], market: 'CN',
  });
  const { status, body: deleted } = await del(`/api/products/${created.data.id}`);
  assert.equal(status, 200);
  assert.equal(deleted.data.status, '已下架');
});

// ── ORDERS ───────────────────────────────────────────────────────────────

test('Orders GET → 200 + paginated', async () => {
  const { status, body } = await get('/api/orders');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data?.data));
});

test('Orders POST missing productId → 400', async () => {
  const { status, body } = await post('/api/orders', {});
  assert.equal(status, 400);
  assert.equal(body.success, false);
});

test('Orders PUT valid status → 200', async () => {
  const { body: { data: { data: orders } } } = await get('/api/orders');
  assert.ok(orders.length > 0, 'seed data should exist');
  const id = orders[0].id;
  const { status, body } = await put(`/api/orders/${id}`, { status: '待发货' });
  assert.equal(status, 200);
  assert.equal(body.success, true);
});

// ── FINANCE ──────────────────────────────────────────────────────────────

test('Finance GET → 200 + array', async () => {
  const { status, body } = await get('/api/finance');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
});

test('Finance GET /stats → 200 + stats object', async () => {
  const { status, body } = await get('/api/finance/stats');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(typeof body.data?.totalIncome, 'number');
  assert.equal(typeof body.data?.netProfit, 'number');
});

test('Finance POST → 200 + created', async () => {
  const { status, body } = await post('/api/finance', {
    type: '收入', category: '其他收入', amount: 500,
    description: 'Smoke income', date: '2024-03-01', market: 'UK',
  });
  assert.equal(status, 200);
  assert.equal(body.data?.amount, 500);
});

test('Finance POST invalid type → 400', async () => {
  const { status, body } = await post('/api/finance', {
    type: '非法', category: '其他收入', amount: 100,
    description: 'Invalid', date: '2024-03-01',
  });
  assert.equal(status, 400);
  assert.equal(body.success, false);
});

test('Finance DELETE → removed', async () => {
  const { body: { data: { id } } } = await post('/api/finance', {
    type: '支出', category: '其他支出', amount: 88,
    description: 'To del', date: '2024-03-01',
  });
  const { status } = await del(`/api/finance/${id}`);
  assert.equal(status, 200);
  const { status: get404 } = await get(`/api/finance/${id}`);
  assert.equal(get404, 404);
});

// ── INVENTORY ──────────────────────────────────────────────────────────────

test('Inventory GET → 200 + array', async () => {
  const { status, body } = await get('/api/inventory');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
});

test('Inventory GET /stats → 200 + stats', async () => {
  const { status, body } = await get('/api/inventory/stats');
  assert.equal(status, 200);
  assert.equal(typeof body.data?.totalSKUs, 'number');
});

test('Inventory POST → 200 + created', async () => {
  const { status, body } = await post('/api/inventory', {
    sku: `SMOKE-SKU-${Date.now()}`, productName: 'Smoke Test Item',
    currentStock: 5, minStockThreshold: 2,
  });
  assert.equal(status, 200);
  assert.equal(body.success, true);
});

test('Inventory POST missing sku/productName → 400', async () => {
  const { status, body } = await post('/api/inventory', { productName: 'Only name' });
  assert.equal(status, 400);
  assert.equal(body.success, false);
});

test('Inventory inbound → stock increases', async () => {
  const { body: { data: { id, currentStock: before } } } = await post('/api/inventory', {
    sku: `INBOUND-${Date.now()}`, productName: 'Inbound Test',
    currentStock: 3, minStockThreshold: 1,
  });
  const { status, body } = await post(`/api/inventory/${id}/inbound`, { quantity: 5 });
  assert.equal(status, 200);
  assert.equal(body.data?.item?.currentStock, before + 5);
});

test('Inventory outbound → stock decreases', async () => {
  const { body: { data: { id, currentStock: before } } } = await post('/api/inventory', {
    sku: `OUT-${Date.now()}`, productName: 'Outbound Test',
    currentStock: 10, minStockThreshold: 1,
  });
  const { status, body } = await post(`/api/inventory/${id}/outbound`, { quantity: 3 });
  assert.equal(status, 200);
  assert.equal(body.data?.item?.currentStock, before - 3);
});

test('Inventory outbound insufficient stock → 400', async () => {
  const { body: { data: { id } } } = await post('/api/inventory', {
    sku: `LOW-${Date.now()}`, productName: 'Low Stock Item',
    currentStock: 1, minStockThreshold: 1,
  });
  const { status, body } = await post(`/api/inventory/${id}/outbound`, { quantity: 5 });
  assert.equal(status, 400);
  assert.equal(body.success, false);
});

// ── SUPPORT ───────────────────────────────────────────────────────────────

test('Support tickets GET → 200 + array', async () => {
  const { status, body } = await get('/api/support/tickets');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
});

test('Support tickets POST → 200 + ticket with ticketNo', async () => {
  const { status, body } = await post('/api/support/tickets', {
    subject: 'Smoke Test', description: 'Smoke test desc',
    customerEmail: 'smoke@test.com', customerName: 'Smoke User',
  });
  assert.equal(status, 200);
  assert.ok(body.data?.id);
  assert.ok(body.data?.ticketNo?.startsWith('TKT-'));
});

test('Support tickets POST missing required → 400', async () => {
  const { status, body } = await post('/api/support/tickets', { subject: 'No email' });
  assert.equal(status, 400);
  assert.equal(body.success, false);
});

test('Support FAQs GET → 200 + array', async () => {
  const { status, body } = await get('/api/support/faqs');
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));
});

test('Support ticket messages POST → 200', async () => {
  const { body: { data: tickets } } = await get('/api/support/tickets');
  const ticketId = tickets[0].id;
  const { status, body } = await post(`/api/support/tickets/${ticketId}/messages`, {
    message: 'Smoke reply', author: 'agent', authorName: 'Smoke Agent',
  });
  assert.equal(status, 200);
  assert.equal(body.success, true);
});
