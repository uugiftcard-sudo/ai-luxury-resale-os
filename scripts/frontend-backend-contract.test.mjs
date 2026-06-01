import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const files = [
  'web/src/api/inventory.ts',
  'web/src/api/support.ts',
  'web/src/contexts/InventoryContext.tsx',
  'web/src/contexts/SupportContext.tsx',
  'web/src/pages/Inventory.tsx',
  'web/src/pages/AdminWarehouse.tsx',
];

test('inventory and support frontend use backend API instead of localStorage demo storage', async () => {
  const contents = Object.fromEntries(
    await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])),
  );

  assert.match(contents['web/src/api/inventory.ts'], /fetch\(`\/api\$\{path\}`/);
  assert.match(contents['web/src/api/inventory.ts'], /\/inventory\/transactions/);
  assert.match(contents['web/src/api/support.ts'], /fetch\(`\/api\$\{path\}`/);
  assert.match(contents['web/src/api/support.ts'], /\/support\/tickets/);
  assert.match(contents['web/src/api/support.ts'], /\/support\/faqs/);

  assert.doesNotMatch(contents['web/src/api/inventory.ts'], /mockStorage|inventoryStorage|localStorage/);
  assert.doesNotMatch(contents['web/src/api/support.ts'], /mockStorage|supportStorage|localStorage/);
  assert.doesNotMatch(contents['web/src/contexts/InventoryContext.tsx'], /seedDemo\(\)/);
  assert.doesNotMatch(contents['web/src/contexts/SupportContext.tsx'], /seedDemo\(\)/);
  assert.doesNotMatch(contents['web/src/pages/Inventory.tsx'], /本地演示|localStorage/);
  assert.doesNotMatch(contents['web/src/pages/AdminWarehouse.tsx'], /本地演示|localStorage/);
});
