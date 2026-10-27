import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackSocialImage, getSocialImageUrl } from '../src/lib/social-image.js';

const origin = 'https://example.com';

test('social images fall back to a valid local image when empty', () => {
  assert.equal(getSocialImageUrl('', origin), `${origin}${fallbackSocialImage}`);
  assert.equal(getSocialImageUrl(undefined, origin), `${origin}${fallbackSocialImage}`);
  assert.equal(getSocialImageUrl('/', origin), `${origin}${fallbackSocialImage}`);
});

test('social images resolve relative URLs and reject non-web protocols', () => {
  assert.equal(getSocialImageUrl('/images/tour.jpg', origin), `${origin}/images/tour.jpg`);
  assert.equal(getSocialImageUrl('https://cdn.example.com/tour.jpg', origin), 'https://cdn.example.com/tour.jpg');
  assert.equal(getSocialImageUrl('javascript:alert(1)', origin), `${origin}${fallbackSocialImage}`);
  assert.equal(getSocialImageUrl('data:image/png;base64,abc', origin), `${origin}${fallbackSocialImage}`);
});
