const eventName = (value) => typeof value === 'string' && /^[a-z][a-z0-9_]{0,63}$/.test(value) ? value : 'server_error';
const errorName = (value) => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value) ? value : undefined;
const errorCode = (value) => typeof value === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(value) ? value : undefined;

// Log only bounded identifiers. Error messages, stacks, request bodies, and customer
// fields can contain secrets or personal data, so they must never be serialized here.
export function logServerError(event, error, context = {}) {
  const record = { level: 'error', event: eventName(event) };
  const name = errorName(error?.name);
  const code = errorCode(error?.code);
  const causeName = errorName(error?.cause?.name);
  if (name) record.name = name;
  if (code) record.code = code;
  if (causeName) record.causeName = causeName;
  if (Number.isInteger(error?.status)) record.status = error.status;
  if (typeof context.locale === 'string' && /^[a-z]{2}(?:-[a-z]{2})?$/.test(context.locale)) record.locale = context.locale;
  if (typeof context.operation === 'string' && /^[a-z][a-z0-9_]{0,40}$/.test(context.operation)) record.operation = context.operation;
  console.error(JSON.stringify(record));
}
