/* ==========================================================================
   BLOOM — схематичная карта города для блока «Контакты»
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
