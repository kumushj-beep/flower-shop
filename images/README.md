# Фотографии BLOOM

Сайт берёт все фото из этой папки. Если файла ещё нет, на его месте показывается аккуратный плейсхолдер с названием и путём к файлу. Как только вы положите фото с нужным именем, оно появится на сайте само, код трогать не нужно.

Проверить, каких файлов не хватает:

```bash
node tools/check-images.js
```

## Требования к фото

- **Формат:** JPG (или WebP, но тогда поменяйте расширение в `js/data.js`).
- **Пропорции:** вертикальные **4:5**, минимум **1200 × 1500 px**. Для поводов: **3:4**, минимум 900 × 1200 px.
- **Вес:** до 300–400 КБ (сжать можно на squoosh.app).
- **Единый стиль всех снимков**, чтобы каталог выглядел как у одного бренда:
  - светлый однотонный фон: молочный, кремовый, бежевый или тёплый серый;
  - мягкий естественный дневной свет сбоку, без вспышки и жёстких теней;
  - букет по центру, целиком в кадре, немного воздуха сверху и снизу;
  - без текста, водяных знаков, рук и лишних предметов (кроме блоков «О нас» и поводов).

Фото обрезается по центру (`object-fit: cover`), поэтому главное держите в центральной части кадра.

## Товары: `images/products/`

| Файл | Товар | Что должно быть на фото | Тип |
|---|---|---|---|
| `blush.jpg` | Blush, 12 900 ₸ | 15 нежно-розовых роз (Pink Mondial) с веточками эвкалипта, молочная матовая бумага, атласная лента | розовые розы |
| `romance.jpg` | Romance, 18 500 ₸ | 21 красная роза, классический круглый букет, чёрная матовая бумага | красные розы |
| `peony-dream.jpg` | Peony Dream, 22 900 ₸ | 9 пышных пудрово-розовых пионов с сезонной зеленью и эвкалиптом, крафтовая бумага | пионы |
| `morning.jpg` | Morning, 14 500 ₸ | белые розы и кремовые альстромерии с гипсофилой в прозрачной стеклянной вазе | белые розы |
| `wild-garden.jpg` | Wild Garden, 11 900 ₸ | полевой букет: ромашки, сиреневые кустовые хризантемы, пара жёлтых тюльпанов, папоротник, крафт | ромашки |
| `velvet.jpg` | Velvet, 19 900 ₸ | 17 тёмно-бордовых роз (Black Baccara / Red Naomi) с эвкалиптом, пудровая бумага | премиальный |
| `spring-kiss.jpg` | Spring Kiss, 9 500 ₸ | 15 персиковых и белых тюльпанов, бумага цвета шалфея | тюльпаны |
| `sunny.jpg` | Sunny, 8 900 ₸ | жёлтые тюльпаны с кремовыми хризантемами и зеленью, крафт | тюльпаны |
| `cloud.jpg` | Cloud, 24 900 ₸ | белые пионы с облаком гипсофилы и эвкалиптом, белая бумага | пионы |
| `lavender-mood.jpg` | Lavender Mood, 16 500 ₸ | лиловые эустомы и белые альстромерии с эвкалиптом, белая бумага | смешанный |
| `aurora.jpg` | Aurora, 27 500 ₸ | композиция в светлой керамической вазе: персиковые розы, белые эустомы, розовые пионы | премиальный |
| `meadow-box.jpg` | Meadow Box, 15 500 ₸ | молочная шляпная коробка с ромашками, эустомами, жёлтыми хризантемами и гипсофилой | ромашки |
| `confetti.jpg` | Confetti, 9 900 ₸ | разноцветные кустовые хризантемы (персиковые, лиловые, жёлтые) и коралловые альстромерии, крафт | смешанный |
| `pure.jpg` | Pure, 13 500 ₸ | 25 белых тюльпанов, белая бумага, тонкая лента | тюльпаны |
| `grand-amour.jpg` | Grand Amour, 45 900 ₸ | 51 красная роза, большой пышный букет, чёрная дизайнерская упаковка, золотистая лента | премиальный |

## Остальные блоки

| Файл | Где на сайте | Что должно быть на фото |
|---|---|---|
| `hero.jpg` | первый экран (4:5) | роскошный букет из пионов и роз в светлой керамической вазе на кремовом фоне, мягкий утренний свет |
| `about-florist.jpg` | «О нас» (4:5) | флорист собирает букет на деревянном столе в светлой мастерской: руки, ножницы, ленты, цветы |
| `occasions/love.jpg` | «Для любимой» (3:4) | нежный букет из розовых роз и пионов |
| `occasions/birthday.jpg` | «День рождения» (3:4) | яркий праздничный букет: персиковые, жёлтые и коралловые цветы |
| `occasions/date.jpg` | «Свидание» (3:4) | красные розы на столе вечером, тёплый свет |
| `occasions/just.jpg` | «Просто так» (3:4) | тюльпаны и ромашки в простой вазе у окна |

Снизу карточек поводов лежит тёмная подложка под текст, поэтому нижняя треть этих фото может быть спокойной.

## Конструктор: `images/builder/`

Превью меняется при выборе цветка. Обязательно нужны 6 файлов (4:5):

`rose.jpg`, `peony.jpg`, `tulip.jpg`, `eustoma.jpg`, `chrys.jpg` (хризантемы), `alstro.jpg` (альстромерии).

По желанию можно добавить фото для каждого оттенка: `<цветок>-<цвет>.jpg`, где цвет — `white`, `pink`, `red`, `burgundy`, `yellow` или `mix`. Например `rose-red.jpg` или `tulip-yellow.jpg`. Если такого файла нет, сайт покажет общее фото цветка.

## Где взять фото

1. **Свои снимки** — лучший вариант для настоящего магазина: покупатель видит именно то, что получит.
2. **Бесплатные стоки** (разрешено коммерческое использование): [Unsplash](https://unsplash.com/s/photos/flower-bouquet) и [Pexels](https://www.pexels.com/search/flower%20bouquet/). Готовые запросы:
   - розовые розы: [Unsplash](https://unsplash.com/s/photos/pink-roses-bouquet) · [Pexels](https://www.pexels.com/search/pink%20roses%20bouquet/)
   - красные розы: [Unsplash](https://unsplash.com/s/photos/red-roses-bouquet) · [Pexels](https://www.pexels.com/search/red%20roses%20bouquet/)
   - белые розы: [Unsplash](https://unsplash.com/s/photos/white-roses-vase) · [Pexels](https://www.pexels.com/search/white%20roses%20vase/)
   - пионы: [Unsplash](https://unsplash.com/s/photos/peony-bouquet) · [Pexels](https://www.pexels.com/search/peony%20bouquet/)
   - тюльпаны: [Unsplash](https://unsplash.com/s/photos/tulip-bouquet) · [Pexels](https://www.pexels.com/search/tulip%20bouquet/)
   - ромашки / полевые: [Unsplash](https://unsplash.com/s/photos/wildflower-bouquet) · [Pexels](https://www.pexels.com/search/daisy%20bouquet/)
   - смешанные: [Unsplash](https://unsplash.com/s/photos/mixed-flower-bouquet) · [Pexels](https://www.pexels.com/search/mixed%20flowers%20bouquet/)
   - премиальные / в коробке: [Unsplash](https://unsplash.com/s/photos/luxury-flower-bouquet) · [Pexels](https://www.pexels.com/search/flower%20box/)
3. **Генерация нейросетью** (Midjourney, DALL·E, Flux и т. п.). Шаблон промпта, в котором меняется только описание букета из таблицы:

   > Professional product photo of a florist bouquet: **[описание букета на английском]**, wrapped in realistic matte paper with a satin ribbon, centered, soft natural window daylight from the side, plain warm cream background, shallow depth of field, high-end flower shop catalog, photorealistic, vertical 4:5

   Пример для `blush.jpg`: *fifteen soft pink Pink Mondial roses with eucalyptus sprigs, wrapped in milky white matte paper*.

## Как указать другой путь или ссылку

Путь к фото задаётся в `js/data.js`:

- у товара это поле `image`;
- для остальных блоков — объект `PHOTOS`.

Туда можно вписать и прямую ссылку на изображение, например `image: 'https://…/photo.jpg'`.
