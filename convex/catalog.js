import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';
import { readCatalogState, saveCatalog } from './catalogStore';

export const get = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return (await readCatalogState(ctx)).data; } });

export const getWithRevision = query({ args: serverSecret, handler: async (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return readCatalogState(ctx); } });

export const save = mutation({
  args: { ...serverSecret, data: v.any(), expectedRevision: v.number() },
  handler: async (ctx, { serverSecret, data, expectedRevision }) => {
    requireServerSecret(serverSecret);
    return saveCatalog(ctx, { data, expectedRevision });
  }
});
