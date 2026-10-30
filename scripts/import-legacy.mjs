/**
 * Импорт товаров из старой Django-базы в текущую SQLite-базу проекта.
 *
 * Схемы разные, поэтому файл просто так скопировать нельзя:
 *   старая: catalog_category / catalog_product (price, weight — дробные)
 *   новая:  categories / products (price_kop, weight_g — целые)
 *
 * Запускать из корня проекта при остановленном dev-сервере (иначе база занята):
 *   node scripts/import-legacy.mjs
 *
 * Путь к старой базе можно переопределить: OLD_DB=... node scripts/import-legacy.mjs
 */
import { DatabaseSync } from 'node:sqlite'
import { cpSync, copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const dataDir = resolve(process.env.NUXT_DATA_DIR ?? resolve(root, 'data'))
const NEW_DB = resolve(dataDir, 'shop.sqlite')
const NEW_MEDIA = resolve(dataDir, 'media', 'products')

const oldProject = resolve(root, '..', 'giftshop old')
const OLD_DB = process.env.OLD_DB ?? resolve(oldProject, 'db.sqlite3')
const OLD_MEDIA = resolve(oldProject, 'media', 'products')

if (!existsSync(OLD_DB)) {
  console.error(`Не найдена старая база: ${OLD_DB}`)
  console.error('Укажите путь: OLD_DB="D:/путь/к/db.sqlite3" node scripts/import-legacy.mjs')
  process.exit(1)
}

if (existsSync(NEW_DB)) {
  copyFileSync(NEW_DB, `${NEW_DB}.bak`)
  console.log(`Бэкап текущей базы: ${NEW_DB}.bak`)
}

const db = new DatabaseSync(NEW_DB)
db.exec(`ATTACH '${OLD_DB.replaceAll("'", "''")}' AS old`)

db.exec('BEGIN')
try {
  db.exec('DELETE FROM products')
  db.exec('DELETE FROM categories')

  db.exec(`
    INSERT INTO categories (name, slug, description)
    SELECT name, slug, COALESCE(description, '')
    FROM old.catalog_category
  `)

  db.exec(`
    INSERT INTO products (category_id, name, slug, description, price_kop, weight_g, image, available, created_at, updated_at)
    SELECT
      (SELECT id FROM categories c WHERE c.slug = oc.slug),
      p.name,
      p.slug,
      COALESCE(p.description, ''),
      CAST(ROUND(p.price * 100) AS INTEGER),
      CAST(ROUND(p.weight * 1000) AS INTEGER),
      COALESCE(p.image, ''),
      CASE WHEN p.available THEN 1 ELSE 0 END,
      substr(p.created_at, 1, 19),
      substr(p.updated_at, 1, 19)
    FROM old.catalog_product p
    JOIN old.catalog_category oc ON oc.id = p.category_id
  `)

  db.exec('COMMIT')
}
catch (error) {
  db.exec('ROLLBACK')
  throw error
}

const categories = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n
const products = db.prepare('SELECT COUNT(*) AS n FROM products').get().n
const withImage = db.prepare(`SELECT COUNT(*) AS n FROM products WHERE image <> ''`).get().n

db.exec('DETACH old')
db.close()

console.log(`Импортировано: категорий ${categories}, товаров ${products} (с фото ${withImage})`)

if (existsSync(OLD_MEDIA)) {
  mkdirSync(NEW_MEDIA, { recursive: true })
  cpSync(OLD_MEDIA, NEW_MEDIA, { recursive: true })
  console.log(`Фото скопированы в ${NEW_MEDIA}`)
}
