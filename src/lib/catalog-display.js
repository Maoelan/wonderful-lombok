export const DESTINATION_REGION_KEYS = ['south-coast', 'east-lombok', 'gilis-sekotong', 'waterfalls-rinjani', 'west-culture', 'other'];
export const HOME_PACKAGE_LIMIT = 3;
export const HOME_DESTINATION_LIMIT = 6;
export const NAV_PACKAGE_LIMIT = 3;
export const NAV_DESTINATION_LIMIT = 4;

export function pickFeatured(items, limit = Number.POSITIVE_INFINITY) {
  const list = Array.isArray(items) ? items : [];
  if (limit <= 0) return [];
  const featured = list.filter((item) => item?.featured === true);
  const ordered = featured.length ? [...featured, ...list.filter((item) => item?.featured !== true)] : list;
  return ordered.slice(0, limit);
}

const regionKey = (item) => DESTINATION_REGION_KEYS.includes(item?.region) ? item.region : 'other';

export function groupDestinationsByRegion(destinations) {
  const list = Array.isArray(destinations) ? destinations : [];
  if (!list.some((item) => DESTINATION_REGION_KEYS.includes(item?.region) && item.region !== 'other')) return [];
  return DESTINATION_REGION_KEYS
    .map((key) => ({ key, items: list.filter((item) => regionKey(item) === key) }))
    .filter((group) => group.items.length > 0);
}
