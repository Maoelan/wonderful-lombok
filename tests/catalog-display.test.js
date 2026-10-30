import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_DESTINATION_LIMIT, HOME_PACKAGE_LIMIT, NAV_PACKAGE_LIMIT, groupDestinationsByRegion, pickFeatured } from '../src/lib/catalog-display.js';

const items = (...names) => names.map((name) => ({ name }));

test('pickFeatured puts flagged items first and caps the list', () => {
  const list = [...items('a', 'b', 'c', 'd')];
  list[2].featured = true;
  assert.deepEqual(pickFeatured(list, 2).map((item) => item.name), ['c', 'a']);
  assert.deepEqual(pickFeatured(list, 3).map((item) => item.name), ['c', 'a', 'b']);
  assert.deepEqual(pickFeatured(list).map((item) => item.name), ['c', 'a', 'b', 'd']);
});

test('pickFeatured falls back to catalogue order when nothing is flagged', () => {
  const list = items('a', 'b', 'c', 'd');
  assert.deepEqual(pickFeatured(list, 3).map((item) => item.name), ['a', 'b', 'c']);
  assert.deepEqual(pickFeatured(list, 0), []);
  assert.deepEqual(pickFeatured(null, 3), []);
  assert.equal(HOME_PACKAGE_LIMIT, 3);
  assert.equal(HOME_DESTINATION_LIMIT, 6);
  assert.equal(NAV_PACKAGE_LIMIT, 3);
});

test('groupDestinationsByRegion orders known regions and buckets unassigned entries', () => {
  const destinations = [
    { name: 'Tanah Lot', region: 'other' },
    { name: 'Tanjung Aan', region: 'south-coast' },
    { name: 'Gili Air', region: 'gilis-sekotong' },
    { name: 'No region' },
    { name: 'Unknown region', region: 'not-a-region' }
  ];
  const groups = groupDestinationsByRegion(destinations);
  assert.deepEqual(groups.map((group) => group.key), ['south-coast', 'gilis-sekotong', 'other']);
  assert.deepEqual(groups[0].items.map((item) => item.name), ['Tanjung Aan']);
  assert.deepEqual(groups[2].items.map((item) => item.name), ['Tanah Lot', 'No region', 'Unknown region']);
});

test('groupDestinationsByRegion stays flat until meaningful regions are assigned', () => {
  assert.deepEqual(groupDestinationsByRegion(items('a', 'b')), []);
  assert.deepEqual(groupDestinationsByRegion([{ name: 'a', region: 'other' }]), []);
  assert.deepEqual(groupDestinationsByRegion(null), []);
});
