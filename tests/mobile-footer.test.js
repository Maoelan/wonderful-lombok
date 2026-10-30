import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const refresh = readFileSync(new URL('../src/lib/journey-refresh.css', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/lib/SiteFooter.svelte', import.meta.url), 'utf8');

function mobileBlock() {
  const start = refresh.lastIndexOf('@media (max-width: 760px)');
  assert.ok(start >= 0, 'mobile layout block is present');
  const end = refresh.indexOf('\n}', start);
  return refresh.slice(start, end);
}

test('desktop footer uses three top-aligned columns with group headings', () => {
  assert.match(refresh, /body \.site-theme \.travel-footer-main \{ display: grid; grid-template-columns: minmax\(0, 1\.3fr\) minmax\(0, \.85fr\) minmax\(0, 1\.05fr\); gap: 32px 48px; align-items: start; \}/);
  assert.match(footer, /class="travel-footer-title" id="footer-nav-title">\{c\.footerExplore\}<\/h2>/);
  assert.match(footer, /class="travel-footer-title" id="footer-contact-title">\{c\.contact\}<\/h2>/);
  assert.match(footer, /aria-labelledby="footer-nav-title"/);
  assert.match(footer, /aria-labelledby="footer-contact-title"/);
});

test('desktop footer stacks links and closes with a divider and copyright line', () => {
  assert.match(refresh, /body \.site-theme \.travel-footer-list \{ display: grid; align-content: start; gap: 0; min-width: 0; \}/);
  assert.match(refresh, /body \.site-theme \.travel-footer-legal \{ margin: 20px 0 0; padding-top: 12px; border-top: 1px solid var\(--color-border\);/);
  assert.match(footer, /<p class="travel-footer-legal">© \{year\} Wonderful Lombok<\/p>/);
});

test('mobile footer puts contact before navigation and keeps two link columns', () => {
  const mobile = mobileBlock();
  assert.match(mobile, /body \.site-theme \.travel-footer-main \{ grid-template-columns: minmax\(0, 1fr\); gap: 20px; \}/);
  assert.match(mobile, /body \.site-theme \.travel-footer-brand \{ grid-row: 1;/);
  assert.match(mobile, /body \.site-theme \.travel-footer-contact \{ grid-row: 2; \}/);
  assert.match(mobile, /body \.site-theme \.travel-footer-nav \{ grid-row: 3; \}/);
  assert.match(mobile, /body \.site-theme \.travel-footer-nav \.travel-footer-list \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); column-gap: 12px; \}/);
});

test('mobile and tablet rows keep a 44px touch target while desktop stays compact', () => {
  assert.match(refresh, /body \.site-theme \.travel-footer-list a, body \.site-theme \.travel-footer-list p \{[^}]*min-height: 30px;[^}]*overflow-wrap: anywhere;/);
  assert.match(mobileBlock(), /body \.site-theme \.travel-footer-list a, body \.site-theme \.travel-footer-list p \{ min-height: 44px; font-size: 15px; line-height: 1\.45; \}/);
  assert.match(mobileBlock(), /body \.site-theme \.travel-footer-nav \.travel-footer-list a \{ align-items: center; padding-block: 11px; \}/);
  assert.match(refresh, /@media \(min-width: 761px\) and \(max-width: 900px\) \{[\s\S]*?travel-footer-list a, body \.site-theme \.travel-footer-list p \{ min-height: 44px; \}/);
});

test('social links are contact rows instead of a separate bottom row', () => {
  assert.doesNotMatch(footer, /travel-footer-bottom/);
  const contactBlock = footer.match(/<section class="travel-footer-contact"[\s\S]*?<\/section>/);
  assert.ok(contactBlock, 'contact section is present');
  for (const key of ['instagram', 'tiktok', 'facebook']) assert.match(contactBlock[0], new RegExp(`settings\\.${key}`));
  assert.match(contactBlock[0], /<UiIcon name="instagram" \/>Instagram/);
});

test('mobile footer gutter matches page content and the logo has no transparent offset', () => {
  assert.match(mobileBlock(), /footer\.travel-footer \{ padding: 28px max\(18px, env\(safe-area-inset-right\)\) calc\(24px \+ env\(safe-area-inset-bottom\)\) max\(18px, env\(safe-area-inset-left\)\); \}/);
  assert.match(footer, /src="\/wonderful-lombok-logo-footer\.png" alt="Wonderful Lombok" width="287" height="183"/);
});
