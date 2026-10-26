import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireServerSecret, serverSecret } from './serverAuth';

export const generateUploadUrl = mutation({ args: serverSecret, handler: (ctx, { serverSecret }) => { requireServerSecret(serverSecret); return ctx.storage.generateUploadUrl(); } });
export const getUrl = mutation({ args: { ...serverSecret, storageId: v.id('_storage') }, handler: (ctx, { serverSecret, storageId }) => { requireServerSecret(serverSecret); return ctx.storage.getUrl(storageId); } });

export const remove = mutation({
  args: { ...serverSecret, storageId: v.id('_storage') },
  handler: async (ctx, { serverSecret, storageId }) => {
    requireServerSecret(serverSecret);
    try {
      await ctx.storage.delete(storageId);
      return true;
    } catch {
      return false;
    }
  }
});
