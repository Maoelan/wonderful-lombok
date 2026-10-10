import adapter from '@sveltejs/adapter-node';
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
          'style-src-elem': ['self'],
          'style-src-attr': ['unsafe-inline'],
          'font-src': ['self', 'data:'],
          'img-src': ['self', 'data:', 'https://images.unsplash.com', 'https://*.tile.openstreetmap.org'],
          'connect-src': ['self', 'https://nominatim.openstreetmap.org', 'https://router.project-osrm.org'],
          'frame-src': ['none']
        }
      }
    })
  ]
});
