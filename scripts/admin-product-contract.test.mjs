/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const adminPage = readFileSync(join(root, 'web/src/pages/Admin.tsx'), 'utf8');
const apiClient = readFileSync(join(root, 'web/src/api/client.ts'), 'utf8');

test('admin product list respects product API pagination limit', () => {
  const matches = [...adminPage.matchAll(/productApi\.list\(market,\s*\{\s*limit:\s*(\d+)\s*\}\)/g)];
  assert.ok(matches.length > 0, 'expected Admin page to call productApi.list with an explicit limit');
  for (const match of matches) {
    assert.ok(Number(match[1]) <= 50, `Admin productApi.list limit ${match[1]} exceeds API max 50`);
  }
});

test('product create and update include the selected market', () => {
  assert.match(apiClient, /body:\s*JSON\.stringify\(\{\s*\.\.\.data,\s*market\s*\}\)/);
});
