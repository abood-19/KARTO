// KARTO server: one Node process = the shared brain for every app
// (site, customer app, POS, kitchen, TV, courier, team, admin). No npm install. Node 20+.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

process.env.TZ = process.env.TZ || 'Asia/Tashkent';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +process.env.PORT || 4000;
const DATA_DIR = process.env.KARTO_DATA || path.join(ROOT, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB = path.join(DATA_DIR, 'karto-db.json');
const KEY = 'karto-demo-db-v4';

// ---- storage: same business rules as the demo, saved to one file ----
let store = {};
try { store = JSON.parse(fs.readFileSync(DB, 'utf8')); } catch {}
const save = () => { const t = DB + '.tmp'; fs.writeFileSync(t, JSON.stringify(store)); fs.renameSync(t, DB); };
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); save(); },
  removeItem: (k) => { delete store[k]; save(); },
};
// ---- live updates to every open screen (Server-Sent Events) ----
const clients = new Set();
globalThis.BroadcastChannel = class { postMessage(m) { const d = `data: ${JSON.stringify(m)}\n\n`; for (const c of clients) c.write(d); } close() {} };
globalThis.window = globalThis;
const nativeFetch = globalThis.fetch;
const { installDemoServer } = await import('../assets/mockServer-D44ux4P6.js');
installDemoServer();
const api = globalThis.fetch; globalThis.fetch = nativeFetch;
const db = () => { try { return JSON.parse(store[KEY] || 'null'); } catch { return null; } };
await api('/api/menu'); // creates the database on first start
// first start: replace the sample PINs with private random ones (owner sees and changes them in Xodimlar)
{ const d = db(); if (d && !d.pinsReady) { const used = new Set(); for (const st of d.staff) { if (st.role === 'owner') { st.pin = crypto.randomBytes(8).toString('hex'); continue; } let p; do { p = String(crypto.randomInt(1000, 10000)); } while (used.has(p)); used.add(p); st.pin = p; }
  d.pinsReady = true; store[KEY] = JSON.stringify(d); save();
  fs.writeFileSync(path.join(DATA_DIR, 'first-pins.txt'), d.staff.filter((x) => x.role !== 'owner').map((x) => `${x.role}: ${x.pin}`).join('\n') + '\n'); } }

// ---- secrets kept in data/ ----
const secret = (file, make) => { const f = path.join(DATA_DIR, file); try { return fs.readFileSync(f, 'utf8').trim(); } catch { const v = make(); fs.writeFileSync(f, v); return v; } };
const ADMIN_PATH = (process.env.ADMIN_PATH || secret('admin-path.txt', () => 'office-' + crypto.randomBytes(5).toString('hex'))).replace(/^\/|\/$/g, '');
const SETUP_KEY = secret('setup-key.txt', () => crypto.randomBytes(4).toString('hex').toUpperCase());

// ---- reset codes: Telegram bot and/or e-mail (Resend) ----
async function deliver(code, to) {
  const via = [], text = `KARTO Admin: password reset code ${code} (valid 15 min). If this wasn't you, ignore it.`;
  if (process.env.TELEGRAM_BOT_TOKEN && to.telegram) {
    try { const r = await nativeFetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: to.telegram, text }) }); if (r.ok) via.push('Telegram'); } catch {}
  }
  if (process.env.RESEND_API_KEY && to.email) {
    try { const r = await nativeFetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ from: process.env.MAIL_FROM || 'KARTO <onboarding@resend.dev>', to: [to.email], subject: 'KARTO — reset code', text }) }); if (r.ok) via.push('E-mail'); } catch {}
  }
  if (!via.length) console.log(`[KARTO] Admin reset code: ${code} (set TELEGRAM_BOT_TOKEN or RESEND_API_KEY to send it automatically)`);
  return via;
}

// ---- small per-IP limiter for login endpoints ----
const hits = new Map();
const limited = (ip) => { const now = Date.now(), h = (hits.get(ip) || []).filter((t) => now - t < 60000); h.push(now); hits.set(ip, h); return h.length > 20; };

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.jpeg': 'image/jpeg', '.gif': 'image/gif' };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS' };
const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', ...CORS }); res.end(body); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  try {
    if (url.pathname.startsWith('/api/') && req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
    if (url.pathname === '/api/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', ...CORS });
      res.write(': ok\n\n'); clients.add(res);
      const ping = setInterval(() => res.write(': ping\n\n'), 25000);
      req.on('close', () => { clearInterval(ping); clients.delete(res); });
      return;
    }
    // ---- owner media upload for offers (image / video, up to 80 MB) ----
    if (url.pathname === '/api/upload' && req.method === 'POST') {
      const who = await api('/api/admin/account', { method: 'GET', headers: req.headers });
      if (!who.ok) return send(res, 401, '{"error":"Admin login required"}');
      const ext = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov' })[(req.headers['content-type'] || '').split(';')[0]];
      if (!ext) return send(res, 415, '{"error":"Use JPG, PNG, WEBP, GIF, MP4, WEBM or MOV"}');
      const parts = []; let size = 0;
      for await (const ch of req) { size += ch.length; if (size > 80e6) return send(res, 413, '{"error":"File is larger than 80 MB"}'); parts.push(ch); }
      const dir = path.join(DATA_DIR, 'uploads'); fs.mkdirSync(dir, { recursive: true });
      const name = Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + ext;
      fs.writeFileSync(path.join(dir, name), Buffer.concat(parts));
      return send(res, 200, JSON.stringify({ url: '/uploads/' + name, type: ext.match(/mp4|webm|mov/) ? 'video' : 'image' }));
    }
    if (url.pathname.startsWith('/uploads/')) {
      const f = path.join(DATA_DIR, 'uploads', path.basename(decodeURIComponent(url.pathname)));
      const st = fs.statSync(f); const type = TYPES[path.extname(f)] || 'application/octet-stream';
      const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
      if (range) { const a = +range[1] || 0, b = range[2] ? +range[2] : st.size - 1; res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${a}-${b}/${st.size}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1, ...CORS }); return fs.createReadStream(f, { start: a, end: b }).pipe(res); }
      res.writeHead(200, { 'content-type': type, 'content-length': st.size, 'accept-ranges': 'bytes', 'cache-control': 'public, max-age=86400', ...CORS }); return fs.createReadStream(f).pipe(res);
    }
    if (url.pathname.startsWith('/api/')) {
      let body = '';
      for await (const ch of req) { body += ch; if (body.length > 1e6) return send(res, 413, '{"error":"Too large"}'); }
      const p = url.pathname;
      if (/^\/api\/auth\//.test(p) && req.method === 'POST' && limited(ip)) return send(res, 429, '{"error":"Too many requests. Wait a minute"}');
      if (p === '/api/auth/admin-setup') { let b = {}; try { b = JSON.parse(body || '{}'); } catch {} if (String(b.setupKey || '').trim().toUpperCase() !== SETUP_KEY) return send(res, 403, '{"error":"Setup key is wrong (see the server window or data/setup-key.txt)"}'); }
      const r = await api(p + url.search, { method: req.method, headers: req.headers, body: body || undefined });
      let out = await r.text();
      if (p === '/api/auth/admin-forgot' && r.ok) { const j = JSON.parse(out); const via = j._code ? await deliver(j._code, j._to || {}) : []; out = JSON.stringify({ ok: true, via }); }
      return send(res, r.status, out);
    }
    // ---- static apps ----
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (rel === '') rel = 'site/';
    let first = rel.split('/')[0];
    const sys = rel === ADMIN_PATH + '/system' || rel.startsWith(ADMIN_PATH + '/system/');
    if (sys) { rel = rel.slice((ADMIN_PATH + '/system').length).replace(/^\//, '') || 'index.html'; if (!path.extname(rel) && !rel.endsWith('/') && rel !== 'index.html') rel += '/'; first = 'system'; }
    else {
      // the full-system page and the owner app live only behind the secret owner link
      if (first === 'owner' || first === 'admin' || rel === 'index.html' || first === 'hub') return send(res, 404, 'Not found', 'text/plain');
      if (first === ADMIN_PATH) rel = 'owner' + rel.slice(ADMIN_PATH.length);
    }
    if (/^(server|data|node_modules)$/.test(first) || rel.split('/').some((s) => s.startsWith('.'))) return send(res, 404, 'Not found', 'text/plain');
    if (!sys && !path.extname(rel) && !rel.endsWith('/')) { res.writeHead(301, { location: '/' + (rel.startsWith('owner') ? ADMIN_PATH + rel.slice(5) : rel) + '/' }); return res.end(); }
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep)) return send(res, 404, 'Not found', 'text/plain');
    let buf = fs.readFileSync(file);
    const ext = path.extname(file);
    if (ext === '.html') buf = Buffer.from(String(buf).replace('<head>', '<head><script>window.KARTO_SERVER=true</script>'));
    res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': ext === '.html' || file.endsWith('sw.js') ? 'no-cache' : 'public, max-age=3600', 'x-content-type-options': 'nosniff', ...(first === ADMIN_PATH || sys ? { 'x-robots-tag': 'noindex' } : {}) });
    res.end(buf);
  } catch (e) {
    const nf = e.code === 'ENOENT' || e.code === 'EISDIR';
    if (!nf) console.error(e);
    if (!res.headersSent) send(res, nf ? 404 : 500, nf ? 'Not found' : 'Server error', 'text/plain');
  }
}).listen(PORT, () => {
  const d = db() || {};
  console.log(`\n  KARTO is running\n  Website:  http://localhost:${PORT}/site/\n  Restaurant: http://localhost:${PORT}/restaurant/\n  Owner + full system: http://localhost:${PORT}/${ADMIN_PATH}/  (keep this link private)`);
  if (!d.admin) console.log(`  First admin setup key: ${SETUP_KEY}\n  First staff PINs: data/first-pins.txt (change them in Owner → Xodimlar)\n`);
});
