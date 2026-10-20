export const SESSION_TTL_SECONDS = 8 * 60 * 60;

const PRODUCTION_COOKIE = '__Host-wl_admin_session';
const DEVELOPMENT_COOKIE = 'wl_admin_session';

export function sessionCookieName(production) {
  return production ? PRODUCTION_COOKIE : DEVELOPMENT_COOKIE;
}

export function sessionCookieOptions(production) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: production,
    priority: 'high',
    maxAge: SESSION_TTL_SECONDS
  };
}

export function sessionCookieClearOptions(production) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: production
  };
}
