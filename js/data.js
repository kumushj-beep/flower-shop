/* ==========================================================================
   BLOOM — данные магазина
   Чтобы заменить иллюстрацию на фото, добавьте товару поле
   image: 'images/blush.jpg' — карточки и корзина подхватят его автоматически.
   ========================================================================== */
(function (global) {
  'use strict';

  // Цена размеров S и L считается от базовой цены M: 12 900 → 9 900 / 17 900
  const nice = (x) => Math.round(x / 1000) * 1000 - 100;
  const sizes = (m) => ({ S: nice(m * 0.77), M: m, L: nice(m * 1.39) });

  const CATEGORIES = [
    { id: 'all', label: 'Все' },
    { id: 'roses', label: 'Розы' },
    { id: 'peonies', label: 'Пионы' },
    { id: 'tulips', label: 'Тюльпаны' },
    { id: 'wild', label: 'Полевые цветы' },
    { id: 'author', label: 'Авторские букеты' },
    { id: 'compositions', label: 'Композиции' }
  ];

  const OCCASIONS = {
    love: 'Для любимой',
    birthday: 'День рождения',
    date: 'Свидание',
    just: 'Просто так'
  };

  const PRICE_RANGES = [
    { id: 'all', label: 'Любая цена', min: 0, max: Infinity },
    { id: 'p1', label: 'до 10 000 ₸', min: 0, max: 10000 },
    { id: 'p2', label: '10 000–15 000 ₸', min: 10000, max: 15000 },
    { id: 'p3', label: '15 000–20 000 ₸', min: 15000, max: 20000 },
    { id: 'p4', label: 'от 20 000 ₸', min: 20000, max: Infinity }
  ];

  const SIZE_INFO = {
    S: { label: 'S', name: 'Маленький', height: 'около 30–35 см' },
    M: { label: 'M', name: 'Средний', height: 'около 40–45 см' },
    L: { label: 'L', name: 'Большой', height: 'около 55–60 см' }
  };

  const PRODUCTS = [
    {
      id: 'blush', name: 'Blush', category: 'roses', occasions: ['love', 'date'],
      short: 'Нежные розовые розы и эвкалипт',
      description: 'Воздушный букет в пудровых оттенках — для тех, кто ценит нежность и лёгкость. Розы сорта Pink Mondial дополнены веточками ароматного эвкалипта.',
      composition: ['розовые розы — 15 шт.', 'эвкалипт', 'декоративная зелень', 'упаковка'],
      keywords: 'роза розы эвкалипт розовый нежный',
      price: 12900, popularity: 98, added: 20260310, badge: 'Хит', stock: 'in',
      art: { seed: 'blush', flowers: [{ t: 'rose', c: 'pink', n: 7 }, { t: 'rose', c: 'blush', n: 3 }], greens: ['euc', 'leaf', 'euc'], holder: 'wrap', wrap: 'white', bg: '#f4e6e1' }
    },
    {
      id: 'romance', name: 'Romance', category: 'roses', occasions: ['love', 'date'],
      short: 'Красные розы',
      description: 'Классика, которая никогда не выходит из моды. Глубокие красные розы в чёрной матовой упаковке — признание без лишних слов.',
      composition: ['красные розы — 21 шт.', 'салал', 'матовая упаковка', 'атласная лента'],
      keywords: 'роза розы красный классика любовь',
      price: 18500, popularity: 95, added: 20251120, badge: 'Хит', stock: 'in',
      art: { seed: 'romance', flowers: [{ t: 'rose', c: 'red', n: 12 }], greens: ['leaf'], holder: 'wrap', wrap: 'black', bg: '#efe4dc' }
    },
    {
      id: 'peony-dream', name: 'Peony Dream', category: 'peonies', occasions: ['love', 'birthday'],
      short: 'Пионы и сезонная зелень',
      description: 'Пышные сезонные пионы — самый романтичный цветок лета. Раскрываются в течение нескольких дней и наполняют дом тонким ароматом.',
      composition: ['пионы — 9 шт.', 'сезонная зелень', 'эвкалипт', 'крафтовая упаковка'],
      keywords: 'пион пионы сезонный пышный',
      price: 22900, popularity: 97, added: 20260520, badge: 'Новинка', stock: 'in',
      art: { seed: 'peony', flowers: [{ t: 'peony', c: 'blush', n: 6 }, { t: 'bud', c: 'blush', n: 3 }], greens: ['leaf', 'euc'], holder: 'wrap', wrap: 'kraft', bg: '#f2e9e0' }
    },
    {
      id: 'morning', name: 'Morning', category: 'author', occasions: ['birthday', 'just'],
      short: 'Белые розы, альстромерии и зелень',
      description: 'Светлый и свежий, как раннее утро. Белые розы и кремовые альстромерии в прозрачной вазе — идеальный подарок для дома.',
      composition: ['белые розы — 9 шт.', 'альстромерии — 5 шт.', 'гипсофила', 'декоративная зелень'],
      keywords: 'роза розы белый альстромерия утро',
      price: 14500, popularity: 90, added: 20260115, badge: '', stock: 'in',
      art: { seed: 'morning', flowers: [{ t: 'rose', c: 'white', n: 5 }, { t: 'alstroemeria', c: 'cream', n: 4 }], greens: ['leaf', 'gyps'], holder: 'vase', bg: '#e6e4d8', accent: 'rgba(255,255,255,0.45)' }
    },
    {
      id: 'wild-garden', name: 'Wild Garden', category: 'wild', occasions: ['just', 'birthday'],
      short: 'Полевые цветы',
      description: 'Будто собран на летнем лугу: ромашки, хризантемы и нежная зелень. Непринуждённый букет с характером.',
      composition: ['ромашки — 7 шт.', 'кустовые хризантемы', 'тюльпаны', 'папоротник', 'крафт'],
      keywords: 'полевые ромашки хризантемы луг лето',
      price: 11900, popularity: 88, added: 20260601, badge: 'Новинка', stock: 'in',
      art: { seed: 'wild', flowers: [{ t: 'daisy', c: 'white', n: 7 }, { t: 'chrysanthemum', c: 'lilac', n: 3 }, { t: 'tulip', c: 'yellow', n: 2 }], greens: ['fern', 'leaf'], holder: 'wrap', wrap: 'kraft', bg: '#e9ecdf' }
    },
    {
      id: 'velvet', name: 'Velvet', category: 'roses', occasions: ['love', 'date'],
      short: 'Бордовые розы и декоративная зелень',
      description: 'Глубокий бархатный оттенок бордо — элегантный и немного загадочный. Для вечера, который хочется запомнить.',
      composition: ['бордовые розы — 17 шт.', 'декоративная зелень', 'эвкалипт', 'упаковка'],
      keywords: 'роза розы бордовый бархат вечер',
      price: 19900, popularity: 93, added: 20260212, badge: '', stock: 'in',
      art: { seed: 'velvet', flowers: [{ t: 'rose', c: 'burgundy', n: 9 }, { t: 'bud', c: 'burgundy', n: 2 }], greens: ['euc', 'leaf'], holder: 'wrap', wrap: 'pink', bg: '#efe2dc' }
    },
    {
      id: 'spring-kiss', name: 'Spring Kiss', category: 'tulips', occasions: ['just', 'birthday'],
      short: 'Персиковые и белые тюльпаны',
      description: 'Весеннее настроение в любое время года. Лёгкие тюльпаны в пастельной гамме с шалфейной упаковкой.',
      composition: ['тюльпаны — 15 шт.', 'листья тюльпана', 'упаковка цвета шалфея'],
      keywords: 'тюльпан тюльпаны весна персиковый белый',
      price: 9500, popularity: 84, added: 20260402, badge: '', stock: 'in',
      art: { seed: 'spring', flowers: [{ t: 'tulip', c: ['peach', 'white'], n: 9 }], greens: ['leaf'], holder: 'wrap', wrap: 'sage', bg: '#f3ece2' }
    },
    {
      id: 'sunny', name: 'Sunny', category: 'tulips', occasions: ['birthday', 'just'],
      short: 'Жёлтые тюльпаны и хризантемы',
      description: 'Солнечный букет, который поднимает настроение с первого взгляда. Отличный повод улыбнуться.',
      composition: ['жёлтые тюльпаны — 11 шт.', 'хризантемы', 'зелень', 'крафт'],
      keywords: 'тюльпан тюльпаны жёлтый солнце хризантемы',
      price: 8900, popularity: 80, added: 20251005, badge: '', stock: 'in',
      art: { seed: 'sunny', flowers: [{ t: 'tulip', c: 'yellow', n: 6 }, { t: 'chrysanthemum', c: 'cream', n: 3 }], greens: ['leaf', 'fern'], holder: 'wrap', wrap: 'kraft', bg: '#f4ecd9' }
    },
    {
      id: 'cloud', name: 'Cloud', category: 'peonies', occasions: ['love'],
      short: 'Белые пионы и гипсофила',
      description: 'Невесомое облако из белоснежных пионов и гипсофилы. Выглядит как свадебный букет и дарит ощущение праздника.',
      composition: ['белые пионы — 11 шт.', 'гипсофила', 'эвкалипт', 'белая упаковка'],
      keywords: 'пион пионы белый облако гипсофила',
      price: 24900, popularity: 86, added: 20260605, badge: 'Новинка', stock: 'order',
      art: { seed: 'cloud', flowers: [{ t: 'peony', c: 'white', n: 6 }, { t: 'bud', c: 'white', n: 2 }], greens: ['gyps', 'euc', 'leaf'], holder: 'wrap', wrap: 'white', bg: '#ebe7e0' }
    },
    {
      id: 'lavender-mood', name: 'Lavender Mood', category: 'author', occasions: ['date', 'just'],
      short: 'Лиловые эустомы и альстромерии',
      description: 'Авторская работа наших флористов в сиреневой гамме. Нежно, современно и немного неожиданно.',
      composition: ['эустомы — 7 шт.', 'альстромерии — 5 шт.', 'эвкалипт', 'упаковка'],
      keywords: 'эустома лиловый сиреневый альстромерия авторский',
      price: 16500, popularity: 82, added: 20260420, badge: '', stock: 'in',
      art: { seed: 'lavender', flowers: [{ t: 'eustoma', c: 'lilac', n: 6 }, { t: 'alstroemeria', c: 'white', n: 3 }], greens: ['euc', 'leaf'], holder: 'wrap', wrap: 'white', bg: '#ece6ec' }
    },
    {
      id: 'aurora', name: 'Aurora', category: 'compositions', occasions: ['birthday', 'love'],
      short: 'Композиция в керамической вазе',
      description: 'Готовая композиция в дизайнерской вазе — не нужно искать, куда поставить цветы. Персиковые розы, эустомы и пионы.',
      composition: ['персиковые розы — 7 шт.', 'эустомы — 5 шт.', 'пионы — 3 шт.', 'керамическая ваза'],
      keywords: 'композиция ваза роза розы персиковый эустома пион',
      price: 27500, popularity: 85, added: 20260615, badge: 'Новинка', stock: 'order',
      art: { seed: 'aurora', flowers: [{ t: 'rose', c: 'peach', n: 4 }, { t: 'eustoma', c: 'white', n: 3 }, { t: 'peony', c: 'blush', n: 2 }], greens: ['euc', 'leaf'], holder: 'ceramic', vaseColor: '#f4eee6', bg: '#eadfd2' }
    },
    {
      id: 'meadow-box', name: 'Meadow Box', category: 'compositions', occasions: ['just', 'birthday'],
      short: 'Полевые цветы в шляпной коробке',
      description: 'Шляпная коробка с летним миксом — удобно дарить и легко ухаживать: цветы стоят во флористической губке.',
      composition: ['ромашки', 'эустомы', 'хризантемы', 'гипсофила', 'шляпная коробка'],
      keywords: 'коробка полевые ромашки эустома композиция',
      price: 15500, popularity: 79, added: 20251201, badge: '', stock: 'in',
      art: { seed: 'meadow', flowers: [{ t: 'daisy', c: 'white', n: 5 }, { t: 'eustoma', c: 'lilac', n: 3 }, { t: 'chrysanthemum', c: 'yellow', n: 2 }], greens: ['euc', 'gyps'], holder: 'box', bg: '#f1ebe3' }
    },
    {
      id: 'confetti', name: 'Confetti', category: 'author', occasions: ['birthday'],
      short: 'Разноцветные кустовые хризантемы',
      description: 'Яркий, но не кричащий: разноцветные хризантемы в пастельной гамме. Стоят до двух недель.',
      composition: ['кустовые хризантемы — 7 веток', 'альстромерии', 'зелень', 'крафт'],
      keywords: 'хризантемы разноцветный яркий праздник',
      price: 9900, popularity: 76, added: 20250910, badge: '', stock: 'in',
      art: { seed: 'confetti', flowers: [{ t: 'chrysanthemum', c: ['peach', 'lilac', 'yellow', 'blush'], n: 8 }, { t: 'alstroemeria', c: 'coral', n: 2 }], greens: ['leaf'], holder: 'wrap', wrap: 'kraft', bg: '#f2e8dc' }
    },
    {
      id: 'pure', name: 'Pure', category: 'tulips', occasions: ['date', 'just'],
      short: 'Белые тюльпаны',
      description: 'Лаконичный монобукет из белых тюльпанов. Чистые линии и спокойствие — для тех, кто ценит минимализм.',
      composition: ['белые тюльпаны — 25 шт.', 'белая упаковка', 'лента'],
      keywords: 'тюльпан тюльпаны белый минимализм',
      price: 13500, popularity: 81, added: 20260301, badge: '', stock: 'in',
      art: { seed: 'pure', flowers: [{ t: 'tulip', c: 'white', n: 11 }], greens: ['leaf'], holder: 'wrap', wrap: 'white', bg: '#e8e6df' }
    },
    {
      id: 'grand-amour', name: 'Grand Amour', category: 'roses', occasions: ['love'],
      short: '51 красная роза',
      description: 'Большой жест для особенного момента. 51 роза премиум-класса высотой 60 см.',
      composition: ['красные розы — 51 шт.', 'дизайнерская упаковка', 'атласная лента'],
      keywords: 'роза розы красный большой 51',
      price: 45900, popularity: 89, added: 20251020, badge: 'Хит', stock: 'order',
      art: { seed: 'grand', flowers: [{ t: 'rose', c: 'red', n: 22, s: 0.85 }], greens: ['leaf'], holder: 'wrap', wrap: 'black', bg: '#ede3dc', spread: 1.12, ribbon: '#c9b27c' }
    }
  ];
  PRODUCTS.forEach((p) => { p.sizes = sizes(p.price); });

  const POPULAR_IDS = ['blush', 'romance', 'peony-dream', 'morning', 'wild-garden', 'velvet'];

  // Конструктор букета
  const BUILDER = {
    base: 1500,
    flowers: [
      { id: 'rose', label: 'Розы', price: 700, t: 'rose' },
      { id: 'peony', label: 'Пионы', price: 1400, t: 'peony' },
      { id: 'tulip', label: 'Тюльпаны', price: 500, t: 'tulip' },
      { id: 'eustoma', label: 'Эустомы', price: 800, t: 'eustoma' },
      { id: 'chrys', label: 'Хризантемы', price: 450, t: 'chrysanthemum' },
      { id: 'alstro', label: 'Альстромерии', price: 550, t: 'alstroemeria' }
    ],
    colors: [
      { id: 'white', label: 'Белый', swatch: '#f4ede3', pal: ['white'] },
      { id: 'pink', label: 'Розовый', swatch: '#e8adae', pal: ['pink', 'blush'] },
      { id: 'red', label: 'Красный', swatch: '#b7343f', pal: ['red'] },
      { id: 'burgundy', label: 'Бордовый', swatch: '#722032', pal: ['burgundy'] },
      { id: 'yellow', label: 'Жёлтый', swatch: '#efd48c', pal: ['yellow'] },
      { id: 'mix', label: 'Разноцветный', swatch: 'conic-gradient(#e8adae 0 25%, #efd48c 0 50%, #cdb7d8 0 75%, #f1c4a3 0)', pal: ['pink', 'yellow', 'lilac', 'peach', 'white'] }
    ],
    sizes: [
      { id: 's', label: 'Маленький', stems: 9, heads: 6, spread: 0.82 },
      { id: 'm', label: 'Средний', stems: 15, heads: 10, spread: 1 },
      { id: 'l', label: 'Большой', stems: 25, heads: 15, spread: 1.12 }
    ],
    wraps: [
      { id: 'kraft', label: 'Крафт', price: 0, swatch: '#d8b58d' },
      { id: 'white', label: 'Белая', price: 500, swatch: '#f8f4ee' },
      { id: 'pink', label: 'Розовая', price: 500, swatch: '#f2d6d2' },
      { id: 'black', label: 'Чёрная', price: 700, swatch: '#3b3937' }
    ],
    extras: [
      { id: 'card', label: 'Открытка', price: 500 },
      { id: 'ribbon', label: 'Лента', price: 300 },
      { id: 'candy', label: 'Конфеты', price: 2000 },
      { id: 'vase', label: 'Маленькая ваза', price: 3500 }
    ]
  };

  const REVIEWS = [
    { name: 'Алина', text: 'Букет оказался ещё красивее, чем на фотографии. Очень нежный и свежий!', product: 'Blush' },
    { name: 'Диана', text: 'Заказывала маме на день рождения. Доставили точно ко времени, мама была в восторге.', product: 'Peony Dream' },
    { name: 'Мадина', text: 'Очень красиво оформлено. Отдельное спасибо за открытку.', product: 'Morning' },
    { name: 'София', text: 'Теперь знаю, где буду заказывать цветы на все праздники.', product: 'Velvet' }
  ];

  const FAQ = [
    { q: 'Как долго стоят ваши букеты?', a: 'При правильном уходе — от 5 до 10 дней, в зависимости от сорта. Мы кладём в каждый заказ карточку с советами и пакетик подкормки для цветов.' },
    { q: 'Можно ли заказать букет сегодня?', a: 'Да. Заказы, оформленные до 19:00, доставляем в тот же день. Экспресс-доставка — в течение 90 минут после сборки.' },
    { q: 'Можно ли добавить открытку?', a: 'Конечно. Открытку можно выбрать в конструкторе или указать текст в комментарии к заказу — флорист подпишет её от руки.' },
    { q: 'Можно ли изменить состав букета?', a: 'Да, мы с радостью заменим цветы или оттенок. Напишите пожелание в комментарии — флорист свяжется с вами для уточнения.' },
    { q: 'Есть ли доставка ночью?', a: 'Ночная доставка доступна по предварительному заказу с 21:00 до 02:00 — от 4 000 ₸. Свяжитесь с нами заранее.' },
    { q: 'Можно ли сделать анонимный заказ?', a: 'Да. Мы не называем имя отправителя, а по желанию — не звоним получателю заранее и добавляем анонимную открытку.' }
  ];

  const INFO = {
    payment: { title: 'Оплата', text: ['Принимаем банковские карты Visa, Mastercard, а также Kaspi (перевод и Kaspi QR).', 'Можно оплатить наличными или картой курьеру при получении.', 'Для юридических лиц — оплата по счёту.'] },
    returns: { title: 'Возврат', text: ['Если букет не соответствует заказу, сообщите нам в течение 2 часов после доставки и пришлите фото.', 'Мы бесплатно заменим букет или вернём деньги в течение 3 рабочих дней.'] },
    shipping: { title: 'Условия доставки', text: ['Доставка по городу — от 1 500 ₸, экспресс — от 2 500 ₸.', 'При заказе от 25 000 ₸ доставка бесплатная.', 'Мы доставляем ежедневно с 09:00 до 21:00. Курьер предупредит о визите за 30 минут.'] },
    faq: null
  };

  global.BLOOM_DATA = { CATEGORIES, OCCASIONS, PRICE_RANGES, SIZE_INFO, PRODUCTS, POPULAR_IDS, BUILDER, REVIEWS, FAQ, INFO };
})(window);
