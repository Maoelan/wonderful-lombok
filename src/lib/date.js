const WITA_OFFSET_MS = 8 * 60 * 60 * 1000;

export function todayInWita(now = Date.now()) {
  return new Date(now + WITA_OFFSET_MS).toISOString().slice(0, 10);
}

export function currentTimeInWita(now = Date.now()) {
  return new Date(now + WITA_OFFSET_MS).toISOString().slice(11, 16);
}
