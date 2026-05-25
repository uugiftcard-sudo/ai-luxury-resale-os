* eslint-env node *
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function waitForHealth(port, server) {
  const url = `http://127.0.0.1:${port}/api/health`;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`API exited before health check passed with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until the dev server finishes booting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Timed out waiting for API health check');
}

function stopServer(server) {
  if (server.exitCode !== null) return;
  try {
    process.kill(-server.pid, 'SIGINT');
  } catch {
    server.kill('SIGINT');
  }
}

async function postJson(port, path, body) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { response, payload: await response.json() };
}

async function withApi(testBody) {
  const dir = mkdtempSync(join(tmpdir(), 'cloth-validation-'));
  const dbPath = join(dir, 'cloth.sqlite');
  const port = 3840 + Math.floor(Math.random() * 500);
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
    await testBody(port);
  } finally {
    stopServer(server);
    rmSync(dir, { recursive: true, force: true });
  }
}

test('POST routes return 400 JSON for missing required fields', async () => {
  await withApi(async (port) => {
    const cases = [
      ['/api/products', {}, '缺少必填字段'],
      ['/api/orders', {}, '缺少商品ID'],
      ['/api/finance', {}, '缺少必填字段'],
      ['/api/inventory', {}, 'sku 和 productName 为必填项'],
      ['/api/support/tickets', {}, 'subject、description、customerEmail 为必填项'],
      ['/api/support/tickets/st001/messages', {}, 'message、author、authorName 为必填项'],
    ];

    for (const [path, body, expectedError] of cases) {
      const { response, payload } = await postJson(port, path, body);
      assert.equal(response.status, 400, path);
      assert.equal(response.headers.get('content-type')?.includes('application/json'), true, path);
      assert.equal(payload.success, false, path);
      assert.equal(typeof payload.error, 'string', path);
      assert.equal(payload.error.includes(expectedError), true, path);
      assert.equal('stack' in payload, false, path);
    }
  });
});

test('malformed JSON returns structured JSON instead of HTML or stack trace', async () => {
  await withApi(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title"',
    });

    const text = await response.text();
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('content-type')?.includes('application/json'), true);
    assert.doesNotMatch(text, /<!doctype html|<pre>|SyntaxError/i);

    const payload = JSON.parse(text);
    assert.equal(payload.success, false);
    assert.equal(typeof payload.error, 'string');
    assert.equal('stack' in payload, false);
  });
});
