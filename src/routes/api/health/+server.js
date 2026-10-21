import { json } from '@sveltejs/kit';

const headers = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow'
};

export function GET() {
  return json({ status: 'ok' }, { headers });
}
