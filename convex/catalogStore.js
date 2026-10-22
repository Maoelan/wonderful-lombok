async function findCatalog(ctx) {
  return ctx.db.query('catalog').withIndex('by_key', (q) => q.eq('key', 'main')).unique();
}

export async function readCatalogState(ctx) {
  const current = await findCatalog(ctx);
  return {
    data: current?.data ?? null,
    revision: current?.revision ?? 0
  };
}

export async function saveCatalog(ctx, { data, expectedRevision, now = Date.now() }) {
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    throw new Error('Revisi katalog tidak valid.');
  }

  const current = await findCatalog(ctx);
  const currentRevision = current?.revision ?? 0;
  if (expectedRevision !== currentRevision) {
    return { ok: false, conflict: true, revision: currentRevision };
  }

  const revision = currentRevision + 1;
  if (current) await ctx.db.patch(current._id, { data, updatedAt: now, revision });
  else await ctx.db.insert('catalog', { key: 'main', data, updatedAt: now, revision });
  return { ok: true, revision };
}
