* eslint-env node *
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function waitForHealth(port, server) {
  const url = `http://127.0.0.1:${port}/api/health`;
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`API exited before health check passed with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw lastError || new Error('Timed out waiting for API health check');
}

function stopServer(server) {
  if (server.exitCode !== null) return;
  try {
    process.kill(-server.pid, 'SIGINT');
  } catch {
    server.kill('SIGINT');
  }
}

test('POST /api/products persists market so market filtering can find the product', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cloth-market-'));
  const dbPath = join(dir, 'cloth.sqlite');
  const port = 3330 + Math.floor(Math.random() * 500);
  const server = spawn('npm', ['run', 'dev', '--workspace=api'], {
    cwd: new URL('..', import.meta.url),
    detached: true,
    env: {
      ...process.env,
      PORT: String(port),
      CLOTH_DB_PATH: dbPath,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForHealth(port, server);

    const createResponse = await fetch(`http://127.0.0.1:${port}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Market Persistence Regression Bag',
        brand: 'Gucci',
        category: '包袋',
        price: 8800,
        originalPrice: 16000,
        condition: '全新',
        size: 'Mini',
        description: 'Regression product should stay visible in UK market filters.',
        images: [],
        market: 'UK',
      }),
    });
    assert.equal(createResponse.status, 200);
    const created = await createResponse.json();
    assert.equal(created.data.market, 'UK');

    const listResponse = await fetch(
      `http://127.0.0.1:${port}/api/products?market=UK&search=${encodeURIComponent('Market Persistence Regression')}`
    );
    assert.equal(listResponse.status, 200);
    const listed = await listResponse.json();
    assert.equal(listed.data.total, 1);
    assert.equal(listed.data.data[0].id, created.data.id);
    assert.equal(listed.data.data[0].market, 'UK');
  } finally {
    stopServer(server);
    rmSync(dir, { recursive: true, force: true });
  }
});
