// KARTO: animated ad slots (site + app) and the KARTO Snake waiting game
(function () {
  const K = window.KARTO; if (!K) return;
  const T = (s) => (K.t ? K.t(s) : s);
  const css = document.createElement('style');
  css.textContent = `
.kad{position:relative;max-width:1180px;margin:22px auto;padding:0 16px}
.kad__frame{position:relative;height:min(46vw,340px);min-height:220px;border-radius:26px;overflow:hidden;background:#fff;border:0;box-shadow:0 22px 44px -26px rgba(227,20,27,.45)}
.kad--app{margin:10px 0 16px;padding:0}.kad--app .kad__frame{height:210px;min-height:0;border-radius:20px}
.kad__s{position:absolute;inset:0;display:grid;grid-template-columns:1.05fr 1fr;align-items:center;opacity:0;transition:opacity .7s;pointer-events:none}
.kad__s.on{opacity:1;pointer-events:auto}
.kad__s::before{content:"";position:absolute;inset:0;background:radial-gradient(70% 90% at 78% 55%,#FFE7A1 0,#FFF6DC 45%,#fff 75%)}
.kad__img{position:relative;height:100%;display:grid;place-items:center;order:2}
.kad__img img{mix-blend-mode:multiply;height:88%;width:auto;max-width:100%;object-fit:contain;transform:scale(.92) translateY(8px)}
.kad__s.on .kad__img img{animation:kadIn 4.8s cubic-bezier(.2,.8,.2,1) both}
@keyframes kadIn{0%{transform:scale(.86) translateY(18px) rotate(-3deg)}35%{transform:scale(1) translateY(0) rotate(1deg)}100%{transform:scale(1.04) translateY(-4px) rotate(0)}}
.kad__txt{position:relative;padding:22px 10px 22px 34px}
[dir=rtl] .kad__txt{padding:22px 34px 22px 10px}
.kad__tag{display:inline-block;background:#E3141B;color:#fff;border-radius:999px;padding:4px 12px;font:900 12px/1.3 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}
.kad__txt h3{font-family:var(--display,sans-serif);font-size:clamp(22px,3.4vw,44px);line-height:1.02;margin:10px 0 6px;color:#E3141B}
.kad__txt p{margin:0;font-weight:700;color:#6B5338;font-size:clamp(13px,1.5vw,17px)}
.kad__price{display:inline-block;margin-top:10px;font:900 clamp(20px,2.6vw,30px)/1 var(--display,Georgia,serif);color:#2B1210;unicode-bidi:isolate;direction:ltr}
.kad__btn{display:inline-block;margin-top:12px;background:#E3141B;color:#fff;border:0;border-radius:999px;padding:9px 16px;font:800 14px/1.2 system-ui,sans-serif;cursor:pointer}
.kad--app .kad__txt{padding:14px 6px 14px 18px}[dir=rtl] .kad--app .kad__txt{padding:14px 18px 14px 6px}.kad--app .kad__txt h3{font-size:22px}.kad--app .kad__txt p{font-size:12.5px}.kad--app .kad__price{font-size:20px;margin-top:6px}.kad--app .kad__btn{margin-top:8px;padding:7px 12px;font-size:12.5px}
.kad__dots{position:absolute;bottom:10px;inset-inline-start:0;inset-inline-end:0;display:flex;gap:6px;justify-content:center;z-index:2}
.kad__dots i{width:8px;height:8px;border-radius:99px;background:#F3D6D2;transition:width .3s,background .3s}.kad__dots i.on{width:22px;background:#E3141B}
.kad__bar{position:absolute;left:0;top:0;height:3px;background:linear-gradient(90deg,#FFD978,#E0A23A);z-index:2}
.kad__s.on~.kad__bar{}
.ksn{position:fixed;inset:0;z-index:100000;background:radial-gradient(circle at 10% 0,#FFF1C6 0,transparent 40%),#fff;overscroll-behavior:none;user-select:none;-webkit-user-select:none;display:flex;flex-direction:column;align-items:center;font-family:system-ui,sans-serif;color:#24160A}
.ksn__top{width:100%;max-width:560px;display:flex;align-items:center;gap:10px;padding:12px 16px;box-sizing:border-box}
.ksn__top img{height:40px}.ksn__top b{font:800 22px/1 var(--display,sans-serif);color:#E3141B}.ksn__sc{margin-inline-start:auto;font-weight:900;background:#FFF3D6;border-radius:999px;padding:6px 12px;direction:ltr}
.ksn__x{border:0;background:#E3141B;color:#fff;border-radius:999px;width:38px;height:38px;font-size:18px;cursor:pointer}
.ksn__board{position:relative}.ksn canvas{display:block;border-radius:24px;box-shadow:0 0 0 4px #FFC21A,0 24px 44px -22px rgba(227,20,27,.55);touch-action:none}.ksn__start{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:10px;background:rgba(255,255,255,.82);border-radius:24px;cursor:pointer;transition:opacity .25s}.ksn__start.off{opacity:0;pointer-events:none}.ksn__start img{width:84px;animation:ksnB 1.2s ease-in-out infinite}.ksn__start b{font:800 20px/1.2 var(--display,sans-serif);color:#E3141B;text-align:center;padding:0 16px}@keyframes ksnB{50%{transform:translateY(-8px) rotate(-4deg)}}
.ksn__msg{font-weight:800;margin:12px 16px 4px;text-align:center;min-height:22px}
.ksn__pad{display:grid;grid-template-columns:repeat(3,64px);gap:8px;margin:8px 0 16px;direction:ltr}
.ksn__pad button{height:58px;border:0;border-radius:18px;background:linear-gradient(#FFD84D,#FFC21A);font-size:24px;font-weight:900;color:#B00E14;cursor:pointer;box-shadow:0 4px 0 #E0A000;touch-action:manipulation}
.ksn__pad button:active{transform:translateY(3px);box-shadow:0 1px 0 #E0A000}
.ksn__pad .e{visibility:hidden}
.kgame-btn{display:flex;align-items:center;gap:10px;width:100%;margin:12px 0;border:0;border-radius:18px;padding:14px 16px;background:linear-gradient(90deg,#FFF1C6,#FFD84D);color:#2B1210;font:800 15px/1.3 system-ui,sans-serif;cursor:pointer;text-align:start}
.kgame-btn b{font-size:26px}
.kfmt{display:flex;gap:8px;margin:4px 0 14px;flex-wrap:wrap}
.kfmt button{display:flex;align-items:center;gap:8px;border:2px solid #F0DCC8;background:#fff;border-radius:999px;padding:6px 14px 6px 6px;font:800 14px/1 var(--body,sans-serif);cursor:pointer;color:#2B1210}
[dir=rtl] .kfmt button{padding:6px 6px 6px 14px}
.kfmt button img{width:34px;height:34px;object-fit:contain;mix-blend-mode:multiply}
.kfmt button.on{border-color:#E3141B;background:#FFF1EF;color:#B00E14}
body.kf-bottle .addon--f-can,body.kf-bottle .addon--f-pouch,body.kf-can .addon--f-bottle,body.kf-can .addon--f-pouch,body.kf-pouch .addon--f-bottle,body.kf-pouch .addon--f-can{display:none!important}
.kad__img img{height:86%!important;width:auto!important;max-width:96%!important;object-fit:contain!important}

.kcat{max-width:1180px;margin:10px auto 34px;padding:0 16px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:980px){.kcat{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.kcat{grid-template-columns:1fr}}
.kcat a{position:relative;display:flex;flex-direction:column;border-radius:28px;padding:20px 20px 16px;text-decoration:none;color:#2B1210;min-height:300px;overflow:hidden;transition:transform .25s,box-shadow .25s}
.kcat a:hover{transform:translateY(-4px);box-shadow:0 24px 40px -26px rgba(227,20,27,.5)}
.kcat h3{margin:0;font:800 28px/1.05 var(--display,sans-serif);color:#B00E14}.kcat p{margin:6px 0 0;font-weight:700;color:#6E4B44;font-size:14px}
.kcat img{flex:1;width:100%;object-fit:contain;mix-blend-mode:multiply;margin:12px 0;max-height:170px;transition:transform .35s}
.kcat a:hover img{transform:scale(1.05) rotate(-1deg)}
.kcat span{align-self:flex-start;background:#fff;color:#E3141B;border:2px solid #E3141B;border-radius:999px;padding:7px 16px;font:800 14px/1 var(--display,sans-serif)}
.kcat a:nth-child(2) span{background:#E3141B;color:#fff}`;
  document.head.appendChild(css);

  // ---------- KARTO Snake (smooth, 60fps interpolated) ----------
  K.snake = () => {
    if (document.querySelector('.ksn')) return;
    const o = document.createElement('div'); o.className = 'ksn';
    let best = 0; try { best = +localStorage.getItem('karto-snake-best') || 0; } catch {}
    o.innerHTML = `<div class="ksn__top"><img src="./assets/karto-logo.png" alt="KARTO"><b>Snake</b><span class="ksn__sc">🍟 <span data-s>0</span> · 🏆 <span data-b>${best}</span></span><button class="ksn__x" type="button" aria-label="×">✕</button></div>
      <div class="ksn__msg" data-m>${T('اسحب أو استعمل الأسهم — كُل البطاطا والصوص 🍟')}</div><div class="ksn__board"><canvas></canvas><div class="ksn__start" data-st><img src="./assets/karto-face.png" alt=""><b>${T('اضغط للبدء')}</b></div></div>
      <div class="ksn__pad"><button class="e"></button><button data-d="0,-1">▲</button><button class="e"></button><button data-d="-1,0">◀</button><button data-d="0,1">▼</button><button data-d="1,0">▶</button></div>`;
    document.body.appendChild(o); document.documentElement.style.overflow = 'hidden';
    const cv = o.querySelector('canvas'), g = cv.getContext('2d'), N = 16, DPR = Math.min(2, window.devicePixelRatio || 1);
    const size = Math.max(240, Math.min(520, window.innerWidth - 32, window.innerHeight - 290)); const C = size / N;
    cv.width = cv.height = Math.round(size * DPR); cv.style.width = cv.style.height = size + 'px'; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    const face = new Image(); face.src = './assets/karto-face.png';
    const foods = ['sauce-ketchup', 'sauce-cheese', 'sauce-garlic', 'sauce-bbq'].map((n) => { const i = new Image(); i.src = './img/' + n + '.webp'; return i; });
    let snake, prev, dir, queue, food, score, step, alive, running, acc, last, parts, shake, raf, grow;
    const free = (p) => !snake.some((s) => s.x === p.x && s.y === p.y);
    const place = () => { let p; do { p = { x: Math.random() * N | 0, y: Math.random() * N | 0 }; } while (!free(p)); p.k = Math.random() < .3 ? 'sauce' : 'fry'; p.img = foods[Math.random() * 4 | 0]; p.t = 0; return p; };
    const reset = () => { snake = [{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }]; prev = snake.map((s) => ({ ...s })); dir = { x: 1, y: 0 }; queue = []; score = 0; step = 165; alive = true; running = false; acc = 0; parts = []; shake = 0; grow = 0; food = place(); o.querySelector('[data-s]').textContent = 0; };
    const turn = (x, y) => {
      if (!alive) { reset(); }
      if (!running) { running = true; o.querySelector('[data-st]').classList.add('off'); o.querySelector('[data-m]').textContent = T('الصوص = 3 نقاط · البطاطا = نقطة'); last = performance.now(); }
      const ref = queue.length ? queue[queue.length - 1] : dir;
      if ((x === -ref.x && y === -ref.y) || (x === ref.x && y === ref.y)) return;
      if (queue.length < 3) queue.push({ x, y });
    };
    const tick = () => {
      if (queue.length) dir = queue.shift();
      prev = snake.map((s) => ({ ...s }));
      const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      const body = grow ? snake : snake.slice(0, -1);
      if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || body.some((s) => s.x === h.x && s.y === h.y)) return over();
      snake.unshift(h);
      if (grow) { grow--; } else { snake.pop(); }
      if (h.x === food.x && h.y === food.y) {
        const pts = food.k === 'sauce' ? 3 : 1; score += pts; grow += pts === 3 ? 2 : 1; o.querySelector('[data-s]').textContent = score;
        for (let i = 0; i < 14; i++) parts.push({ x: (h.x + .5) * C, y: (h.y + .5) * C, vx: (Math.random() - .5) * 5, vy: (Math.random() - .5) * 5, l: 1, c: Math.random() < .5 ? '#FFC21A' : '#E3141B' });
        food = place(); step = Math.max(85, step - 3.5); if (navigator.vibrate) navigator.vibrate(12);
      }
    };
    const over = () => { alive = false; running = false; shake = 10; if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
      if (score > best) { best = score; try { localStorage.setItem('karto-snake-best', best); } catch {} o.querySelector('[data-b]').textContent = best; }
      const st = o.querySelector('[data-st]'); st.querySelector('b').textContent = '🍟 ' + score + ' · ' + T('العب مرة ثانية'); st.classList.remove('off'); o.querySelector('[data-m]').textContent = T('انتهت اللعبة! اضغط أي سهم لتبدأ من جديد'); };
    const fry = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); };
    const draw = (t) => {
      g.save(); if (shake > .2) { g.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake *= .86; }
      g.fillStyle = '#fff'; g.fillRect(-12, -12, size + 24, size + 24);
      g.fillStyle = '#FFF6E3'; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) g.fillRect(i * C, j * C, C, C);
      // food (bobbing)
      food.t += .06; const fx = (food.x + .5) * C, fy = (food.y + .5) * C + Math.sin(food.t) * C * .06;
      if (food.k === 'sauce' && food.img.complete) { const s = C * 1.05; g.drawImage(food.img, fx - s / 2, fy - s / 2, s, s); }
      else { g.save(); g.translate(fx, fy); g.rotate(-.5); const gr = g.createLinearGradient(-C * .12, 0, C * .12, 0); gr.addColorStop(0, '#F2A71B'); gr.addColorStop(.5, '#FFD86A'); gr.addColorStop(1, '#E39212'); g.fillStyle = gr; fry(-C * .13, -C * .42, C * .26, C * .84, C * .1); g.fill(); g.strokeStyle = '#B8650E'; g.lineWidth = 1.4; g.stroke(); g.restore(); }
      // snake as one long golden fry, interpolated between grid steps
      const pts = snake.map((s, i) => { const p = prev[i] || s; return { x: (p.x + (s.x - p.x) * t + .5) * C, y: (p.y + (s.y - p.y) * t + .5) * C }; });
      g.lineJoin = g.lineCap = 'round';
      const path = () => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); };
      path(); g.strokeStyle = '#B8650E'; g.lineWidth = C * .74; g.stroke();
      path(); const lg = g.createLinearGradient(0, 0, size, size); lg.addColorStop(0, '#FFD45C'); lg.addColorStop(1, '#F5A623'); g.strokeStyle = lg; g.lineWidth = C * .6; g.stroke();
      path(); g.strokeStyle = 'rgba(255,240,190,.75)'; g.lineWidth = C * .16; g.stroke();
      pts.forEach((p, i) => { if (i && i % 2 === 0) { g.fillStyle = 'rgba(184,101,14,.35)'; g.beginPath(); g.arc(p.x + C * .08, p.y - C * .06, C * .045, 0, 7); g.fill(); } });
      const hd = pts[0]; if (face.complete) { const s = C * 1.25; g.save(); g.translate(hd.x, hd.y); g.rotate(Math.atan2(dir.y, dir.x) * 0 + (dir.x < 0 ? 0 : 0)); g.drawImage(face, -s / 2, -s * .55, s, s * 1.1); g.restore(); }
      parts = parts.filter((p) => (p.l -= .03) > 0); parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .12; g.globalAlpha = p.l; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, C * .1 * p.l + 1, 0, 7); g.fill(); }); g.globalAlpha = 1;
      g.restore();
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (running) { acc += Math.min(80, now - last); last = now; while (acc >= step && running) { acc -= step; tick(); } }
      draw(running ? Math.min(1, acc / step) : 1);
    };
    const key = (e) => { const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key]; if (m) { e.preventDefault(); turn(...m); } if (e.key === 'Escape') close(); };
    let sx, sy, swiped; o.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiped = false; }, { passive: true });
    o.addEventListener('touchmove', (e) => { if (swiped || e.target.closest('button')) return; const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return; swiped = true; Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy)); }, { passive: true });
    o.querySelector('[data-st]').addEventListener('click', () => turn(dir.x || 1, dir.y));
    o.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); turn(...b.dataset.d.split(',').map(Number)); }));
    const vis = () => { if (document.hidden && running) { running = false; o.querySelector('[data-st]').classList.remove('off'); o.querySelector('[data-st] b').textContent = T('اضغط للمتابعة'); } };
    const close = () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); document.removeEventListener('visibilitychange', vis); document.documentElement.style.overflow = ''; o.remove(); };
    o.querySelector('.ksn__x').onclick = close; addEventListener('keydown', key); document.addEventListener('visibilitychange', vis);
    reset(); raf = requestAnimationFrame(loop);
  };


  // juice format picker (bottle / can / pouch) in the builder
  const FMT = [['bottle', 'juice', ['Shisha', 'Бутылка', 'Bottle', 'قنينة']], ['can', 'can', ['Banka', 'Банка', 'Can', 'علبة']], ['pouch', 'pouch', ['Paket', 'Пакет', 'Pouch', 'كيس']]];
  const LI = { uz: 0, ru: 1, en: 2, ar: 3 };
  const fmtTabs = () => {
    const first = document.querySelector('.addon--f-bottle, .addon--f-can, .addon--f-pouch');
    if (!first) return;
    if (!/kf-/.test(document.body.className)) document.body.classList.add('kf-bottle');
    const lang = (typeof K.lang === 'function' ? K.lang() : K.lang) || 'uz';
    let bar = document.querySelector('.kfmt');
    if (!bar) { bar = document.createElement('div'); bar.className = 'kfmt'; first.parentNode.insertBefore(bar, first);
      bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; document.body.classList.remove('kf-bottle', 'kf-can', 'kf-pouch'); document.body.classList.add('kf-' + b.dataset.f); bar.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); }); }
    if (bar.dataset.l === lang) return; bar.dataset.l = lang;
    const cur = (document.body.className.match(/kf-(\w+)/) || [, 'bottle'])[1];
    bar.innerHTML = FMT.map(([f, img, n]) => `<button type="button" data-f="${f}" class="${f === cur ? 'on' : ''}"><img src="./img/${img}-mango-sm.webp" alt="">${n[LI[lang] ?? 0]}</button>`).join('');
  };
  new MutationObserver(fmtTabs).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- animated ad slot ----------
  const BASE = [
    { img: './img/family.webp', tag: 'KARTO', title: 'ثلاث علب. ثلاث أحجام. نكهة وحدة ما بتنتسى.', text: 'صغير · وسط · كبير', price: 18000, pre: 'من' },
    { img: './img/drinks.webp', tag: 'جديد', title: '4 عصائر طازجة', text: 'مانجو · توت · ليمون · برتقال', price: 17000 },
    { img: './img/sauces.webp', tag: 'هدية', title: 'صوص مجاني مع كل وجبة', text: 'وكل صوص إضافي 4,000' },
    { img: './img/jars.webp', tag: '7 نكهات', title: 'بهارات KARTO', text: 'صغير 1 · وسط 2 · كبير 3 مجاناً' },
    { img: './assets/karto-face.png', tag: 'العب', title: 'ناطر طلبك؟ العب KARTO Snake', text: 'اجمع البطاطا والصوص واكسر رقمك', game: true },
  ];
  const CATS = [
    { img: './img/family.webp', bg: '#FFF1E2', t: 'البطاطا', p: 'بطاطا KARTO بثلاث أحجام.' },
    { img: './img/drinks.webp', bg: '#FFEAF0', t: 'عصائر ومي', p: '4 عصائر منعشة ومي KARTO.' },
    { img: './img/sauces.webp', bg: '#FFF6D6', t: 'الصوصات', p: 'الصوص المثالي لبطاطتك.' },
    { img: './img/jars.webp', bg: '#F3EEFF', t: 'البهارات', p: '7 نكهات على ذوقك.' },
  ];
  K.adSlot = (where) => {
    const app = where === 'app';
    const mount = async () => {
      const anchor = app ? document.querySelector('.app__body .promo') : document.querySelector('section.hero');
      if (!anchor || document.querySelector('.kad')) return;
      let slides = BASE.slice();
      try { const r = await K.api('/promos?for=' + where); const ps = (Array.isArray(r) ? r : []).filter((p) => p && p.title && p.mediaType === 'image' && p.media); slides = ps.map((p) => ({ img: p.media, tag: 'عرض', title: p.title, text: p.text, price: p.price, raw: true })).concat(slides); } catch {}
      if (document.querySelector('.kad')) return;
      const w = document.createElement('div'); w.className = 'kad' + (app ? ' kad--app' : '');
      w.innerHTML = `<div class="kad__frame">${slides.map((s, i) => `<div class="kad__s${i ? '' : ' on'}"><div class="kad__img"><img src="${K.esc(s.img)}" alt=""></div><div class="kad__txt"><span class="kad__tag">${K.esc(s.raw ? T(s.tag) : T(s.tag))}</span><h3>${K.esc(s.raw ? s.title : T(s.title))}</h3>${s.text ? `<p>${K.esc(s.raw ? s.text : T(s.text))}</p>` : ''}${s.price ? `<span class="kad__price">${s.pre ? K.esc(T(s.pre)) + ' ' : ''}${K.money(s.price)}</span>` : ''}${s.game ? `<br><button type="button" class="kad__btn" data-game>🎮 ${K.esc(T('العب الآن'))}</button>` : ''}</div></div>`).join('')}<div class="kad__dots">${slides.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div>`;
      if (app) anchor.parentNode.insertBefore(w, anchor); else { anchor.parentNode.insertBefore(w, anchor.nextSibling);
        const c = document.createElement('div'); c.className = 'kcat'; c.innerHTML = CATS.map((x) => `<a href="#menu" style="background:${x.bg}"><h3>${K.esc(T(x.t))}</h3><p>${K.esc(T(x.p))}</p><img src="${x.img}" alt="" loading="lazy"><span>${K.esc(T('شوف المزيد'))} →</span></a>`).join(''); w.parentNode.insertBefore(c, w.nextSibling); }
      w.querySelector('[data-game]')?.addEventListener('click', K.snake);
      let i = 0; const S = w.querySelectorAll('.kad__s'), D = w.querySelectorAll('.kad__dots i');
      const show = (n) => { S[i].classList.remove('on'); D[i].classList.remove('on'); i = (n + S.length) % S.length; S[i].classList.add('on'); D[i].classList.add('on'); };
      let t = setInterval(() => show(i + 1), 4800);
      D.forEach((d, n) => d.addEventListener('click', () => { show(n); clearInterval(t); t = setInterval(() => show(i + 1), 4800); }));
    };
    const tick = () => { mount(); if (app) { const tr = document.querySelector('.card.track'); if (tr && !document.querySelector('.kgame-btn')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'kgame-btn'; b.innerHTML = `<b>🎮</b><span>${K.esc(T('طلبك عم يتحضّر… العب KARTO Snake لحد ما يجهز!'))}</span>`; b.onclick = K.snake; tr.parentNode.insertBefore(b, tr.nextSibling); } } };
    new MutationObserver(tick).observe(document.body, { childList: true, subtree: true }); tick();
  };
})();
