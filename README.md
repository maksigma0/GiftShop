# Сладкий Мир

Сайт магазина кондитерских изделий и новогодних подарков: каталог с поиском и сортировкой, избранное, админка для товаров и категорий.

Стек: **Nuxt 4** (Vue 3 + серверный рендеринг), **SQLite** через встроенный в Node модуль `node:sqlite`. Отдельная база данных и компилируемые пакеты не нужны.

## Требования

- Node.js **22.13+** (встроенный SQLite без флагов появился в 22.13)

## Запуск локально

```bash
npm install
cp .env.example .env      # заполнить NUXT_ADMIN_PASSWORD и NUXT_SESSION_PASSWORD
npm run seed              # демо-данные (повторный запуск ничего не дублирует)
npm run dev               # http://localhost:3000, админка — /admin
npm test                  # тесты
```

## Как устроен проект

```
app/                      фронтенд (Vue)
  pages/                  страницы: файл = адрес (pages/wishlist.vue → /wishlist)
  components/             компоненты: catalog/ — витрина, site/ — шапка и подвал, admin/ — админка
  composables/            общая логика (useWishlist — избранное в cookie)
  layouts/                каркасы страниц: default — сайт, admin — админка
  middleware/admin.ts     не пускает в /admin без входа
server/                   бэкенд (Nitro)
  api/                    API: файл = эндпоинт (api/products/index.get.ts → GET /api/products)
  lib/                    вся логика работы с базой — без Nuxt, поэтому покрыта тестами
  utils/                  помощники для эндпоинтов (сессия админа, загрузка фото)
  middleware/admin.ts     закрывает /api/admin/* для неавторизованных
shared/                   код, общий для фронта и бэка (типы, форматирование цен, slug)
scripts/seed.ts           демо-данные
scripts/release.mjs       готовит папку release/ для хостинга
docs/DEPLOY.md            инструкция по выкладке на hb.by
tests/                    тесты (node --test)
server.mjs                стартовый файл для хостинга
data/                     база shop.sqlite и загруженные фото (создаётся сама, в git не попадает)
```

Деньги хранятся в копейках (`price_kop`), вес — в граммах (`weight_g`): целые числа не теряют точность.
Схема базы обновляется сама при старте — миграции в `server/lib/db.ts`, версия хранится в `PRAGMA user_version`.
Новую миграцию дописывают в конец списка, старые не меняют.

CSS-классы — BEM в camelCase: `.productCard__price`, `.wishlistButton--active`.

## Выкладка на хостинг

```bash
npm run release   # сборка + папка release/ для загрузки на хостинг
```

Пошаговая инструкция для hb.by (ISPmanager, без SSH) — в [docs/DEPLOY.md](docs/DEPLOY.md).

## Как работать с git

- Новая задача — новая ветка от свежего `main`: `git switch -c feat/product-photos`.
- Одна логическая правка — один коммит, сообщение по [Conventional Commits](https://www.conventionalcommits.org/ru/):
  `feat: add product photos to catalog`, `fix: wishlist total rounding`, `docs: update deploy guide`.
- В `main` — только через Pull Request, после того как прошли `npm test` и `npm run build`.

## Известные ограничения

- Сессия админа — зашифрованная cookie на 12 часов. «Выйти» удаляет её из браузера,
  но если cookie кто-то скопировал, она работает до истечения срока. Для одного админа это приемлемо.
- Один пароль на админку, без пользователей и прав.
