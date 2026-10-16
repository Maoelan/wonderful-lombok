import { BING_SITE_VERIFICATION, GOOGLE_SITE_VERIFICATION } from '$app/env/private';

export function load() {
  return {
    googleSiteVerification: GOOGLE_SITE_VERIFICATION || '',
    bingSiteVerification: BING_SITE_VERIFICATION || ''
  };
}
