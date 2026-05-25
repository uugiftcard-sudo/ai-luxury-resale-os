/* eslint-env node */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const header = readFileSync(join(root, 'web/src/components/Header.tsx'), 'utf8');
const css = readFileSync(join(root, 'web/src/components/Header.module.css'), 'utf8');

test('mobile navigation implements the Phase 1 overlay contract', () => {
  assert.match(css, /@media\s*\(\s*max-width:\s*768px\s*\)/);
  assert.match(css, /\.mobileBackdrop/);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /height:\s*calc\(100dvh\s*-\s*68px\)/);

  assert.match(header, /document\.body\.style\.overflow/);
  assert.match(header, /e\.key === 'Escape'[^]*setMenuOpen\(false\)/);
  assert.match(header, /className=\{styles\.mobileBackdrop\}/);
  assert.match(header, /to=\{marketPath\('\/cart'\)\}/);
});
