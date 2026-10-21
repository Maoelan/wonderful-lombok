const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 1;
const MAX_RETRIES = 3;

const retryableStatus = (status) => status === 429 || status >= 500;

export async function fetchWithRetry(url, options = {}, {
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = DEFAULT_RETRIES,
  retryDelayMs = 200,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function.');
  const timeout = Number(timeoutMs);
  if (!Number.isFinite(timeout) || timeout <= 0) throw new RangeError('timeoutMs must be a positive number.');

  const attempts = Math.max(0, Math.min(MAX_RETRIES, Number.isInteger(retries) ? retries : DEFAULT_RETRIES)) + 1;
  const delay = Math.max(0, Number(retryDelayMs) || 0);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const signal = options.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(timeout)])
      : AbortSignal.timeout(timeout);
    let response;
    try {
      response = await fetchImpl(url, { ...options, signal });
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
    }

    if (response) {
      if (!retryableStatus(response.status) || attempt === attempts) return response;
      try {
        await response.body?.cancel?.();
      } catch {
        // The response body is already closed or cannot be cancelled.
      }
    }

    await sleep(delay * attempt);
  }

  throw lastError || new Error('Upstream request failed.');
}
