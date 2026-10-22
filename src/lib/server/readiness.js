import { logServerError } from './diagnostics.js';

const BASE_REQUIRED_ENV = ['PUBLIC_CONVEX_URL', 'CONVEX_SERVER_SECRET'];
const PRODUCTION_REQUIRED_ENV = [...BASE_REQUIRED_ENV, 'PUBLIC_SITE_URL'];

function configured(env, name) {
  return String(env?.[name] || '').trim().length > 0;
}

export function configReadiness(env = process.env) {
  const required = env?.NODE_ENV === 'production' ? PRODUCTION_REQUIRED_ENV : BASE_REQUIRED_ENV;
  const missing = required.filter((name) => !configured(env, name));
  return { ready: missing.length === 0, missing };
}

export async function readinessReport({ env = process.env, checkDependency } = {}) {
  const config = configReadiness(env);
  if (!config.ready) {
    return { ready: false, checks: { config: false, dependency: null }, missing: config.missing };
  }
  if (typeof checkDependency !== 'function') {
    return { ready: true, checks: { config: true, dependency: null }, missing: [] };
  }

  try {
    await checkDependency();
    return { ready: true, checks: { config: true, dependency: true }, missing: [] };
  } catch (cause) {
    logServerError('readiness_dependency_failed', cause, { operation: 'readiness_check' });
    return { ready: false, checks: { config: true, dependency: false }, missing: [] };
  }
}
