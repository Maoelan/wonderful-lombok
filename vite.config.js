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
          'script-src': ['self', 'https://maps.googleapis.com', 'https://maps.gstatic.com'],
          'style-src-elem': ['self', 'https://fonts.googleapis.com', 'https://api.mapbox.com'],
          'style-src-attr': ['unsafe-inline'],
          'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
          'img-src': ['self', 'data:', 'blob:', 'https://images.unsplash.com', 'https://commons.wikimedia.org', 'https://thumb.wikimedia.org', 'https://upload.wikimedia.org', 'https://*.convex.cloud', 'https://maps.googleapis.com', 'https://*.googleapis.com', 'https://maps.gstatic.com', 'https://*.gstatic.com', 'https://*.mapbox.com'],
          'connect-src': ['self', 'https://maps.googleapis.com', 'https://*.googleapis.com', 'https://maps.gstatic.com', 'https://*.gstatic.com', 'https://api.mapbox.com', 'https://events.mapbox.com', 'https://*.tiles.mapbox.com'],
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
