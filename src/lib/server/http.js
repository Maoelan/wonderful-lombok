import { json } from '@sveltejs/kit';

export function tooManyRequests(message, result) {
  return json(
    { error: message },
    { status: 429, headers: { 'retry-after': String(Math.max(1, result.retryAfterSeconds || 1)) } }
  );
}
