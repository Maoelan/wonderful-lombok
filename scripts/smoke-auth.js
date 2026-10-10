const base = process.env.APP_URL || 'http://127.0.0.1:5173';
const origin = process.env.APP_ORIGIN || base;
const credentials = new URLSearchParams({
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_INITIAL_PASSWORD
});

const login = await fetch(`${base}/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded', origin },
  body: credentials,
  redirect: 'manual'
});
if (![200, 303].includes(login.status)) throw new Error(`Login gagal dengan status ${login.status}.`);
const cookie = login.headers.get('set-cookie')?.split(';')[0];
if (!cookie) throw new Error('Session cookie tidak dibuat.');

const admin = await fetch(`${base}/admin`, { headers: { cookie }, redirect: 'manual' });
if (admin.status !== 200) throw new Error(`Admin tidak dapat dibuka: ${admin.status}.`);

const logout = await fetch(`${base}/logout`, { method: 'POST', headers: { cookie, origin }, redirect: 'manual' });
if (logout.status !== 303) throw new Error(`Logout gagal dengan status ${logout.status}.`);

console.log('Smoke test autentikasi lulus: login, halaman admin, dan logout.');
