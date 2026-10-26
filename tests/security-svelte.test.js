import test from 'node:test';
import assert from 'node:assert/strict';
import { extractScripts } from '../scripts/security-svelte.mjs';

test('security extraction covers instance and module scripts with original line numbers', () => {
  const source = '<h1>Example</h1>\n<script>\n  const value = 1;\n</script>\n<script module>\n  const other = 2;\n</script>';
  const scripts = extractScripts(source, 'Example.svelte');
  assert.equal(scripts.length, 2);
  assert.equal(scripts[0].kind, 'instance');
  assert.equal(scripts[0].code.split('\n')[2], '  const value = 1;');
  assert.equal(scripts[1].kind, 'module');
  assert.equal(scripts[1].code.split('\n')[5], '  const other = 2;');
});

test('security extraction handles markup-only and TypeScript components', () => {
  assert.deepEqual(extractScripts('<p>Static</p>', 'Static.svelte'), []);
  assert.match(extractScripts('<script lang="ts">let x: number = 1;</script>', 'Typed.svelte')[0].code, /let x: number/);
});

test('security extraction fails on malformed Svelte instead of silently omitting it', () => {
  assert.throws(() => extractScripts('<script>const = ;</script>', 'Broken.svelte'));
});
