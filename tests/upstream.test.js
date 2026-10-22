import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithRetry } from '../src/lib/server/upstream.js';

const noSleep = async () => {};

test('upstream retries a transient failure once', async () => {
  let calls = 0;
  const response = await fetchWithRetry('https://upstream.test/data', {}, {
    fetchImpl: async () => {
      calls += 1;
      return new Response(calls === 1 ? 'busy' : 'ok', { status: calls === 1 ? 503 : 200 });
    },
    retries: 1,
    retryDelayMs: 0,
    sleep: noSleep
  });

  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

test('upstream does not retry a client error', async () => {
  let calls = 0;
  const response = await fetchWithRetry('https://upstream.test/missing', {}, {
    fetchImpl: async () => {
      calls += 1;
      return new Response('missing', { status: 404 });
    },
    retries: 2,
    retryDelayMs: 0,
    sleep: noSleep
  });

  assert.equal(response.status, 404);
  assert.equal(calls, 1);
});

test('upstream returns the last response after the retry budget', async () => {
  let calls = 0;
  const response = await fetchWithRetry('https://upstream.test/down', {}, {
    fetchImpl: async () => {
      calls += 1;
      return new Response('down', { status: 503 });
    },
    retries: 1,
    retryDelayMs: 0,
    sleep: noSleep
  });

  assert.equal(response.status, 503);
  assert.equal(calls, 2);
});

test('upstream retries a network error and then succeeds', async () => {
  let calls = 0;
  const response = await fetchWithRetry('https://upstream.test/flaky', {}, {
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new Error('network down');
      return new Response('ok', { status: 200 });
    },
    retries: 1,
    retryDelayMs: 0,
    sleep: noSleep
  });

  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

test('upstream aborts each attempt and keeps the retry bounded', async () => {
  let calls = 0;
  await assert.rejects(
    fetchWithRetry('https://upstream.test/slow', {}, {
      fetchImpl: (_url, { signal }) => new Promise((resolve, reject) => {
        calls += 1;
        const keepAlive = setTimeout(() => {}, 1_000);
        const abort = () => {
          clearTimeout(keepAlive);
          reject(signal.reason);
        };
        if (signal.aborted) abort();
        else signal.addEventListener('abort', abort, { once: true });
      }),
      timeoutMs: 5,
      retries: 1,
      retryDelayMs: 0,
      sleep: noSleep
    }),
    (error) => error.name === 'TimeoutError'
  );

  assert.equal(calls, 2);
});
