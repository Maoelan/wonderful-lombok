const STORAGE_URL = /^https:\/\/[^/]+\/api\/storage\/([A-Za-z0-9_-]+)(?:[?#].*)?$/;

export function storageIdFromUrl(value) {
  if (typeof value !== 'string') return null;
  return value.match(STORAGE_URL)?.[1] ?? null;
}

export function collectStorageIds(value, ids = new Set(), depth = 0) {
  if (depth > 20) return ids;
  if (typeof value === 'string') {
    const storageId = storageIdFromUrl(value);
    if (storageId) ids.add(storageId);
    return ids;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStorageIds(item, ids, depth + 1);
    return ids;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStorageIds(item, ids, depth + 1);
  }
  return ids;
}

export function removedStorageIds(previous, next) {
  const current = collectStorageIds(next);
  return [...collectStorageIds(previous)].filter((storageId) => !current.has(storageId));
}

export async function deleteRemovedMedia(ctx, previous, next) {
  let deleted = 0;
  for (const storageId of removedStorageIds(previous, next)) {
    try {
      await ctx.storage.delete(storageId);
      deleted += 1;
    } catch {
      // The catalog is already saved; an orphaned file must not roll it back.
    }
  }
  return deleted;
}
