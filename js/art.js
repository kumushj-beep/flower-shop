/* ==========================================================================
   BLOOM — генератор SVG-иллюстраций букетов
   Все изображения на сайте рисуются этим модулем, поэтому сайт работает
   полностью офлайн. Чтобы заменить иллюстрацию на фотографию, достаточно
   указать поле `image` у товара в js/data.js.
   ========================================================================== */
(function (global) {
  'use strict';

  // Палитры цветков: b — основной, d — тени/контур, l — светлый, c — сердцевина
  const PAL = {
    white:    { b: '#f7f1e8', d: '#e0d2c0', l: '#fffbf6', c: '#dcc591' },
    cream:    { b: '#f3e3cc', d: '#dcc19d', l: '#fbf2e6', c: '#caa36c' },
    blush:    { b: '#f2d2cc', d: '#dcaaa3', l: '#fae8e4', c: '#c98a84' },
    pink:     { b: '#e8adae', d: '#cb8387', l: '#f4cfcf', c: '#ad636b' },
    red:      { b: '#b7343f', d: '#8b1f2b', l: '#cd5a62', c: '#6a1420' },
    burgundy: { b: '#722032', d: '#4d1220', l: '#8f3748', c: '#3a0b15' },
    yellow:   { b: '#efd48c', d: '#d6b05a', l: '#f8e8ba', c: '#b9862c' },
    peach:    { b: '#f1c4a3', d: '#d99f79', l: '#f9ddc9', c: '#bd7b52' },
    lilac:    { b: '#cdb7d8', d: '#a68db7', l: '#e5d8ec', c: '#7c6490' },
    coral:    { b: '#eb9f8e', d: '#cf7a69', l: '#f6c7bb', c: '#a8523f' },
    sky:      { b: '#bccbd9', d: '#95a8bb', l: '#dbe4ec', c: '#5f7488' }
  };

  const GREEN = { leaf: '#7e977f', leafDark: '#617a63', stem: '#7b8f6f', euc: '#9fb2a4', eucDark: '#7f978a' };

  const WRAPS = {
    kraft: { back: '#caa47b', front: '#d8b58d', edge: '#b88f63' },
    white: { back: '#ebe4da', front: '#f8f4ee', edge: '#d9cfc2' },
    pink:  { back: '#e7bfbb', front: '#f2d6d2', edge: '#d3a19c' },
    black: { back: '#2c2b2a', front: '#3b3937', edge: '#1d1c1b' },
    sage:  { back: '#b9c4b3', front: '#d0d8cb', edge: '#9eab98' }
  };

  // Детерминированный генератор случайных чисел (одинаковая картинка при каждом рендере)
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
  const pal = (c) => PAL[c] || PAL.pink;

  /* ---------------------------- Цветки ---------------------------- */

  function rose(x, y, r, p, rot) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    for (let i = 0; i < 5; i++) {
      s += `<ellipse cx="0" cy="${f(-r * 0.42)}" rx="${f(r * 0.56)}" ry="${f(r * 0.52)}" transform="rotate(${i * 72})" fill="${p.b}" stroke="${p.d}" stroke-width="0.9"/>`;
    }
    s += `<circle r="${f(r * 0.66)}" fill="${p.b}"/>`;
    s += `<circle r="${f(r * 0.52)}" fill="${p.l}" opacity="0.45"/>`;
    const k = r * 0.115;
    s += `<path d="M0 0 a${f(k)} ${f(k)} 0 0 1 ${f(2 * k)} 0 a${f(2 * k)} ${f(2 * k)} 0 0 1 ${f(-4 * k)} 0 a${f(3 * k)} ${f(3 * k)} 0 0 1 ${f(6 * k)} 0 a${f(4 * k)} ${f(4 * k)} 0 0 1 ${f(-8 * k)} 0 a${f(5 * k)} ${f(5 * k)} 0 0 1 ${f(9.4 * k)} ${f(1.4 * k)}" fill="none" stroke="${p.d}" stroke-width="${f(Math.max(0.9, r * 0.055))}" stroke-linecap="round"/>`;
    return s + '</g>';
  }

  function peony(x, y, r, p, rot) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    const ring = (n, dist, rad, fill, off) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + off;
        s += `<circle cx="${f(Math.cos(a) * dist)}" cy="${f(Math.sin(a) * dist)}" r="${f(rad)}" fill="${fill}" stroke="${p.d}" stroke-width="0.8"/>`;
      }
    };
    ring(10, r * 0.6, r * 0.42, p.l, 0);
    ring(8, r * 0.38, r * 0.36, p.b, 0.3);
    ring(6, r * 0.17, r * 0.24, p.b, 0.8);
    s += `<circle r="${f(r * 0.16)}" fill="${p.d}" opacity="0.55"/>`;
    return s + '</g>';
  }

  function tulip(x, y, r, p, rot) {
    const R = r;
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    s += `<path d="M0 ${f(R * 0.6)} C${f(-R * 0.78)} ${f(R * 0.5)} ${f(-R * 0.74)} ${f(-R * 0.35)} ${f(-R * 0.4)} ${f(-R * 0.66)} C${f(-R * 0.24)} ${f(-R * 0.26)} ${f(-R * 0.12)} ${f(-R * 0.34)} 0 ${f(-R * 0.78)} C${f(R * 0.12)} ${f(-R * 0.34)} ${f(R * 0.24)} ${f(-R * 0.26)} ${f(R * 0.4)} ${f(-R * 0.66)} C${f(R * 0.74)} ${f(-R * 0.35)} ${f(R * 0.78)} ${f(R * 0.5)} 0 ${f(R * 0.6)}Z" fill="${p.b}" stroke="${p.d}" stroke-width="1"/>`;
    s += `<path d="M0 ${f(R * 0.55)} C${f(-R * 0.36)} ${f(R * 0.2)} ${f(-R * 0.3)} ${f(-R * 0.42)} 0 ${f(-R * 0.72)} C${f(R * 0.3)} ${f(-R * 0.42)} ${f(R * 0.36)} ${f(R * 0.2)} 0 ${f(R * 0.55)}Z" fill="${p.l}" opacity="0.75"/>`;
    return s + '</g>';
  }

  function daisy(x, y, r, p, rot, center) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    const n = 12;
    for (let i = 0; i < n; i++) {
      s += `<ellipse cx="0" cy="${f(-r * 0.52)}" rx="${f(r * 0.17)}" ry="${f(r * 0.46)}" transform="rotate(${f((360 / n) * i)})" fill="${p.l}" stroke="${p.d}" stroke-width="0.6"/>`;
    }
    s += `<circle r="${f(r * 0.27)}" fill="${center || '#d6a444'}"/>`;
    s += `<circle r="${f(r * 0.14)}" fill="#b98232" opacity="0.5"/>`;
    return s + '</g>';
  }

  function chrysanthemum(x, y, r, p, rot) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    for (let i = 0; i < 20; i++) s += `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.1)}" ry="${f(r * 0.42)}" transform="rotate(${i * 18})" fill="${p.b}" stroke="${p.d}" stroke-width="0.5"/>`;
    for (let i = 0; i < 14; i++) s += `<ellipse cx="0" cy="${f(-r * 0.3)}" rx="${f(r * 0.09)}" ry="${f(r * 0.28)}" transform="rotate(${i * 25.7 + 9})" fill="${p.l}" stroke="${p.d}" stroke-width="0.5"/>`;
    s += `<circle r="${f(r * 0.15)}" fill="${p.c}" opacity="0.7"/>`;
    return s + '</g>';
  }

  function eustoma(x, y, r, p, rot) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    for (let i = 0; i < 5; i++) s += `<path d="M0 0 C${f(-r * 0.7)} ${f(-r * 0.2)} ${f(-r * 0.6)} ${f(-r * 0.95)} 0 ${f(-r * 0.9)} C${f(r * 0.6)} ${f(-r * 0.95)} ${f(r * 0.7)} ${f(-r * 0.2)} 0 0Z" transform="rotate(${i * 72 + 36})" fill="${p.b}" stroke="${p.d}" stroke-width="0.8"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M0 0 C${f(-r * 0.45)} ${f(-r * 0.12)} ${f(-r * 0.36)} ${f(-r * 0.6)} 0 ${f(-r * 0.56)} C${f(r * 0.36)} ${f(-r * 0.6)} ${f(r * 0.45)} ${f(-r * 0.12)} 0 0Z" transform="rotate(${i * 90})" fill="${p.l}" stroke="${p.d}" stroke-width="0.6"/>`;
    s += `<circle r="${f(r * 0.12)}" fill="${p.c}"/>`;
    return s + '</g>';
  }

  function alstroemeria(x, y, r, p, rot) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    for (let i = 0; i < 6; i++) {
      s += `<path d="M0 0 C${f(-r * 0.42)} ${f(-r * 0.3)} ${f(-r * 0.3)} ${f(-r * 0.85)} 0 ${f(-r)} C${f(r * 0.3)} ${f(-r * 0.85)} ${f(r * 0.42)} ${f(-r * 0.3)} 0 0Z" transform="rotate(${i * 60})" fill="${i % 2 ? p.l : p.b}" stroke="${p.d}" stroke-width="0.7"/>`;
      if (i % 2 === 0) s += `<path d="M0 ${f(-r * 0.3)} l0 ${f(-r * 0.3)} M${f(-r * 0.08)} ${f(-r * 0.34)} l${f(-r * 0.03)} ${f(-r * 0.18)} M${f(r * 0.08)} ${f(-r * 0.34)} l${f(r * 0.03)} ${f(-r * 0.18)}" transform="rotate(${i * 60})" stroke="${p.c}" stroke-width="1" stroke-linecap="round" opacity="0.8"/>`;
    }
    s += `<circle r="${f(r * 0.1)}" fill="${p.c}"/>`;
    return s + '</g>';
  }

  function bud(x, y, r, p, rot) {
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><ellipse rx="${f(r * 0.34)}" ry="${f(r * 0.5)}" fill="${p.b}" stroke="${p.d}" stroke-width="0.8"/><path d="M${f(-r * 0.34)} ${f(r * 0.1)} Q0 ${f(r * 0.7)} ${f(r * 0.34)} ${f(r * 0.1)}" fill="${GREEN.leaf}"/></g>`;
  }

  const FLOWERS = { rose, peony, tulip, daisy, chrysanthemum, eustoma, alstroemeria, bud };
  const BASE_R = { rose: 30, peony: 40, tulip: 33, daisy: 20, chrysanthemum: 27, eustoma: 29, alstroemeria: 24, bud: 18 };

  /* --------------------------- Зелень --------------------------- */

  function leaf(x, y, len, ang, color) {
    const w = len * 0.32;
    return `<path d="M0 0 C${f(w)} ${f(-len * 0.3)} ${f(w * 0.8)} ${f(-len * 0.8)} 0 ${f(-len)} C${f(-w * 0.8)} ${f(-len * 0.8)} ${f(-w)} ${f(-len * 0.3)} 0 0Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" fill="${color}"/><path d="M0 0 L0 ${f(-len * 0.9)}" transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})" stroke="${GREEN.leafDark}" stroke-width="0.8" opacity="0.5"/>`;
  }

  function eucalyptus(x, y, len, ang, R) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0 0 Q${f(len * 0.12)} ${f(-len * 0.5)} 0 ${f(-len)}" stroke="${GREEN.eucDark}" stroke-width="1.4" fill="none"/>`;
    const n = 6;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 0.4);
      const cy = -len * t;
      const cx = len * 0.12 * Math.sin(t * Math.PI) * 0.9;
      const rr = (len * 0.11) * (1.1 - t * 0.45) * (0.9 + R() * 0.2);
      const side = i % 2 ? 1 : -1;
      s += `<circle cx="${f(cx + side * rr * 0.9)}" cy="${f(cy)}" r="${f(rr)}" fill="${i % 3 ? GREEN.euc : GREEN.eucDark}" opacity="0.95"/>`;
    }
    return s + '</g>';
  }

  function gypsophila(x, y, spread, R) {
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = R() * Math.PI * 2, d = R() * spread;
      s += `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(y + Math.sin(a) * d)}" r="${f(2 + R() * 2.2)}" fill="#fffdf8" stroke="#e7ddcf" stroke-width="0.5"/>`;
    }
    return s;
  }

  function fern(x, y, len, ang) {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0 0 L0 ${f(-len)}" stroke="${GREEN.leafDark}" stroke-width="1.2"/>`;
    for (let i = 1; i < 9; i++) {
      const cy = -len * (i / 9.4), l = len * 0.22 * (1 - i / 11);
      s += `<path d="M0 ${f(cy)} q${f(l * 0.6)} ${f(-l * 0.2)} ${f(l)} ${f(-l * 0.5)} M0 ${f(cy)} q${f(-l * 0.6)} ${f(-l * 0.2)} ${f(-l)} ${f(-l * 0.5)}" stroke="${GREEN.leaf}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
    }
    return s + '</g>';
  }

  /* -------------------------- Композиция -------------------------- */

  /**
   * Возвращает содержимое <g> с букетом (без фона), нарисованным в системе
   * координат 400×500. Опции:
   *   flowers: [{ t: 'rose', c: 'pink', n: 5, s: 1 }]
   *   greens:  ['euc', 'leaf', 'gyps', 'fern']
   *   holder:  'wrap' | 'vase' | 'ceramic' | 'box' | 'basket' | 'none'
   *   wrap:    'kraft' | 'white' | 'pink' | 'black' | 'sage'
   *   ribbon:  цвет ленты или false
   *   spread:  множитель размера «шапки» букета
   */
  function bouquetGroup(o) {
    const R = rng(o.seed || JSON.stringify(o.flowers));
    const holder = o.holder || 'wrap';
    const spread = o.spread || 1;
    const cx = 200, cy = holder === 'box' ? 214 : 200;
    const BT = 304; // верх шляпной коробки
    const RX = 118 * spread, RY = 92 * spread;
    const bx = 200, by = holder === 'vase' || holder === 'ceramic' ? 330 : 350;

    // Список головок цветков
    const heads = [];
    (o.flowers || []).forEach((fl) => {
      for (let i = 0; i < (fl.n || 1); i++) {
        const c = Array.isArray(fl.c) ? fl.c[i % fl.c.length] : fl.c;
        heads.push({ t: fl.t, p: pal(c), s: (fl.s || 1) * (0.9 + R() * 0.2) });
      }
    });
    // Перемешиваем, чтобы цветки распределились равномерно
    for (let i = heads.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [heads[i], heads[j]] = [heads[j], heads[i]]; }
    const N = heads.length;
    heads.forEach((h, i) => {
      const rr = Math.sqrt((i + 0.6) / N) * (N < 4 ? 0.55 : 0.92);
      const th = i * 2.39996 + R() * 0.35;
      h.x = cx + Math.cos(th) * RX * rr + (R() - 0.5) * 8;
      h.y = cy + Math.sin(th) * RY * rr * 0.9 - (1 - rr) * 16 + (R() - 0.5) * 8;
      h.d = rr;
      h.r = (BASE_R[h.t] || 26) * h.s * (N > 14 ? 0.88 : 1) * spread;
      h.rot = R() * 360;
    });

    const W = WRAPS[o.wrap || 'kraft'];
    let back = '', stems = '', greens = '', flowers = '', front = '', extra = '';

    // Задний лист упаковки
    if (holder === 'wrap') {
      back += `<path d="M${bx} 452 L${f(cx - RX - 38)} ${f(cy - RY * 0.2)} Q${f(cx - RX * 0.5)} ${f(cy - RY - 40)} ${cx} ${f(cy - RY - 18)} Q${f(cx + RX * 0.5)} ${f(cy - RY - 40)} ${f(cx + RX + 38)} ${f(cy - RY * 0.2)} Z" fill="${W.back}"/>`;
      back += `<path d="M${bx} 452 L${f(cx - RX - 38)} ${f(cy - RY * 0.2)} L${f(cx - RX - 8)} ${f(cy - RY * 0.05)} Z" fill="${W.edge}" opacity="0.5"/>`;
    }

    // Стебли
    if (holder !== 'wrap' && holder !== 'box') heads.forEach((h) => {
      const ex = holder === 'vase' ? bx + (h.x - cx) * 0.12 : bx + (h.x - cx) * 0.05;
      stems += `<path d="M${f(h.x)} ${f(h.y)} Q${f((h.x + ex) / 2)} ${f((h.y + by) / 2 + 10)} ${f(ex)} ${by}" stroke="${GREEN.stem}" stroke-width="2.2" fill="none"/>`;
    });
    if (holder === 'wrap' || holder === 'none') {
      for (let i = 0; i < 7; i++) {
        const ox = (i - 3) * 4;
        stems += `<path d="M${bx + ox} ${by - 20} L${bx + ox * 1.6} 478" stroke="${i % 2 ? GREEN.stem : GREEN.leafDark}" stroke-width="3" stroke-linecap="round"/>`;
      }
    }
    if (holder === 'vase') {
      for (let i = 0; i < 9; i++) {
        const ox = (i - 4) * 5;
        stems += `<path d="M${bx + ox * 0.6} ${by} L${bx + ox * 1.4} 458" stroke="${GREEN.stem}" stroke-width="2.4" opacity="0.7"/>`;
      }
    }

    // Зелень по периметру
    const gs = o.greens || ['leaf'];
    const G = Math.round(10 + N * 0.6);
    for (let i = 0; i < G; i++) {
      const a = Math.PI + (i / (G - 1)) * Math.PI + (R() - 0.5) * 0.3; // верхняя полуокружность
      const a2 = i % 3 === 0 ? a + Math.PI * (R() * 0.25 - 0.1) : a;
      const px = cx + Math.cos(a2) * RX * 0.72, py = cy + Math.sin(a2) * RY * 0.62 + 8;
      const ang = (a2 * 180) / Math.PI + 90;
      const kind = gs[i % gs.length];
      const len = (46 + R() * 34) * spread;
      if (kind === 'euc') greens += eucalyptus(px, py, len * 1.15, ang, R);
      else if (kind === 'fern') greens += fern(px, py, len * 1.1, ang);
      else if (kind === 'gyps') greens += gypsophila(cx + Math.cos(a2) * RX * 0.95, cy + Math.sin(a2) * RY * 0.9, 16, R);
      else greens += leaf(px, py, len, ang, i % 2 ? GREEN.leaf : GREEN.leafDark);
    }
    // Нижние листья у основания шапки
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? 1 : -1;
      greens += leaf(cx + side * (RX * 0.55 + i * 6), cy + RY * 0.55, 44 * spread, side * (70 + i * 8), i < 2 ? GREEN.leaf : GREEN.leafDark);
    }

    // Головки: сначала внешние, потом центральные
    heads.sort((a, b) => b.d - a.d).forEach((h) => {
      flowers += (FLOWERS[h.t] || rose)(h.x, h.y, h.r, h.p, h.rot);
    });
    if (gs.includes('gyps')) {
      for (let i = 0; i < 5; i++) {
        const a = R() * Math.PI * 2, d = R();
        flowers += gypsophila(cx + Math.cos(a) * RX * 0.8 * d, cy + Math.sin(a) * RY * 0.7 * d, 10, R);
      }
    }

    // Передний план упаковки
    if (holder === 'wrap') {
      front += `<path d="M${bx} 456 L${f(cx - RX * 0.95)} ${f(cy + RY * 0.35)} Q${f(cx - RX * 0.4)} ${f(cy + RY * 0.55)} ${f(cx + 6)} ${f(cy + RY * 0.42)} Z" fill="${W.front}"/>`;
      front += `<path d="M${bx} 456 L${f(cx + RX * 0.98)} ${f(cy + RY * 0.3)} Q${f(cx + RX * 0.45)} ${f(cy + RY * 0.62)} ${f(cx - 14)} ${f(cy + RY * 0.52)} Z" fill="${W.back}" opacity="0.94"/>`;
      front += `<path d="M${bx} 456 L${f(cx + RX * 0.98)} ${f(cy + RY * 0.3)}" stroke="${W.edge}" stroke-width="1" opacity="0.6"/>`;
      if (o.ribbon !== false) {
        const rc = o.ribbon || '#b89a5e';
        front += `<path d="M${bx - 16} 388 Q${bx} 396 ${bx + 16} 388" stroke="${rc}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
        front += `<path d="M${bx} 390 C${bx - 30} 370 ${bx - 34} 402 ${bx} 392 C${bx + 34} 402 ${bx + 30} 370 ${bx} 390Z" fill="${rc}"/>`;
        front += `<path d="M${bx - 2} 393 Q${bx - 12} 420 ${bx - 20} 438 M${bx + 2} 393 Q${bx + 12} 420 ${bx + 22} 436" stroke="${rc}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
      }
    } else if (holder === 'vase') {
      front += `<path d="M168 326 Q160 360 150 392 Q140 440 162 470 L238 470 Q260 440 250 392 Q240 360 232 326 Z" fill="rgba(255,255,255,0.32)" stroke="rgba(120,140,130,0.45)" stroke-width="1.5"/>`;
      front += `<path d="M156 400 Q152 440 166 464 L234 464 Q248 440 244 400 Z" fill="rgba(160,190,180,0.22)"/>`;
      front += `<path d="M176 336 Q170 380 164 420" stroke="rgba(255,255,255,0.8)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      front += `<ellipse cx="200" cy="326" rx="32" ry="5" fill="none" stroke="rgba(120,140,130,0.45)" stroke-width="1.5"/>`;
    } else if (holder === 'ceramic') {
      const vc = o.vaseColor || '#e9e0d3';
      front += `<path d="M160 326 Q150 356 138 390 Q124 438 158 472 L242 472 Q276 438 262 390 Q250 356 240 326 Z" fill="${vc}"/>`;
      front += `<path d="M146 404 L254 404" stroke="#b89a5e" stroke-width="1.2" opacity="0.6"/>`;
      front += `<path d="M162 340 Q154 380 148 420" stroke="rgba(255,255,255,0.55)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      front += `<ellipse cx="200" cy="326" rx="40" ry="6" fill="${vc}" stroke="rgba(0,0,0,0.08)"/>`;
    } else if (holder === 'box') {
      const bc = o.boxColor || '#efe7dc';
      front += `<path d="M86 ${BT} L314 ${BT} L302 462 Q200 478 98 462 Z" fill="${bc}"/>`;
      front += `<ellipse cx="200" cy="${BT}" rx="114" ry="14" fill="${bc}" stroke="rgba(0,0,0,0.06)"/>`;
      front += `<path d="M92 ${BT + 46} L308 ${BT + 46}" stroke="#b89a5e" stroke-width="1.2" opacity="0.7"/>`;
      front += `<text x="200" y="${BT + 104}" text-anchor="middle" font-family="Georgia, serif" font-size="20" letter-spacing="6" fill="#8a7a66">BLOOM</text>`;
    }

    // Открытка
    if (o.card) {
      extra += `<g transform="translate(268 380) rotate(8)"><rect width="62" height="44" rx="3" fill="#fffdf9" stroke="#e1d6c6"/><path d="M8 14 H54 M8 22 H44 M8 30 H50" stroke="#c9b9a3" stroke-width="1.2"/><path d="M31 -12 V0" stroke="#b89a5e"/></g>`;
    }
    if (o.candy) {
      extra += `<g transform="translate(76 420)"><rect width="56" height="40" rx="4" fill="#caa2a0"/><rect y="16" width="56" height="7" fill="#b89a5e"/><rect x="24" width="7" height="40" fill="#b89a5e"/></g>`;
    }

    return back + stems + greens + flowers + front + extra;
  }

  function background(o) {
    const bg = o.bg || '#f3ece2';
    const accent = o.accent || 'rgba(255,255,255,0.55)';
    let s = `<rect width="400" height="500" fill="${bg}"/>`;
    if (o.arch !== false) s += `<path d="M70 500 V190 A130 130 0 0 1 330 190 V500 Z" fill="${accent}"/>`;
    if (o.lines !== false) s += `<circle cx="200" cy="200" r="168" fill="none" stroke="#b89a5e" stroke-width="0.8" opacity="0.35"/>`;
    return s;
  }

  function shadow(holder) {
    if (holder === 'vase' || holder === 'ceramic') return '<ellipse cx="200" cy="474" rx="84" ry="9" fill="rgba(60,50,40,0.1)"/>';
    if (holder === 'box') return '<ellipse cx="200" cy="468" rx="120" ry="10" fill="rgba(60,50,40,0.1)"/>';
    return '<ellipse cx="200" cy="482" rx="60" ry="6" fill="rgba(60,50,40,0.08)"/>';
  }

  function bouquet(o) {
    o = o || {};
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${o.label || 'Букет'}">${background(o)}${shadow(o.holder || 'wrap')}${bouquetGroup(o)}</svg>`;
  }

  /* --------------------- Сцена «мастерская флориста» --------------------- */

  function workshop() {
    const g = (o, tx, ty, sc) => `<g transform="translate(${tx} ${ty}) scale(${sc})">${bouquetGroup(o)}</g>`;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Мастерская флориста BLOOM">`;
    s += `<rect width="400" height="500" fill="#efe6da"/>`;
    // окно-арка
    s += `<path d="M110 330 V130 A90 90 0 0 1 290 130 V330 Z" fill="#f8f3ec"/>`;
    s += `<path d="M200 40 V330 M110 200 H290" stroke="#e2d6c6" stroke-width="3"/>`;
    s += `<path d="M110 330 V130 A90 90 0 0 1 290 130 V330" fill="none" stroke="#d8c9b5" stroke-width="4"/>`;
    // сушёные цветы на верёвке
    s += `<path d="M20 60 Q200 96 380 60" stroke="#b89a5e" stroke-width="1" fill="none"/>`;
    [50, 92, 318, 356].forEach((x, i) => {
      const y = 60 + Math.sin((x / 400) * Math.PI) * 34;
      s += `<g transform="translate(${x} ${f(y)})"><path d="M0 0 L0 46" stroke="#9b8a6c" stroke-width="1.4"/>${fern(0, 46, 44, 180).replace('<g', '<g opacity="0.7"')}${daisy(0, 50, 7, PAL[i % 2 ? 'cream' : 'blush'], 0, '#c9a36a')}</g>`;
    });
    // стол
    s += `<rect x="0" y="392" width="400" height="108" fill="#d9c8b2"/><rect x="0" y="392" width="400" height="6" fill="#cbb89e"/>`;
    // вазы с букетами
    s += g({ seed: 'ws1', flowers: [{ t: 'peony', c: 'blush', n: 3 }, { t: 'rose', c: 'white', n: 2 }], greens: ['euc', 'leaf'], holder: 'ceramic', vaseColor: '#f5efe6', spread: 0.8 }, 12, 212, 0.4);
    s += g({ seed: 'ws2', flowers: [{ t: 'rose', c: 'pink', n: 5 }, { t: 'eustoma', c: 'white', n: 3 }, { t: 'bud', c: 'pink', n: 2 }], greens: ['euc', 'gyps', 'leaf'], holder: 'vase', spread: 0.95 }, 110, 150, 0.5);
    s += g({ seed: 'ws3', flowers: [{ t: 'tulip', c: ['peach', 'white'], n: 5 }], greens: ['leaf'], holder: 'ceramic', vaseColor: '#b9c4b3', spread: 0.7 }, 238, 226, 0.36);
    // ножницы, шпагат, листья на столе
    s += `<g transform="translate(290 440) rotate(-18)"><circle cx="0" cy="0" r="8" fill="none" stroke="#2b2a29" stroke-width="3"/><circle cx="20" cy="0" r="8" fill="none" stroke="#2b2a29" stroke-width="3"/><path d="M5 -6 L46 -40 M15 -6 L-10 -44" stroke="#8c8c8c" stroke-width="3" stroke-linecap="round"/></g>`;
    s += `<g transform="translate(70 452)"><circle r="18" fill="#c9a77f"/><path d="M-16 -6 Q0 -12 16 -6 M-17 2 Q0 -4 17 2 M-14 10 Q0 4 14 10" stroke="#b08c62" stroke-width="1.4" fill="none"/><path d="M16 6 Q40 20 70 10" stroke="#c9a77f" stroke-width="1.4" fill="none"/></g>`;
    s += leaf(170, 470, 34, 100, GREEN.leaf) + leaf(190, 476, 28, 76, GREEN.leafDark);
    s += daisy(236, 468, 10, PAL.blush, 20, '#c9a36a');
    return s + '</svg>';
  }

  /* ------------------------ Карта города ------------------------ */

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

  global.Art = { bouquet, bouquetGroup, workshop, cityMap, PAL };
})(window);
