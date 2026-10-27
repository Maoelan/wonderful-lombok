import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

function malformedUrlGuard() {
  return (req, res, next) => {
    try {
      decodeURI(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.statusCode = 400;
      res.setHeader('cache-control', 'no-store');
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.setHeader('x-content-type-options', 'nosniff');
      res.end('Permintaan tidak valid.');
      return;
    }
    next();
  };
}

const malformedUrlPlugin = {
  name: 'malformed-url-guard',
  configureServer(server) {
    server.middlewares.use(malformedUrlGuard());
  },
  configurePreviewServer(server) {
    server.middlewares.use(malformedUrlGuard());
  }
};

const localConvexImageSources = (() => {
  try {
    const url = new URL(process.env.PUBLIC_CONVEX_URL || '');
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) return [];
    const port = url.port || '80';
    // Chrome rejects an IPv6 literal in a CSP source, so only emit the host
    // form that matches the configured Convex URL.
    if (url.hostname === '[::1]') return [`http://[::1]:${port}`];
    return [`http://127.0.0.1:${port}`, `http://localhost:${port}`];
  } catch {
    return [];
  }
})();

export default defineConfig({
  plugins: [
    malformedUrlPlugin,
    sveltekit({
      adapter: adapter(),
      csp: {
        mode: 'nonce',
        directives: {
          'default-src': ['self'],
          'base-uri': ['self'],
          'frame-ancestors': ['none'],
          'object-src': ['none'],
          'form-action': ['self'],
          'script-src': ['self'],
          'style-src-elem': ['self', 'https://fonts.googleapis.com', 'https://api.mapbox.com'],
          'style-src-attr': ['unsafe-inline'],
          'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
          'img-src': ['self', 'data:', 'blob:', 'https://images.unsplash.com', 'https://commons.wikimedia.org', 'https://thumb.wikimedia.org', 'https://upload.wikimedia.org', 'https://*.convex.cloud', 'https://*.mapbox.com', ...localConvexImageSources],
          'connect-src': ['self', 'https://*.mapbox.com'],
          'frame-src': ['none'],
          'manifest-src': ['self'],
          'media-src': ['self'],
          'worker-src': ['self', 'blob:'],
          'upgrade-insecure-requests': localConvexImageSources.length === 0
        }
      }
    })
  ]
});
