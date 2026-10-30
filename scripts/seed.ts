/**
 * Демо-данные каталога. Повторный запуск ничего не дублирует.
 * Запуск: npm run seed
 */
import { resolve } from 'node:path'
import { openDatabase } from '../server/lib/db.ts'

const CATEGORIES = [
  ['Кондитерские изделия', 'konditerskie-izdeliya', 'Печенье, конфеты и другие сладости.'],
  ['Новогодние подарки', 'novogodnie-podarki', 'Готовые подарочные наборы в праздничной упаковке.'],
] as const

// [категория, название, slug, цена в копейках, вес в граммах, в наличии, описание]
const PRODUCTS = [
  ['konditerskie-izdeliya', 'Печенье «Новогоднее» с имбирём', 'pechene-novogodnee', 960, 300, true,
    'Пряное имбирное печенье в форме ёлочек и снежинок. 300 г.'],
  ['konditerskie-izdeliya', 'Конфеты шоколадные «Ассорти»', 'konfety-assorti', 1280, 500, true,
    'Набор шоколадных конфет ручной работы. Коробка 500 г.'],
  ['novogodnie-podarki', 'Подарочный набор «Сладкая сказка»', 'podarochnyj-nabor-sladkaya-skazka', 3990, 1200, true,
    'Пряники, конфеты и печенье в праздничной упаковке. Отличный подарок детям.'],
  ['novogodnie-podarki', 'Пряники новогодние расписные', 'pryaniki-novogodnie', 1540, 600, false,
    'Ручная роспись глазурью. Партия распродана — ждём новую к выходным.'],
] as const

const db = openDatabase(resolve(process.env.NUXT_DATA_DIR ?? './data', 'shop.sqlite'))

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)')
for (const [name, slug, description] of CATEGORIES) {
  insertCategory.run(name, slug, description)
}

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (category_id, name, slug, price_kop, weight_g, available, description, created_at)
  VALUES ((SELECT id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?, ?, datetime('now', ?))
`)
PRODUCTS.forEach(([categorySlug, name, slug, priceKop, weightG, available, description], index) => {
  // Сдвиг по секундам сохраняет порядок «новые сверху», как в Django-версии
  insertProduct.run(categorySlug, name, slug, priceKop, weightG, available ? 1 : 0, description, `+${index} seconds`)
})

const count = (sql: string) => (db.prepare(sql).get() as { n: number }).n
console.log(`Категорий: ${count('SELECT COUNT(*) AS n FROM categories')}`)
console.log(`Товаров: ${count('SELECT COUNT(*) AS n FROM products')}`)
console.log(`В наличии: ${count('SELECT COUNT(*) AS n FROM products WHERE available = 1')}`)
console.log(`Нет в наличии: ${count('SELECT COUNT(*) AS n FROM products WHERE available = 0')}`)
