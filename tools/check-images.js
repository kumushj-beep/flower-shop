#!/usr/bin/env node
/* Показывает, каких фотографий не хватает в папке images/.
   Запуск из корня проекта: node tools/check-images.js */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'), sandbox);
const D = sandbox.window.BLOOM_DATA;

const required = [
  ...D.PRODUCTS.map((p) => [p.image, `товар «${p.name}»`]),
  [D.PHOTOS.hero, 'первый экран'],
  [D.PHOTOS.about, 'блок «О нас»'],
  ...Object.entries(D.PHOTOS.occasions).map(([id, src]) => [src, `повод ${D.OCCASIONS[id]}`]),
  ...D.BUILDER.flowers.map((f) => [D.PHOTOS.builder(f.id, '').fallback, `конструктор: ${f.label}`])
];

let missing = 0;
for (const [src, label] of required) {
  if (/^https?:\/\//.test(src)) { console.log(`  🌐 ${src}  (${label}, внешняя ссылка)`); continue; }
  const ok = fs.existsSync(path.join(root, src));
  if (!ok) missing++;
  console.log(`  ${ok ? '✓' : '✗'} ${src}  (${label})`);
}
console.log(missing ? `\nНе хватает фото: ${missing} из ${required.length}. Подробности — images/README.md` : '\nВсе фото на месте 🌸');
process.exitCode = missing ? 1 : 0;
