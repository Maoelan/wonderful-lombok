import assert from 'node:assert/strict';
import test from 'node:test';
import { imageSrcset, imageUrl } from '../src/lib/image.js';

test('Wikimedia images request an appropriate display width', () => {
  const redirect = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/PANTAI%20TANJUNG%20AAN.jpg?width=1600';
  const original = 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Gili_Trawangan.jpeg';
  assert.match(imageUrl(redirect, 640), /width=640$/);
  assert.equal(imageUrl(original, 640), 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gili_Trawangan.jpeg?width=640');
  assert.match(imageSrcset(original, [480, 800]), /Gili_Trawangan\.jpeg\?width=480 480w, .*Gili_Trawangan\.jpeg\?width=800 800w/);
});

test('non-Wikimedia and local image URLs remain unchanged', () => {
  assert.equal(imageUrl('https://example.convex.cloud/api/storage/id', 640), 'https://example.convex.cloud/api/storage/id');
  assert.equal(imageUrl('/wonderful-lombok-icon-192.png', 640), '/wonderful-lombok-icon-192.png');
});

test('production image URLs use Vercel optimization', () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = '1';
  const optimized = imageUrl('https://commons.wikimedia.org/wiki/Special:Redirect/file/Pantai.jpg?width=1600', 640);
  assert.match(optimized, /^\/_vercel\/image\?/);
  assert.match(optimized, /w=640&q=70$/);
  if (previous === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previous;
});
