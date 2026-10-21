import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';
import { readCatalogState, saveCatalog } from './catalogStore';
import { deleteRemovedMedia } from './media';

export const get = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return (await readCatalogState(ctx)).data; } });

export const getWithRevision = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return readCatalogState(ctx); } });

export const save = mutation({
  args: { ...serverSecret, data: v.any(), expectedRevision: v.number() },
  handler: async (ctx, { serverSecret, data, expectedRevision }) => {
    requireServerSecret(serverSecret);
    const previous = await readCatalogState(ctx);
    const result = await saveCatalog(ctx, { data, expectedRevision });
    if (!result.ok) return result;
    await deleteRemovedMedia(ctx, previous.data, data);
    return result;
  }
});
