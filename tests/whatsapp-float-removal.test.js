import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const sourceRoot = fileURLToPath(new URL('../src', import.meta.url));

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

test('the floating WhatsApp shortcut is removed from every page and stylesheet', () => {
  const files = sourceFiles(sourceRoot).filter((file) => /\.(svelte|css|js)$/.test(file));
  const offenders = files.filter((file) => {
    const source = readFileSync(file, 'utf8');
    return /whatsapp-float|WhatsAppFloat|data-whatsapp-float-avoid/.test(source);
  });

  assert.deepEqual(offenders, []);
  assert.equal(existsSync(join(sourceRoot, 'lib', 'WhatsAppFloat.svelte')), false);
});
