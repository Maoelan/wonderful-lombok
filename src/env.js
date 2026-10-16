import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  PUBLIC_CONVEX_URL: {
    public: true,
    description: 'Convex deployment URL for server-side data access.'
  },
  PUBLIC_SITE_URL: {
    description: 'Canonical public origin, for example https://wonderfullombok.example.',
    schema: (value) => {
      if (!value) return undefined;
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('PUBLIC_SITE_URL must use http or https');
      return url.origin;
    }
  },
  GOOGLE_SITE_VERIFICATION: {
    description: 'Optional Google Search Console HTML-tag verification token.',
    schema: (value) => value?.trim() || undefined
  },
  BING_SITE_VERIFICATION: {
    description: 'Optional Bing Webmaster Tools HTML-tag verification token.',
    schema: (value) => value?.trim() || undefined
  }
});
