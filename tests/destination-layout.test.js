import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css = readFileSync(new URL('../src/lib/travel-ui.css', import.meta.url), 'utf8');

test('destination related-packages intro stacks below its heading on desktop', () => {
  const start = css.lastIndexOf('@media (min-width: 761px)');
  assert.ok(start >= 0, 'desktop layout rule is present');
  const desktop = css.slice(start);
  assert.match(desktop, /body \.site-theme \.destination-related \.section-heading\s*\{[^}]*flex-direction:\s*column;[^}]*align-items:\s*flex-start;/);
  assert.match(desktop, /body \.site-theme \.destination-related \.section-heading > p\s*\{[^}]*margin:\s*0;/);
  assert.doesNotMatch(desktop, /body \.site-theme \.section-heading\s*\{/);
});

test('mobile keeps the existing stacked section-heading rule', () => {
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?body \.site-theme \.section-heading:has\(> p\) \{ grid-template-columns: minmax\(0, 1fr\); \}/);
});
