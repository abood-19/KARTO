// Shared helper for the light KARTO pages (hub, courier, team, admin login).
// Demo mode (no server): loads the in-browser KARTO server. Server mode: talks to KARTO_API (or same origin).
(function () {
  const K = (window.KARTO = window.KARTO || {});
  const base = (window.KARTO_API || '').replace(/\/$/, '');
  K.ready = (window.KARTO_SERVER || base)
    ? Promise.resolve()
    : import('./mockServer-D44ux4P6.js').then((m) => { m.installDemoServer(); K.demo = true; K.reset = m.resetDemo; });
  const tok = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  K.api = async (path, opt = {}, tokenKey = 'karto-staff-token') => {
    await K.ready;
    const t = tok(tokenKey);
    const r = await fetch(base + '/api' + path, {
      method: opt.method || 'GET',
      headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t } : {}) },
      body: opt.body ? JSON.stringify(opt.body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'Request failed'), { status: r.status });
    return j;
  };
  K.live = async (fn) => {
    await K.ready;
    try { const es = new EventSource(base + '/api/events'); es.onmessage = (e) => { try { fn(JSON.parse(e.data)); } catch {} }; } catch {}
    setInterval(() => fn({ type: 'tick' }), 20000);
  };
  K.money = (n) => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';
  K.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // ---------- 4 languages: ar / uz / ru / en ----------
  const LANGS = ['uz', 'ru', 'en', 'ar'], IDX = { ar: 0, uz: 1, ru: 2, en: 3 };
  K.lang = (() => { try { const l = localStorage.getItem('karto-lang'); return LANGS.includes(l) ? l : 'uz'; } catch { return 'uz'; } })();
  const D = window.KARTO_I18N || {};
  K.t = (key, vars) => { const row = D[key]; let s = row ? row[IDX[K.lang]] : key; if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]); return s; };
  const tr = (txt) => { const k = txt.trim(); if (!k || !D[k]) return null; return txt.replace(k, D[k][IDX[K.lang]]); };
  K.translate = (root) => {
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) { if (n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) continue; const r = tr(n.nodeValue); if (r != null && r !== n.nodeValue) n.nodeValue = r; }
    (root && root.querySelectorAll ? root : document).querySelectorAll('[placeholder],[title]').forEach((el) => { for (const a of ['placeholder', 'title']) { const v = el.getAttribute(a); const r = v && tr(v); if (r != null && r !== v) el.setAttribute(a, r); } });
  };
  K.setLang = (l) => { try { localStorage.setItem('karto-lang', l); } catch {} location.reload(); };
  K.langBar = (dark) => `<div class="langs${dark ? ' langs--dark' : ''}" role="group" aria-label="Language" style="direction:ltr">${LANGS.map((l) => `<button type="button" aria-pressed="${l === K.lang}" onclick="KARTO.setLang('${l}')">${l === 'ar' ? 'عربي' : l.toUpperCase()}</button>`).join('')}</div>`;
  const start = () => {
    document.documentElement.lang = K.lang; document.documentElement.dir = K.lang === 'ar' ? 'rtl' : 'ltr';
    const t = document.title; if (D[t]) document.title = D[t][IDX[K.lang]];
    document.querySelectorAll('[data-langbar]').forEach((el) => (el.innerHTML = K.langBar(el.dataset.langbar === 'dark')));
    if (K.lang !== 'ar' || true) { K.translate(document.body); new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType === 3) { const r = tr(n.nodeValue); if (r != null && r !== n.nodeValue) n.nodeValue = r; } else if (n.nodeType === 1) K.translate(n); } }).observe(document.body, { childList: true, subtree: true }); }
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  // ---------- section locks (owner can close any section) ----------
  K.guard = async (section) => {
    if (/\/restaurant\//.test(location.pathname) && ['pos', 'kitchen', 'tv', 'courier', 'team', 'manager'].includes(section)) K.device(section);
    try { const s = await K.api('/status'); if (s.locks && s.locks[section]) {
      const o = document.createElement('div'); o.className = 'kl-center'; o.style.cssText = 'position:fixed;inset:0;z-index:99999';
      o.innerHTML = `<div class="kl-box" style="text-align:center"><div style="font-size:56px">🔒</div><h2 style="font-family:var(--display)">${K.t('هذا القسم مقفل من الإدارة')}</h2><p style="font-weight:700">${K.t('تواصل مع صاحب الشركة لفتحه.')}</p></div>`;
      document.body.appendChild(o); return false; } } catch {}
    return true;
  };
  // ---------- contact management (cashier, kitchen, courier, manager) ----------
  K.contact = (tokenKey) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'kl-contact'; b.textContent = K.t('📞 الإدارة');
    b.setAttribute('style', 'position:fixed;z-index:9998;bottom:calc(86px + env(safe-area-inset-bottom,0px));right:10px;background:#1D5A3A;color:#FFF4E0;border:3px solid #241A14;border-radius:999px;padding:7px 14px;font:800 14px/1.2 system-ui,sans-serif;box-shadow:3px 3px 0 #241A14;cursor:pointer');
    b.onclick = async () => {
      const m = document.createElement('div'); m.className = 'kl-center'; m.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(18,61,39,.75)';
      m.innerHTML = `<div class="kl-box"><h2 style="font-family:var(--display);margin-top:0">${K.t('تواصل مع الإدارة')}</h2><div id="kcErr" class="kl-err"></div>
        <a class="btn btn--yellow btn--block" id="kcCall" href="#">${K.t('📞 اتصال')}</a>
        <div class="kl-form" style="margin-top:14px"><label><span>${K.t('✉️ رسالة للإدارة')}</span><textarea id="kcTxt" rows="3" placeholder="${K.t('اكتب رسالتك…')}" style="width:100%;box-sizing:border-box;font:inherit;font-weight:700;padding:10px;border:3px solid var(--ink);border-radius:12px"></textarea></label>
        <button type="button" class="btn btn--green btn--block" id="kcSend">${K.t('إرسال')}</button></div>
        <button type="button" class="btn btn--ghost btn--sm" style="margin-top:12px;color:var(--ink);border-color:var(--ink)" id="kcX">${K.t('إغلاق')}</button></div>`;
      document.body.appendChild(m); m.querySelector('#kcX').onclick = () => m.remove(); m.onclick = (e) => { if (e.target === m) m.remove(); };
      try { const c = await K.api('/staff/contact', {}, tokenKey); const a = m.querySelector('#kcCall');
        if (c.phone) a.href = 'tel:' + c.phone.replace(/\s/g, ''); else if (c.telegram) a.href = 'https://t.me/' + c.telegram.replace('@', ''); else { a.removeAttribute('href'); a.style.opacity = .5; }
      } catch (e) { m.querySelector('#kcErr').textContent = e.status === 401 ? K.t('سجّل دخولك أولاً') : e.message; }
      m.querySelector('#kcSend').onclick = async () => { const tx = m.querySelector('#kcTxt').value.trim(); if (!tx) return;
        try { await K.api('/staff/message', { method: 'POST', body: { text: tx } }, tokenKey); m.querySelector('#kcErr').className = 'kl-ok'; m.querySelector('#kcErr').textContent = K.t('انبعتت الرسالة ✓'); m.querySelector('#kcTxt').value = ''; }
        catch (e) { m.querySelector('#kcErr').className = 'kl-err'; m.querySelector('#kcErr').textContent = e.status === 401 ? K.t('سجّل دخولك أولاً') : e.message; } };
    };
    const go = () => document.body.appendChild(b); document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
  };

  // ---------- offers / promos: owner publishes once → site, customer app, TV, cashier, kitchen, courier, staff, manager ----------
  K.mediaUrl = (u) => (u && u.startsWith('/uploads/') ? base + u : u || '');
  K.yt = (u) => { const m = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(u || ''); return m && m[1]; };
  K.promoMedia = (P, big) => {
    if (!P.media) return '';
    const u = K.mediaUrl(P.media), y = K.yt(u), st = `width:100%;display:block;border-radius:${big ? 0 : 14}px;background:${big ? 'transparent' : '#000'};${big ? 'height:100%;object-fit:contain' : 'max-height:46vh;object-fit:cover'}`;
    if (y) return `<iframe src="https://www.youtube.com/embed/${y}?autoplay=1&mute=1&loop=1&playlist=${y}&controls=${big ? 0 : 1}&playsinline=1" allow="autoplay; encrypted-media" style="${st};aspect-ratio:16/9;border:0${big ? ';height:100%' : ''}"></iframe>`;
    if (P.mediaType === 'video') return `<video src="${K.esc(u)}" autoplay muted loop playsinline ${big ? '' : 'controls'} style="${st}"></video>`;
    return `<img src="${K.esc(u)}" alt="" style="${st}">`;
  };
  K.promos = (where) => {
    let list = [], tvTimer = null;
    const seenKey = 'karto-promo-seen-' + where;
    const seen = () => { try { return JSON.parse(localStorage.getItem(seenKey) || '[]'); } catch { return []; } };
    const mark = (ids) => { try { localStorage.setItem(seenKey, JSON.stringify([...new Set([...seen(), ...ids])].slice(-200))); } catch {} };
    const css = document.createElement('style');
    css.textContent = `.kp-pill{position:fixed;z-index:9997;left:10px;bottom:calc(86px + env(safe-area-inset-bottom,0px));background:#FFC83D;color:#241A14;border:3px solid #241A14;border-radius:999px;padding:7px 14px;font:900 14px/1.2 system-ui,sans-serif;box-shadow:3px 3px 0 #241A14;cursor:pointer;animation:kpb 2s ease-in-out infinite}
@keyframes kpb{50%{transform:scale(1.06)}}
.kp-m{position:fixed;inset:0;z-index:99997;background:rgba(18,61,39,.8);display:grid;place-items:center;padding:16px}
.kp-card{width:min(520px,100%);max-height:92vh;overflow:auto;background:#FFF4E0;color:#241A14;border:3px solid #241A14;border-radius:22px;box-shadow:8px 8px 0 #241A14;padding:16px;font-family:var(--body,system-ui)}
.kp-card h3{font-family:var(--display,system-ui);font-size:26px;margin:12px 0 4px}.kp-card p{margin:0 0 8px;font-weight:700;line-height:1.5}
.kp-tag{display:inline-block;background:#E8452C;color:#fff;border:2px solid #241A14;border-radius:999px;padding:2px 10px;font-weight:900;font-size:13px}
.kp-price{font-family:var(--display,system-ui);font-weight:900;font-size:24px;color:#1D5A3A}
.kp-tv{position:fixed;inset:0;z-index:99996;background:#123D27;color:#FFF4E0;display:grid;grid-template-rows:1fr auto;opacity:0;pointer-events:none;transition:opacity .6s}
.kp-tv.on{opacity:1}.kp-tv .kp-media{min-height:0;position:relative;display:grid;place-items:center;overflow:hidden}.kp-tv .kp-media>img,.kp-tv .kp-media>video,.kp-tv .kp-media>iframe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;aspect-ratio:auto}
.kp-pill.kp-staff{bottom:calc(140px + env(safe-area-inset-bottom,0px))}
.kp-tv .kp-foot{padding:22px 40px;display:flex;align-items:center;gap:24px;border-top:6px solid #FFC83D;background:#0E2F1E}
.kp-tv .kp-foot>div:first-child{flex:1}.kp-tv .kp-foot h3{font-family:var(--display,system-ui);font-size:clamp(32px,4vw,64px);margin:0}.kp-tv .kp-foot p{margin:4px 0 0;font-weight:800;font-size:clamp(18px,1.8vw,30px);opacity:.9}
.kp-tv .kp-price{color:#FFC83D;font-size:clamp(36px,4vw,70px);margin-inline-start:auto;white-space:nowrap}`;
    document.head.appendChild(css);
    const cardHtml = (P) => `${K.promoMedia(P)}<span class="kp-tag" style="margin-top:12px">🎉 ${K.t('عرض')}</span><h3>${K.esc(P.title)}</h3>${P.text ? `<p>${K.esc(P.text)}</p>` : ''}${P.price ? `<div class="kp-price" dir="ltr">${K.money(P.price)}</div>` : ''}`;
    const show = (items) => {
      if (!items.length) return; document.querySelectorAll('.kp-m').forEach((x) => x.remove());
      let i = 0; const m = document.createElement('div'); m.className = 'kp-m';
      const draw = () => { m.innerHTML = `<div class="kp-card">${cardHtml(items[i])}<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${items.length > 1 ? `<button type="button" class="btn btn--yellow btn--sm" data-n>${K.t('العرض التالي')} (${i + 1}/${items.length})</button>` : ''}<button type="button" class="btn btn--green btn--sm" data-x>${K.t(where === 'site' || where === 'app' ? 'تمام' : 'تم، شفته ✓')}</button></div></div>`; };
      draw(); m.onclick = (e) => { if (e.target.closest('[data-n]')) { i = (i + 1) % items.length; draw(); } else if (e.target === m || e.target.closest('[data-x]')) { mark(items.map((x) => x.id)); m.remove(); } };
      document.body.appendChild(m);
    };
    let pill = null;
    const pillDraw = () => {
      if (!pill) { pill = document.createElement('button'); pill.type = 'button'; pill.className = 'kp-pill' + (where === 'site' || where === 'app' ? '' : ' kp-staff'); pill.onclick = () => show(list); document.body.appendChild(pill); }
      pill.hidden = !list.length; pill.textContent = `🎉 ${K.t('العروض')} (${list.length})`;
    };
    const tv = () => {
      let o = document.querySelector('.kp-tv'); if (!o) { o = document.createElement('div'); o.className = 'kp-tv'; document.body.appendChild(o); }
      clearTimeout(tvTimer); let i = 0;
      const next = () => {
        if (!list.length) { o.classList.remove('on'); o.innerHTML = ''; return; }
        if (i >= list.length) { i = 0; o.classList.remove('on'); setTimeout(() => (o.innerHTML = ''), 700); tvTimer = setTimeout(next, 30000); return; } // menu shows 30s between rounds
        const P = list[i++]; o.innerHTML = `<div class="kp-media">${K.promoMedia(P, true) || '<div style="font-size:160px">🎉</div>'}</div><div class="kp-foot"><div><span class="kp-tag">🎉 ${K.t('عرض')}</span><h3>${K.esc(P.title)}</h3>${P.text ? `<p>${K.esc(P.text)}</p>` : ''}</div>${P.price ? `<div class="kp-price" dir="ltr">${K.money(P.price)}</div>` : ''}</div>`;
        o.classList.add('on'); const v = o.querySelector('video');
        if (v) { v.loop = false; let done = false; const go = () => { if (!done) { done = true; next(); } }; v.onended = go; tvTimer = setTimeout(go, 60000); } else tvTimer = setTimeout(next, 14000);
      };
      next();
    };
    const load = async (fresh) => {
      try { list = await K.api('/promos?for=' + where); } catch { return; }
      if (where === 'tv') return tv();
      pillDraw(); const s = seen(), nw = list.filter((x) => !s.includes(x.id)); if (nw.length) show(nw);
    };
    K.ready.then(() => load());
    K.live((m) => { if (m.type === 'promo') load(true); });
  };

  // ---------- restaurant device lock: each device opens its own section only; changing it needs the branch manager PIN ----------
  K.device = (sec) => {
    const SS = sessionStorage, LS = localStorage;
    if (/[?&]from=hub/.test(location.search) || SS.getItem('karto-hub')) return; // opened by the owner from the full-system page
    try { if (!SS.getItem('karto-mgr')) LS.setItem('karto-device', sec); } catch {}
    const go = () => { try { LS.removeItem('karto-device'); } catch {} location.href = './index.html'; };
    const b = document.createElement('button'); b.type = 'button'; b.id = 'karto-switch'; b.textContent = '⇄'; b.title = K.t('تغيير القسم');
    b.setAttribute('style', 'position:fixed;z-index:9998;left:10px;bottom:calc(86px + env(safe-area-inset-bottom,0px));width:40px;height:40px;border-radius:50%;background:#FFF4E0;color:#241A14;border:3px solid #241A14;box-shadow:2px 2px 0 #241A14;font:900 18px/1 system-ui;cursor:pointer;opacity:.75');
    b.onclick = () => {
      if (SS.getItem('karto-mgr')) return go();
      const m = document.createElement('div'); m.className = 'kl-center'; m.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(18,61,39,.85)';
      m.innerHTML = `<form class="kl-box kl-form"><h2 style="font-family:var(--display);margin:0">⇄ ${K.t('تغيير القسم')}</h2><p style="margin:0;font-weight:700">${K.t('ادخل PIN مدير الفرع')}</p><input type="password" inputmode="numeric" autocomplete="off" maxlength="8" required style="font-size:28px;text-align:center;letter-spacing:8px" dir="ltr"><p class="kl-err"></p><div style="display:flex;gap:8px"><button class="btn btn--green" style="flex:1">${K.t('دخول')}</button><button type="button" class="btn btn--yellow" data-x>${K.t('إلغاء')}</button></div></form>`;
      m.querySelector('[data-x]').onclick = () => m.remove();
      m.querySelector('form').onsubmit = async (e) => { e.preventDefault(); const er = m.querySelector('.kl-err');
        try { const r = await K.api('/auth/login', { method: 'POST', body: { pin: m.querySelector('input').value } });
          if (r.staff.role !== 'manager') throw new Error(K.t('هذا الرمز ليس لمدير الفرع'));
          [['karto-staff-token', 'karto-staff'], ['karto-courier-token', 'karto-courier'], ['karto-manager-token', 'karto-manager']].forEach(([t, s]) => { LS.setItem(t, r.token); LS.setItem(s, JSON.stringify(r.staff)); });
          SS.setItem('karto-mgr', '1'); go();
        } catch (x) { er.textContent = x.message; m.querySelector('input').value = ''; } };
      document.body.appendChild(m); m.querySelector('input').focus(); K.translate && K.translate(m);
    };
    const put = () => document.body.appendChild(b); document.readyState === 'loading' ? addEventListener('DOMContentLoaded', put) : put();
  };
  K.time = (iso) => { try { return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
})();
