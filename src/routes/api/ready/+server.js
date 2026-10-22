import { json } from '@sveltejs/kit';
import { PUBLIC_CONVEX_URL } from '$app/env/public';
import { PUBLIC_SITE_URL } from '$app/env/private';
import { convexQuery } from '#lib/server/db.js';
import { readinessReport } from '#lib/server/readiness.js';

const headers = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow'
};

export async function GET() {
  const env = { ...process.env };
  if (PUBLIC_CONVEX_URL) env.PUBLIC_CONVEX_URL = PUBLIC_CONVEX_URL;
  if (PUBLIC_SITE_URL) env.PUBLIC_SITE_URL = PUBLIC_SITE_URL;

  const report = await readinessReport({
    env,
    checkDependency: () => convexQuery('catalog:get')
  });

  return json(
    { status: report.ready ? 'ready' : 'not_ready' },
    { status: report.ready ? 200 : 503, headers }
  );
}
