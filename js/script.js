/* ==========================================================================
   BLOOM — скрипт сайта
   1. Схематичная карта города (блок «Контакты»)
   2. Логика магазина: каталог, корзина, конструктор, формы
   Данные товаров лежат отдельно — в js/data.js.
   ==========================================================================

   ==========================================================================
   1. Схематичная карта города для блока «Контакты»
   Чтобы поставить настоящую карту, замените содержимое #mapArt на <iframe>
   2ГИС / Яндекс.Карт или на изображение.
   ========================================================================== */
(function (global) {
  'use strict';

  function rng(seed) {
    let a = typeof seed === 'number' ? seed : hash(String(seed || 'bloom'));
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const f = (n) => Math.round(n * 10) / 10;

  function cityMap() {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Карта: г. Актобе, проспект Абая, 25">`;
    s += `<rect width="800" height="520" fill="#f1ebe1"/>`;
    // парк
    s += `<path d="M540 60 Q640 40 700 110 Q730 190 650 220 Q560 230 530 160 Z" fill="#dfe5d7"/>`;
    s += `<path d="M60 360 Q140 330 200 380 Q220 450 140 470 Q70 470 50 420 Z" fill="#dfe5d7"/>`;
    // река
    s += `<path d="M-20 250 C120 210 200 300 330 280 S560 330 820 290" stroke="#d6e0e3" stroke-width="30" fill="none"/>`;
    // кварталы
    const R = rng('map');
    for (let x = 20; x < 800; x += 92) for (let y = 16; y < 520; y += 78) {
      if (R() > 0.72) continue;
      s += `<rect x="${x + R() * 6}" y="${y + R() * 6}" width="${58 + R() * 14}" height="${44 + R() * 10}" rx="6" fill="#e8e0d4"/>`;
    }
    // улицы
    s += `<g stroke="#fffaf3" stroke-linecap="round" fill="none"><path d="M0 130 H800" stroke-width="14"/><path d="M0 410 H800" stroke-width="10"/><path d="M250 0 V520" stroke-width="16"/><path d="M560 0 L500 520" stroke-width="10"/><path d="M0 40 L800 480" stroke-width="8" opacity="0.8"/></g>`;
    s += `<text x="264" y="300" font-family="Manrope, sans-serif" font-size="13" fill="#9a8f80" transform="rotate(90 264 300)" letter-spacing="2">ПР. АБАЯ</text>`;
    s += `<text x="300" y="122" font-family="Manrope, sans-serif" font-size="12" fill="#9a8f80" letter-spacing="2">УЛ. ЖАНКОЖА БАТЫРА</text>`;
    s += `<text x="590" y="150" font-family="Manrope, sans-serif" font-size="12" fill="#8c9a86" letter-spacing="2">ПАРК</text>`;
    // метка
    s += `<circle cx="250" cy="200" r="46" fill="#c98f8c" opacity="0.14"/><circle cx="250" cy="200" r="24" fill="#c98f8c" opacity="0.22"/>`;
    s += `<path d="M250 206 C236 188 230 178 230 168 A20 20 0 0 1 270 168 C270 178 264 188 250 206Z" transform="translate(0 -8)" fill="#2b2a29"/><circle cx="250" cy="160" r="7" fill="#faf6f0"/>`;
    return s + '</svg>';
  }

  global.BloomMap = { cityMap };
})(window);

/* ==========================================================================
   2. Логика интернет-магазина
   ========================================================================== */
(function () {
  'use strict';

  const D = window.BLOOM_DATA;

  /* ------------------------------ Утилиты ------------------------------ */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const NBSP = ' ';
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + NBSP + '₸';
  const plural = (n, forms) => {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* хранилище недоступно */ } }
  };
  const bump = (el, cls = 'num-bump') => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const pad = (n) => String(n).padStart(2, '0');
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  const PRODUCTS = D.PRODUCTS;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catLabel = Object.fromEntries(D.CATEGORIES.map((c) => [c.id, c.label]));

  /**
   * Фото с плавным появлением. Если файла ещё нет — показывается аккуратный
   * плейсхолдер с названием и путём к файлу, который нужно добавить.
   * fallback — запасной путь (например, общее фото цветка вместо фото конкретного оттенка).
   */
  function photo(src, { alt = '', tint = '', label = '', fallback = '', eager = false } = {}) {
    const fb = fallback ? ` data-fallback="${esc(fallback)}"` : '';
    return `<div class="ph"${tint ? ` style="--tint:${tint}"` : ''}>` +
      `<img src="${esc(src)}" alt="${esc(alt)}"${fb} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onload="bloomImgLoad(this)" onerror="bloomImgError(this)">` +
      `<div class="ph__fallback" aria-hidden="true">${icon('camera')}<span class="ph__name">${esc(label || alt)}</span><span class="ph__file">${esc(fallback || src)}</span></div>` +
      '</div>';
  }
  window.bloomImgLoad = (img) => img.parentNode.classList.add('is-loaded');
  window.bloomImgError = (img) => {
    const fb = img.getAttribute('data-fallback');
    if (fb) { img.removeAttribute('data-fallback'); img.src = fb; return; }
    img.parentNode.classList.add('is-missing');
  };

  const media = (p) => photo(p.image, { alt: `Букет «${p.name}» — ${p.short.toLowerCase()}`, tint: p.tint, label: p.name });
  function itemMedia(item) {
    if (item.type === 'custom') {
      const src = item.image || D.PHOTOS.builder('rose', 'pink');
      return photo(src.src || src, { alt: item.name, tint: '#efe6da', label: item.name, fallback: src.fallback });
    }
    return media(byId[item.id]);
  }

  /* ------------------------------ Состояние ------------------------------ */
  const state = {
    cart: store.get('bloom.cart', []).filter((i) => i && i.qty > 0 && (i.type === 'custom' || (byId[i.id] && byId[i.id].sizes[i.size]))),
    favs: store.get('bloom.favs', []).filter((id) => byId[id]),
    delivery: store.get('bloom.delivery', null),
    contact: store.get('bloom.contact', null),
    anon: store.get('bloom.anon', null),
    filters: { cat: 'all', price: 'all', sort: 'popular', occasion: null }
  };
  const saveCart = () => store.set('bloom.cart', state.cart);
  const saveFavs = () => store.set('bloom.favs', state.favs);

  const DELIVERY_PRICE = 1500;
  const FREE_FROM = 25000;
  const priceOf = (item) => (item.type === 'custom' ? item.price : byId[item.id].sizes[item.size]);
  const subtotal = () => state.cart.reduce((s, i) => s + priceOf(i) * i.qty, 0);
  const deliveryCost = (sub) => (sub === 0 || sub >= FREE_FROM ? 0 : DELIVERY_PRICE);
  const cartQty = () => state.cart.reduce((s, i) => s + i.qty, 0);

  /* ------------------------------ Уведомления ------------------------------ */
  function toast(msg, ic = 'check') {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`;
    box.appendChild(el);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(() => { el.classList.add('is-leaving'); setTimeout(() => el.remove(), 380); }, 2600);
  }

  /* ------------------------------ Модальные окна ------------------------------ */
  const openStack = [];
  let lastFocus = null;

  function openLayer(id) {
    const el = document.getElementById(id);
    if (!el || el.classList.contains('is-open')) return;
    if (!openStack.length) lastFocus = document.activeElement;
    closeMobileMenu();
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    const ov = $(`[data-overlay="${id}"]`);
    if (ov) ov.classList.add('is-open');
    openStack.push(id);
    document.body.classList.add('is-locked');
    setTimeout(() => {
      const target = el.querySelector('[data-autofocus]') || el.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), button, [href], select, textarea');
      if (id === 'search') $('#searchInput').focus();
      else if (target) target.focus({ preventScroll: true });
    }, 60);
  }

  function closeLayer(id) {
    const el = document.getElementById(id);
    if (!el || !el.classList.contains('is-open')) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    const ov = $(`[data-overlay="${id}"]`);
    if (ov) ov.classList.remove('is-open');
    const i = openStack.indexOf(id);
    if (i > -1) openStack.splice(i, 1);
    if (!openStack.length) {
      document.body.classList.remove('is-locked');
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }
  }
  const closeAll = () => [...openStack].forEach(closeLayer);

  const openers = {
    cart: () => { renderCart(); openLayer('cart'); },
    favorites: () => { renderFavs(); openLayer('favorites'); },
    search: () => { openLayer('search'); },
    anon: () => { fillAnonForm(); openLayer('anon'); }
  };

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) { e.preventDefault(); closeAll(); openers[opener.dataset.open](); return; }
    const closer = e.target.closest('[data-close]');
    if (closer) { const layer = closer.closest('.modal, .drawer'); if (layer) closeLayer(layer.id); return; }
    const ov = e.target.closest('[data-overlay]');
    if (ov) { closeLayer(ov.dataset.overlay); return; }
    const info = e.target.closest('[data-info]');
    if (info) { openInfo(info.dataset.info); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (openStack.length) closeLayer(openStack[openStack.length - 1]);
      else closeMobileMenu();
    }
    // Удерживаем фокус внутри открытого окна
    if (e.key === 'Tab' && openStack.length) {
      const layer = document.getElementById(openStack[openStack.length - 1]);
      const f = $$('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', layer).filter((x) => x.offsetParent !== null || x.closest('.check, .radio, .opt'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function openInfo(key) {
    const data = D.INFO[key];
    if (!data) return;
    $('#infoTitle').textContent = data.title;
    $('#infoText').innerHTML = data.text.map((t) => `<p>${esc(t)}</p>`).join('');
    closeAll();
    openLayer('info');
  }

  /* ------------------------------ Header и меню ------------------------------ */
  const header = $('#header');
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');

  function closeMobileMenu() {
    if (!mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    if (!openStack.length) document.body.classList.remove('is-locked');
  }
  burger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('is-open')) return closeMobileMenu();
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    document.body.classList.add('is-locked');
  });
  $$('a', mobileMenu).forEach((a) => a.addEventListener('click', closeMobileMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMobileMenu(); });

  const navLinks = $$('.nav__link');
  const navSections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
  let ticking = false;
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 30);
    const y = window.scrollY + 140;
    let current = 0;
    navSections.forEach((sec, i) => { if (sec && sec.offsetTop <= y) current = i; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = navSections.length - 1;
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === current));
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ------------------------------ Карточки товаров ------------------------------ */
  function cardHTML(p) {
    const fav = state.favs.includes(p.id);
    const badge = p.badge ? `<span class="badge ${p.badge === 'Новинка' ? 'badge--new' : ''}">${esc(p.badge)}</span>` : '';
    return `<article class="card" data-id="${p.id}">
      <div class="card__media" data-action="open" role="button" tabindex="0" aria-label="Подробнее о букете ${esc(p.name)}">
        ${badge}${media(p)}<span class="card__quick">Подробнее</span>
      </div>
      <button class="fav-btn ${fav ? 'is-active' : ''}" type="button" data-action="fav" aria-pressed="${fav}" aria-label="${fav ? 'Удалить из избранного' : 'Добавить в избранное'}">${icon(fav ? 'heart-fill' : 'heart')}</button>
      <div class="card__body">
        <div class="card__top"><h3 class="card__name" data-action="open">${esc(p.name)}</h3><span class="card__price">${fmt(p.price)}</span></div>
        <p class="card__desc">${esc(p.short)}</p>
        <button class="btn btn--ghost btn--sm card__add" type="button" data-action="add">В корзину</button>
      </div>
    </article>`;
  }

  function flashButton(btn, text = 'Добавлено') {
    if (!btn) return;
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.textContent = text + ' ✓';
    btn.classList.add('is-done');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = btn.dataset.label; btn.classList.remove('is-done'); }, 1500);
  }

  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-action]');
    if (!act) return;
    const card = act.closest('[data-id]');
    if (!card) return;
    const id = card.dataset.id;
    const a = act.dataset.action;
    if (a === 'open') openProduct(id);
    else if (a === 'fav') toggleFav(id);
    else if (a === 'add') { addToCart({ type: 'product', id, size: 'M' }, 1, act); flashButton(act); }
    else if (a === 'fav-add') { addToCart({ type: 'product', id, size: 'M' }, 1, act); flashButton(act, 'В корзине'); }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-action="open"][tabindex]')) {
      e.preventDefault();
      openProduct(e.target.closest('[data-id]').dataset.id);
    }
  });

  /* ------------------------------ Поводы ------------------------------ */
  const OCCASION_CARDS = [
    { id: 'love', title: 'Для любимой', text: 'Розы, пионы и нежные композиции.' },
    { id: 'birthday', title: 'День рождения', text: 'Яркие букеты для особенного дня.' },
    { id: 'date', title: 'Свидание', text: 'Нежные композиции для романтического вечера.' },
    { id: 'just', title: 'Просто так', text: 'Потому что повод не всегда нужен.' }
  ];
  function renderOccasions() {
    $('#occasionsGrid').innerHTML = OCCASION_CARDS.map((o, i) => `
      <button class="occasion reveal" type="button" data-occasion="${o.id}">
        <div class="occasion__img">${photo(D.PHOTOS.occasions[o.id], { alt: `Букет на повод «${o.title}»`, tint: '#e9dfd4', label: o.title })}</div>
        <div class="occasion__body">
          <span class="occasion__num">0${i + 1}</span>
          <h3>${o.title}</h3>
          <p>${o.text}</p>
          <span class="occasion__link">Смотреть ${icon('arrow-right')}</span>
        </div>
      </button>`).join('');
    $$('[data-occasion]').forEach((b) => b.addEventListener('click', () => {
      state.filters.occasion = b.dataset.occasion;
      state.filters.cat = 'all';
      renderChips();
      renderCatalog();
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    }));
  }

  /* ------------------------------ Популярное ------------------------------ */
  function renderPopular() {
    $('#popularGrid').innerHTML = D.POPULAR_IDS.map((id) => byId[id]).map(cardHTML).join('');
    $$('#popularGrid .card').forEach((c) => c.classList.add('reveal'));
  }

  /* ------------------------------ Каталог ------------------------------ */
  function renderChips() {
    $('#categoryChips').innerHTML = D.CATEGORIES.map((c) =>
      `<button class="chip ${state.filters.cat === c.id ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.filters.cat === c.id}" data-cat="${c.id}">${c.label}</button>`).join('');
  }
  $('#categoryChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    state.filters.cat = b.dataset.cat;
    renderChips();
    renderCatalog();
  });

  const priceSel = $('#priceFilter');
  priceSel.innerHTML = D.PRICE_RANGES.map((r) => `<option value="${r.id}">${r.label}</option>`).join('');
  priceSel.addEventListener('change', () => { state.filters.price = priceSel.value; renderCatalog(); });
  const sortSel = $('#sortSelect');
  sortSel.addEventListener('change', () => { state.filters.sort = sortSel.value; renderCatalog(); });
  $('#resetFilters').addEventListener('click', () => {
    Object.assign(state.filters, { cat: 'all', price: 'all', sort: 'popular', occasion: null });
    priceSel.value = 'all'; sortSel.value = 'popular';
    renderChips(); renderCatalog();
  });

  function filteredProducts() {
    const f = state.filters;
    const range = D.PRICE_RANGES.find((r) => r.id === f.price);
    const list = PRODUCTS.filter((p) =>
      (f.cat === 'all' || p.category === f.cat) &&
      (!f.occasion || p.occasions.includes(f.occasion)) &&
      p.price >= range.min && p.price < range.max);
    const sorters = {
      popular: (a, b) => b.popularity - a.popularity,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      new: (a, b) => b.added - a.added
    };
    return list.sort(sorters[f.sort]);
  }

  function renderCatalog() {
    const list = filteredProducts();
    const grid = $('#catalogGrid');
    grid.innerHTML = list.map(cardHTML).join('');
    $$('.card', grid).forEach((c, i) => { c.classList.add('is-entering'); c.style.animationDelay = `${Math.min(i, 8) * 45}ms`; });
    $('#catalogEmpty').hidden = list.length > 0;
    $('#catalogCount').textContent = `${list.length} ${plural(list.length, ['букет', 'букета', 'букетов'])}`;
    const oc = $('#occasionFilter');
    if (state.filters.occasion) {
      oc.hidden = false;
      oc.innerHTML = `Повод: <button type="button" id="clearOccasion" aria-label="Сбросить повод">${D.OCCASIONS[state.filters.occasion]} ${icon('close')}</button>`;
      $('#clearOccasion').addEventListener('click', () => { state.filters.occasion = null; renderCatalog(); });
    } else oc.hidden = true;
  }

  /* ------------------------------ Карточка товара ------------------------------ */
  const pm = { id: null, size: 'M', qty: 1 };

  function scaledComposition(p, size) {
    const k = { S: 0.6, M: 1, L: 1.67 }[size];
    return p.composition.map((line, i) => (i === 0 ? line.replace(/(\d+)(?= (шт|веток))/, (m) => String(Math.max(3, Math.round(+m * k)))) : line));
  }

  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    pm.id = id; pm.size = 'M'; pm.qty = 1;
    $('#pmImage').innerHTML = media(p);
    $('#pmCategory').textContent = catLabel[p.category];
    $('#pmName').textContent = p.name;
    $('#pmDesc').textContent = p.description;
    const st = $('#pmStock');
    st.textContent = p.stock === 'in' ? 'В наличии — доставим сегодня' : 'Под заказ — соберём за 3 часа';
    st.classList.toggle('is-order', p.stock !== 'in');
    renderPm(false);
    closeAll();
    openLayer('product');
    $('#product .pm').scrollTop = 0;
  }

  function renderPm(animate = true) {
    const p = byId[pm.id];
    $('#pmSizes').innerHTML = ['S', 'M', 'L'].map((s) =>
      `<button type="button" class="size-opt ${pm.size === s ? 'is-active' : ''}" role="radio" aria-checked="${pm.size === s}" data-size="${s}"><b>${s}</b>${fmt(p.sizes[s])}</button>`).join('');
    const info = D.SIZE_INFO[pm.size];
    $('#pmSizeText').textContent = `${info.name} — ${info.height}`;
    $('#pmComposition').innerHTML = scaledComposition(p, pm.size).map((c) => `<li>${esc(c)}</li>`).join('');
    const price = $('#pmPrice');
    price.textContent = fmt(p.sizes[pm.size] * pm.qty);
    if (animate) bump(price);
    $('#pmQty').textContent = pm.qty;
    $('#pmMinus').disabled = pm.qty <= 1;
    const fav = state.favs.includes(p.id);
    const fb = $('#pmFav');
    fb.classList.toggle('is-active', fav);
    fb.innerHTML = icon(fav ? 'heart-fill' : 'heart');
    fb.setAttribute('aria-label', fav ? 'Удалить из избранного' : 'Добавить в избранное');
    fb.setAttribute('aria-pressed', fav);
  }
  $('#pmSizes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-size]');
    if (!b) return;
    pm.size = b.dataset.size;
    renderPm();
  });
  $('#pmMinus').addEventListener('click', () => { if (pm.qty > 1) { pm.qty--; renderPm(); bump($('#pmQty')); } });
  $('#pmPlus').addEventListener('click', () => { if (pm.qty < 99) { pm.qty++; renderPm(); bump($('#pmQty')); } });
  $('#pmFav').addEventListener('click', () => { toggleFav(pm.id); renderPm(false); });
  $('#pmAdd').addEventListener('click', (e) => {
    addToCart({ type: 'product', id: pm.id, size: pm.size }, pm.qty, e.currentTarget);
    flashButton(e.currentTarget);
  });

  /* ------------------------------ Корзина ------------------------------ */
  function flyToCart(from) {
    const target = $('#cartBtn');
    if (!from || !target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'fly-dot';
    dot.style.left = a.left + a.width / 2 + 'px';
    dot.style.top = a.top + a.height / 2 + 'px';
    document.body.appendChild(dot);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      dot.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(0.5)`;
      dot.style.opacity = '0.4';
    }));
    setTimeout(() => dot.remove(), 800);
  }

  function addToCart(entry, qty, sourceEl) {
    const key = entry.key || `${entry.id}:${entry.size}`;
    const existing = state.cart.find((i) => i.key === key);
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else state.cart.push(Object.assign({ key, qty }, entry));
    saveCart();
    flyToCart(sourceEl);
    setTimeout(() => updateCounters(true), sourceEl ? 650 : 0);
    const name = entry.type === 'custom' ? entry.name : byId[entry.id].name;
    toast(`«${name}» добавлен в корзину`, 'bag');
    if ($('#cart').classList.contains('is-open')) renderCart();
  }

  function changeQty(key, delta) {
    const item = state.cart.find((i) => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    saveCart();
    renderCart();
    bump($(`.line[data-key="${CSS.escape(key)}"] .qty span`));
    updateCounters(true);
  }

  function removeItem(key) {
    const line = $(`.line[data-key="${CSS.escape(key)}"]`);
    const done = () => {
      state.cart = state.cart.filter((i) => i.key !== key);
      saveCart();
      renderCart();
      updateCounters(true);
    };
    if (line) { line.classList.add('is-removing'); setTimeout(done, 320); } else done();
  }

  function updateCounters(animate) {
    const c = $('#cartCount'), q = cartQty();
    c.textContent = q; c.hidden = q === 0;
    if (animate && q) bump(c, 'is-bump');
    const f = $('#favCount');
    f.textContent = state.favs.length; f.hidden = state.favs.length === 0;
  }

  function lineMeta(item) {
    if (item.type === 'custom') return `${item.sizeLabel} · ${item.meta}`;
    const s = D.SIZE_INFO[item.size];
    return `Размер ${s.label} · ${s.name.toLowerCase()}`;
  }

  function renderCart() {
    const body = $('#cartItems');
    const q = cartQty();
    $('#cartHeadCount').textContent = q ? `· ${q} ${plural(q, ['товар', 'товара', 'товаров'])}` : '';
    if (!state.cart.length) {
      body.innerHTML = `<div class="cart-empty"><div class="cart-empty__icon">${icon('bag')}</div><p>В вашей корзине пока пусто</p><a href="#catalog" class="btn btn--primary" id="emptyCartBtn">Посмотреть букеты</a></div>`;
      $('#emptyCartBtn').addEventListener('click', () => closeLayer('cart'));
      $('#cartFoot').hidden = true;
      $('#freeShipping').innerHTML = '';
      return;
    }
    body.innerHTML = state.cart.map((i) => {
      const name = i.type === 'custom' ? i.name : byId[i.id].name;
      const open = i.type === 'custom' ? '' : ` data-open-product="${i.id}"`;
      return `<div class="line" data-key="${esc(i.key)}">
        <div class="line__img"${open}>${itemMedia(i)}</div>
        <div class="line__info">
          <div class="line__top"><div><h3 class="line__name">${esc(name)}</h3><p class="line__meta">${esc(lineMeta(i))}</p></div>
            <button class="line__remove" type="button" data-cart="remove" aria-label="Удалить ${esc(name)}">${icon('trash')}</button></div>
          <div class="line__bottom">
            <div class="qty"><button type="button" data-cart="dec" aria-label="Уменьшить" ${i.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button><span>${i.qty}</span><button type="button" data-cart="inc" aria-label="Увеличить">${icon('plus')}</button></div>
            <span class="line__price">${fmt(priceOf(i) * i.qty)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
    const sub = subtotal(), del = deliveryCost(sub);
    $('#cartSubtotal').textContent = fmt(sub);
    $('#cartDelivery').textContent = del ? fmt(del) : 'Бесплатно';
    const total = $('#cartTotal');
    const newTotal = fmt(sub + del);
    if (total.textContent !== newTotal) { total.textContent = newTotal; bump(total); }
    $('#cartFoot').hidden = false;
    const left = FREE_FROM - sub;
    $('#freeShipping').innerHTML = left > 0
      ? `До бесплатной доставки — ${fmt(left)}<div class="progress"><span style="width:${Math.min(100, (sub / FREE_FROM) * 100)}%"></span></div>`
      : `Доставка для вас бесплатна<div class="progress"><span style="width:100%"></span></div>`;
  }

  $('#cartItems').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cart]');
    if (b) {
      const key = b.closest('.line').dataset.key;
      if (b.dataset.cart === 'inc') changeQty(key, 1);
      else if (b.dataset.cart === 'dec') changeQty(key, -1);
      else removeItem(key);
      return;
    }
    const img = e.target.closest('[data-open-product]');
    if (img) openProduct(img.dataset.openProduct);
  });
  $('#checkoutBtn').addEventListener('click', openCheckout);

  /* ------------------------------ Избранное ------------------------------ */
  function toggleFav(id) {
    const has = state.favs.includes(id);
    state.favs = has ? state.favs.filter((x) => x !== id) : [...state.favs, id];
    saveFavs();
    $$(`[data-id="${id}"] .fav-btn`).forEach((b) => {
      b.classList.toggle('is-active', !has);
      b.innerHTML = icon(!has ? 'heart-fill' : 'heart');
      b.setAttribute('aria-pressed', String(!has));
      b.setAttribute('aria-label', !has ? 'Удалить из избранного' : 'Добавить в избранное');
    });
    updateCounters();
    if (!has) bump($('#favCount'), 'is-bump');
    toast(has ? `«${byId[id].name}» удалён из избранного` : `«${byId[id].name}» в избранном`, has ? 'heart' : 'heart-fill');
    if ($('#favorites').classList.contains('is-open')) renderFavs();
  }

  function renderFavs() {
    const box = $('#favList');
    if (!state.favs.length) {
      box.innerHTML = `<div class="empty-note">${icon('heart')}<p>Здесь пока ничего нет</p><span>Нажмите на сердечко у букета, чтобы сохранить его</span><a href="#catalog" class="btn btn--ghost btn--sm" data-close>Перейти в каталог</a></div>`;
      return;
    }
    box.innerHTML = state.favs.map((id) => byId[id]).map((p) => `
      <div class="fav-item" data-id="${p.id}">
        <div class="fav-item__img" data-action="open">${media(p)}</div>
        <div><h3 data-action="open">${esc(p.name)}</h3><p>${esc(p.short)} · ${fmt(p.price)}</p></div>
        <div class="fav-item__actions">
          <button class="btn btn--primary" type="button" data-action="fav-add">В корзину</button>
          <button class="line__remove" type="button" data-action="fav" aria-label="Удалить из избранного">${icon('trash')}</button>
        </div>
      </div>`).join('');
  }

  /* ------------------------------ Поиск ------------------------------ */
  const norm = (s) => s.toLowerCase().replace(/ё/g, 'е');
  const stem = (w) => { while (w.length > 3 && /[аеиоуыэюяйь]$/.test(w)) w = w.slice(0, -1); return w; };
  PRODUCTS.forEach((p) => {
    p._words = norm([p.name, p.short, p.description, p.composition.join(' '), p.keywords, catLabel[p.category], p.occasions.map((o) => D.OCCASIONS[o]).join(' ')].join(' '))
      .split(/[^a-zа-я0-9]+/).filter(Boolean);
  });
  function search(q) {
    const terms = norm(q).split(/[^a-zа-я0-9]+/).filter(Boolean).map(stem);
    if (!terms.length) return null;
    return PRODUCTS.filter((p) => terms.every((t) => p._words.some((w) => w.startsWith(t))))
      .sort((a, b) => b.popularity - a.popularity);
  }
  const searchInput = $('#searchInput');
  let sTimer;
  function renderSearch() {
    const res = search(searchInput.value);
    const box = $('#searchResults');
    if (!res) { box.innerHTML = ''; return; }
    box.innerHTML = res.length
      ? res.map((p, i) => `<button class="s-item" type="button" data-product="${p.id}" style="animation-delay:${i * 30}ms"><span class="s-item__img">${media(p)}</span><span><strong>${esc(p.name)}</strong><span>${esc(p.short)}</span><br><span>${fmt(p.price)}</span></span></button>`).join('')
      : `<p class="search__empty">По вашему запросу ничего не найдено</p>`;
  }
  searchInput.addEventListener('input', () => { clearTimeout(sTimer); sTimer = setTimeout(renderSearch, 120); });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const first = $('#searchResults [data-product]'); if (first) openProduct(first.dataset.product); }
  });
  $('#searchHints').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    searchInput.value = b.dataset.q;
    renderSearch();
    searchInput.focus();
  });
  $('#searchResults').addEventListener('click', (e) => {
    const b = e.target.closest('[data-product]');
    if (b) openProduct(b.dataset.product);
  });

  /* ------------------------------ Конструктор ------------------------------ */
  const B = D.BUILDER;
  const FLOWER_FORMS = {
    rose: ['роза', 'розы', 'роз'], peony: ['пион', 'пиона', 'пионов'], tulip: ['тюльпан', 'тюльпана', 'тюльпанов'],
    eustoma: ['эустома', 'эустомы', 'эустом'], chrys: ['хризантема', 'хризантемы', 'хризантем'], alstro: ['альстромерия', 'альстромерии', 'альстромерий']
  };
  const COLOR_ADJ = { white: 'белые', pink: 'розовые', red: 'красные', burgundy: 'бордовые', yellow: 'жёлтые', mix: 'разноцветные' };
  const bForm = $('#builderForm');

  function radio(name, o, checked, extra = '') {
    return `<label class="opt"><input type="radio" name="${name}" value="${o.id}" ${checked ? 'checked' : ''}><span>${extra}${o.label}</span></label>`;
  }
  $('#bFlowers').innerHTML = B.flowers.map((o, i) => radio('flower', o, i === 0)).join('');
  $('#bColors').innerHTML = B.colors.map((o) => radio('color', o, o.id === 'pink', `<i class="swatch" style="background:${o.swatch}"></i>`)).join('');
  $('#bSizes').innerHTML = B.sizes.map((o) => radio('size', o, o.id === 'm')).join('');
  $('#bWraps').innerHTML = B.wraps.map((o, i) => radio('wrap', o, i === 0, `<i class="swatch" style="background:${o.swatch}"></i>`)).join('');
  $('#bExtras').innerHTML = B.extras.map((o) =>
    `<label class="check"><input type="checkbox" name="extra" value="${o.id}"><span class="check__box">${icon('check')}</span>${o.label}<small>+${fmt(o.price)}</small></label>`).join('');

  function builderConfig() {
    const fd = new FormData(bForm);
    const flower = B.flowers.find((x) => x.id === fd.get('flower'));
    const color = B.colors.find((x) => x.id === fd.get('color'));
    const size = B.sizes.find((x) => x.id === fd.get('size'));
    const wrap = B.wraps.find((x) => x.id === fd.get('wrap'));
    const extras = B.extras.filter((x) => fd.getAll('extra').includes(x.id));
    const price = B.base + flower.price * size.stems + wrap.price + extras.reduce((s, x) => s + x.price, 0);
    const has = (id) => extras.some((x) => x.id === id);
    const image = D.PHOTOS.builder(flower.id, color.id);
    return { flower, color, size, wrap, extras, price, image };
  }

  let lastBuilderPrice = null;
  let lastBuilderSrc = null;
  function renderBuilder() {
    const c = builderConfig();
    // Фото меняем только при смене цветка или оттенка, чтобы не мигало
    if (lastBuilderSrc !== c.image.src) {
      lastBuilderSrc = c.image.src;
      $('#builderArt').innerHTML = photo(c.image.src, { alt: `Пример букета: ${c.flower.label.toLowerCase()}, ${COLOR_ADJ[c.color.id]}`, tint: '#efe6da', label: c.flower.label, fallback: c.image.fallback, eager: true });
    }
    $('#builderTags').innerHTML = [c.color.label, c.size.label, c.wrap.label + ' упаковка', ...c.extras.map((x) => x.label)]
      .map((t) => `<span>${esc(t)}</span>`).join('');
    const priceEl = $('#builderPrice');
    priceEl.textContent = fmt(c.price);
    if (lastBuilderPrice !== null && lastBuilderPrice !== c.price) bump(priceEl, 'is-changed');
    lastBuilderPrice = c.price;
    const extras = c.extras.length ? ' · ' + c.extras.map((x) => x.label.toLowerCase()).join(', ') : '';
    $('#builderSummary').textContent = `${c.size.stems} ${plural(c.size.stems, FLOWER_FORMS[c.flower.id])} · ${COLOR_ADJ[c.color.id]} · ${c.wrap.label.toLowerCase()} упаковка${extras}`;
  }
  bForm.addEventListener('change', renderBuilder);
  bForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = builderConfig();
    const key = 'custom:' + [c.flower.id, c.color.id, c.size.id, c.wrap.id, ...c.extras.map((x) => x.id)].join('-');
    const extras = c.extras.length ? ' · ' + c.extras.map((x) => x.label.toLowerCase()).join(', ') : '';
    addToCart({
      type: 'custom', key, name: 'Авторский букет', price: c.price, image: c.image,
      sizeLabel: c.size.label,
      meta: `${c.size.stems} ${plural(c.size.stems, FLOWER_FORMS[c.flower.id])}, ${COLOR_ADJ[c.color.id]} · ${c.wrap.label.toLowerCase()} упаковка${extras}`
    }, 1, e.submitter || $('button[type=submit]', bForm));
    flashButton(e.submitter || $('button[type=submit]', bForm), 'Букет в корзине');
  });

  /* ------------------------------ Формы: общие помощники ------------------------------ */
  const SLOTS = ['09:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00'];
  function fillSlots(select, dateInput) {
    const cur = select.value;
    const isToday = dateInput.value === todayISO();
    const hour = new Date().getHours();
    select.innerHTML = '<option value="">Выберите интервал</option>' + SLOTS.map((s) => {
      const end = parseInt(s.slice(6, 8), 10);
      const disabled = isToday && end - 1 <= hour;
      return `<option value="${s}" ${disabled ? 'disabled' : ''}>${s}${disabled ? ' — недоступно' : ''}</option>`;
    }).join('');
    if (cur && [...select.options].some((o) => o.value === cur && !o.disabled)) select.value = cur;
  }
  function setupDate(dateInput, select) {
    dateInput.min = todayISO();
    const max = new Date(); max.setDate(max.getDate() + 60);
    dateInput.max = `${max.getFullYear()}-${pad(max.getMonth() + 1)}-${pad(max.getDate())}`;
    dateInput.addEventListener('change', () => fillSlots(select, dateInput));
    fillSlots(select, dateInput);
  }

  // Маска телефона: +7 (700) 123-45-67
  function formatPhone(v) {
    let d = v.replace(/\D/g, '');
    if (!d) return '';
    // Цифры после кода страны; «8» или «7» в начале 11-значного номера — это код, а не часть номера
    let local = v.trim().startsWith('+7') ? d.slice(1) : d;
    if (local.length >= 11 && /^[78]/.test(local)) local = local.slice(1);
    local = local.slice(0, 10);
    let out = '+7';
    if (local.length) out += ' (' + local.slice(0, 3);
    if (local.length > 3) out += ')';
    if (local.length > 3) out += ' ' + local.slice(3, 6);
    if (local.length > 6) out += '-' + local.slice(6, 8);
    if (local.length > 8) out += '-' + local.slice(8, 10);
    return out;
  }
  $$('[data-phone]').forEach((inp) => {
    inp.addEventListener('input', () => { inp.value = formatPhone(inp.value); });
    inp.addEventListener('focus', () => { if (!inp.value) inp.value = '+7 ('; });
    inp.addEventListener('blur', () => { if (inp.value.replace(/\D/g, '').length <= 1) inp.value = ''; });
  });

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldError(input, msg) {
    const field = input.closest('.field');
    if (!field) return;
    field.classList.toggle('is-invalid', !!msg);
    let err = $('.field__error', field);
    if (msg) {
      if (!err) { err = document.createElement('span'); err.className = 'field__error'; field.appendChild(err); }
      err.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
    } else {
      if (err) err.remove();
      input.removeAttribute('aria-invalid');
    }
  }
  function validate(form) {
    let firstBad = null;
    $$('input, select, textarea', form).forEach((inp) => {
      if (inp.type === 'checkbox' || inp.type === 'radio') return;
      let msg = '';
      const v = inp.value.trim();
      if (inp.required && !v) msg = 'Заполните это поле';
      else if (v && inp.type === 'email' && !EMAIL_RE.test(v)) msg = 'Проверьте email';
      else if (v && inp.hasAttribute('data-phone') && v.replace(/\D/g, '').length !== 11) msg = 'Введите номер полностью';
      else if (v && inp.type === 'date' && v < todayISO()) msg = 'Дата не может быть в прошлом';
      fieldError(inp, msg);
      if (msg && !firstBad) firstBad = inp;
    });
    return firstBad;
  }
  // Сбрасываем ошибку, как только пользователь исправляет поле
  document.addEventListener('input', (e) => {
    if (e.target.closest('.field.is-invalid')) fieldError(e.target, '');
  });
  document.addEventListener('change', (e) => {
    if (e.target.closest('.field.is-invalid')) fieldError(e.target, '');
  });

  /* ------------------------------ Форма доставки ------------------------------ */
  const dForm = $('#deliveryForm');
  setupDate($('#dDate'), $('#dTime'));
  if (state.delivery) {
    const d = state.delivery;
    if (d.date && d.date >= todayISO()) { $('#dDate').value = d.date; fillSlots($('#dTime'), $('#dDate')); }
    ['address', 'recipient', 'recipientPhone', 'comment'].forEach((k) => { if (d[k]) dForm.elements[k].value = d[k]; });
    if (d.time) $('#dTime').value = d.time;
    dForm.elements.door.checked = !!d.door;
  }
  dForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = validate(dForm);
    if (bad) { bad.focus(); toast('Пожалуйста, заполните обязательные поля', 'close'); return; }
    const fd = new FormData(dForm);
    state.delivery = Object.fromEntries(['date', 'time', 'address', 'recipient', 'recipientPhone', 'comment'].map((k) => [k, (fd.get(k) || '').trim()]));
    state.delivery.door = !!fd.get('door');
    store.set('bloom.delivery', state.delivery);
    toast('Данные доставки сохранены — подставим их в заказ');
  });

  /* ------------------------------ Анонимный подарок ------------------------------ */
  const aForm = $('#anonForm');
  function fillAnonForm() {
    const a = state.anon;
    if (a) ['noName', 'noCall', 'anonCard'].forEach((k) => { aForm.elements[k].checked = !!a[k]; });
    $('#anonOff').hidden = !a;
  }
  function renderAnonStatus() {
    const el = $('#anonStatus');
    el.hidden = !state.anon;
    if (state.anon) {
      const parts = [];
      if (state.anon.noName) parts.push('без имени');
      if (state.anon.noCall) parts.push('без звонка');
      if (state.anon.anonCard) parts.push('с анонимной открыткой');
      el.innerHTML = `${icon('check')} Анонимная доставка включена${parts.length ? ': ' + parts.join(', ') : ''}`;
    }
  }
  aForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = { noName: aForm.elements.noName.checked, noCall: aForm.elements.noCall.checked, anonCard: aForm.elements.anonCard.checked };
    if (!v.noName && !v.noCall && !v.anonCard) { toast('Выберите хотя бы один вариант', 'close'); return; }
    state.anon = v;
    store.set('bloom.anon', v);
    renderAnonStatus();
    closeLayer('anon');
    toast('Сюрприз настроен — мы сохраним интригу', 'mask');
  });
  $('#anonOff').addEventListener('click', () => {
    state.anon = null;
    store.set('bloom.anon', null);
    renderAnonStatus();
    closeLayer('anon');
    toast('Анонимная доставка отключена');
  });

  /* ------------------------------ Оформление заказа ------------------------------ */
  const coForm = $('#checkoutForm');
  setupDate($('#coDate'), $('#coTime'));

  function openCheckout() {
    if (!state.cart.length) return;
    const d = state.delivery || {};
    const c = state.contact || {};
    const set = (name, v) => { if (v && !coForm.elements[name].value) coForm.elements[name].value = v; };
    set('name', c.name); set('phone', c.phone); set('email', c.email);
    set('address', d.address);
    if (d.date && d.date >= todayISO() && !coForm.elements.date.value) { coForm.elements.date.value = d.date; }
    fillSlots($('#coTime'), $('#coDate'));
    if (d.time && !coForm.elements.time.value) coForm.elements.time.value = d.time;
    if (!coForm.elements.comment.value) {
      const parts = [];
      if (d.recipient) parts.push(`Получатель: ${d.recipient}${d.recipientPhone ? ', ' + d.recipientPhone : ''}`);
      if (d.door) parts.push('Оставить у двери');
      if (d.comment) parts.push(d.comment);
      coForm.elements.comment.value = parts.join('. ');
    }
    $('#coItems').innerHTML = state.cart.map((i) => {
      const name = i.type === 'custom' ? i.name : byId[i.id].name;
      return `<div class="co-item"><div class="co-item__img">${itemMedia(i)}</div><div><strong>${esc(name)}</strong><span>${esc(i.type === 'custom' ? i.sizeLabel : 'Размер ' + i.size)} × ${i.qty}</span></div><b>${fmt(priceOf(i) * i.qty)}</b></div>`;
    }).join('');
    const sub = subtotal(), del = deliveryCost(sub);
    $('#coSubtotal').textContent = fmt(sub);
    $('#coDelivery').textContent = del ? fmt(del) : 'Бесплатно';
    $('#coTotal').textContent = fmt(sub + del);
    $('#coAnon').hidden = !state.anon;
    $('#coError').hidden = true;
    closeAll();
    openLayer('checkout');
    $('#checkout .checkout').scrollTop = 0;
  }

  coForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = validate(coForm);
    const agree = coForm.elements.agree;
    const agreeLabel = agree.closest('.check');
    agreeLabel.classList.toggle('is-invalid', !agree.checked);
    const err = $('#coError');
    if (bad || !agree.checked) {
      err.textContent = bad ? 'Проверьте выделенные поля' : 'Подтвердите согласие на обработку данных';
      err.hidden = false;
      (bad || agree).focus();
      return;
    }
    err.hidden = true;
    const fd = new FormData(coForm);
    state.contact = { name: fd.get('name').trim(), phone: fd.get('phone').trim(), email: fd.get('email').trim() };
    store.set('bloom.contact', state.contact);
    const number = 'BL-' + (1000 + Math.floor(Math.random() * 9000));
    const orders = store.get('bloom.orders', []);
    orders.push({ number, date: new Date().toISOString(), total: subtotal() + deliveryCost(subtotal()), items: state.cart, pay: fd.get('pay'), anon: state.anon });
    store.set('bloom.orders', orders.slice(-20));
    state.cart = [];
    saveCart();
    updateCounters();
    renderCart();
    ['address', 'date', 'time', 'comment'].forEach((k) => { coForm.elements[k].value = ''; });
    agree.checked = false;
    $('#orderNumber').textContent = '#' + number;
    closeAll();
    openLayer('success');
  });
  coForm.elements.agree.addEventListener('change', (e) => {
    if (e.target.checked) { e.target.closest('.check').classList.remove('is-invalid'); $('#coError').hidden = true; }
  });

  /* ------------------------------ Отзывы ------------------------------ */
  const track = $('#reviewsTrack');
  track.innerHTML = D.REVIEWS.map((r) => `
    <article class="review">
      <div class="review__stars" aria-label="Оценка 5 из 5">★★★★★</div>
      <p class="review__text">«${esc(r.text)}»</p>
      <div class="review__author"><span class="avatar" aria-hidden="true">${esc(r.name[0])}</span><div><strong>${esc(r.name)}</strong><span>Букет «${esc(r.product)}»</span></div></div>
    </article>`).join('');
  const reviewCards = $$('.review', track);
  const dotsBox = $('#reviewsDots');
  function reviewStep() { const c = reviewCards[0]; return c.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 24); }
  function reviewPages() { return Math.max(1, reviewCards.length - Math.round(track.clientWidth / reviewStep()) + 1); }
  function renderDots() {
    const n = reviewPages();
    dotsBox.innerHTML = n > 1 ? Array.from({ length: n }, (_, i) => `<button type="button" aria-label="Отзыв ${i + 1}" data-i="${i}"></button>`).join('') : '';
    updateReviewUI();
  }
  function updateReviewUI() {
    const idx = Math.round(track.scrollLeft / reviewStep());
    $$('button', dotsBox).forEach((b, i) => b.classList.toggle('is-active', i === idx));
    $('#revPrev').disabled = track.scrollLeft <= 4;
    $('#revNext').disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  $('#revPrev').addEventListener('click', () => track.scrollBy({ left: -reviewStep(), behavior: 'smooth' }));
  $('#revNext').addEventListener('click', () => track.scrollBy({ left: reviewStep(), behavior: 'smooth' }));
  dotsBox.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) track.scrollTo({ left: +b.dataset.i * reviewStep(), behavior: 'smooth' }); });
  let rTick = false;
  track.addEventListener('scroll', () => { if (!rTick) { rTick = true; requestAnimationFrame(() => { updateReviewUI(); rTick = false; }); } }, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); $('#revNext').click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); $('#revPrev').click(); }
  });
  let rResize;
  window.addEventListener('resize', () => { clearTimeout(rResize); rResize = setTimeout(renderDots, 150); });

  /* ------------------------------ FAQ ------------------------------ */
  $('#faqList').innerHTML = D.FAQ.map((f, i) => `
    <div class="acc">
      <button class="acc__q" type="button" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">${esc(f.q)}<span class="acc__icon" aria-hidden="true"></span></button>
      <div class="acc__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"><div><p>${esc(f.a)}</p></div></div>
    </div>`).join('');
  $('#faqList').addEventListener('click', (e) => {
    const q = e.target.closest('.acc__q');
    if (!q) return;
    const item = q.parentElement;
    const open = !item.classList.contains('is-open');
    $$('.acc', $('#faqList')).forEach((a) => { a.classList.remove('is-open'); $('.acc__q', a).setAttribute('aria-expanded', 'false'); });
    if (open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
  });

  /* ------------------------------ Подписка ------------------------------ */
  $('#newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = $('#nlEmail').value.trim();
    if (!EMAIL_RE.test(email)) {
      form.classList.add('is-invalid');
      toast('Введите корректный email', 'close');
      $('#nlEmail').focus();
      return;
    }
    form.classList.remove('is-invalid');
    store.set('bloom.newsletter', email);
    form.hidden = true;
    $('#newsletterThanks').hidden = false;
  });
  $('#nlEmail').addEventListener('input', () => $('#newsletterForm').classList.remove('is-invalid'));

  /* ------------------------------ Иллюстрации ------------------------------ */
  $('#heroArt').innerHTML = photo(D.PHOTOS.hero, { alt: 'Пышный букет из пионов и роз в керамической вазе', tint: '#efe2d9', label: 'Главное фото', eager: true });
  $('.hero__tag span:last-child').textContent = `от ${fmt(byId['peony-dream'].sizes.S)}`;
  $('.hero__tag').addEventListener('click', () => openProduct('peony-dream'));
  $('#aboutArt').innerHTML = photo(D.PHOTOS.about, { alt: 'Флорист собирает букет в мастерской BLOOM', tint: '#efe6da', label: 'Мастерская BLOOM' });
  $('#mapArt').innerHTML = window.BloomMap.cityMap();

  /* ------------------------------ Появление и счётчики ------------------------------ */
  function animateCount(el) {
    const target = +el.dataset.count;
    const start = performance.now(), dur = 1400;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const v = Math.round(target * (1 - Math.pow(1 - k, 3)));
      el.textContent = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initReveal() {
    const els = $$('.reveal');
    els.forEach((el) => {
      const sibs = $$(':scope > .reveal', el.parentElement);
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = `${Math.min(i, 5) * 80}ms`;
    });
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        $$('[data-count]', en.target).forEach(animateCount);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------ Старт ------------------------------ */
  renderOccasions();
  renderPopular();
  renderChips();
  renderCatalog();
  renderBuilder();
  renderAnonStatus();
  updateCounters();
  renderDots();
  initReveal();
  onScroll();
})();
