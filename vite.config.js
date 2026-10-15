import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
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
          'style-src-elem': ['self', 'https://fonts.googleapis.com'],
          'style-src-attr': ['unsafe-inline'],
          'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
          'img-src': ['self', 'data:', 'https://images.unsplash.com', 'https://commons.wikimedia.org', 'https://thumb.wikimedia.org', 'https://upload.wikimedia.org', 'https://*.convex.cloud', 'https://*.tile.openstreetmap.org'],
          'connect-src': ['self'],
          'frame-src': ['none'],
          'manifest-src': ['self'],
          'media-src': ['self'],
          'worker-src': ['self', 'blob:'],
          'upgrade-insecure-requests': true
        }
      }
    })
  ]
});
