/**
 * Демо-данные каталога. Повторный запуск ничего не дублирует.
 * Запуск: npm run seed
 */
import { resolve } from 'node:path'
import { openDatabase } from '../server/lib/db.ts'

const CATEGORIES = [
  ['Сыры', 'syry', 'Только свежие сыры от проверенных ферм.'],
  ['Колбасы и деликатесы', 'kolbasy', 'Колбасы и мясные деликатесы к праздничному столу.'],
  ['Молочная продукция', 'molochnaya-produkciya', 'Фермерское молоко, сметана и масло.'],
  ['Печенье и сладости', 'pechene-i-sladosti', 'Печенье, конфеты и пряники ручной работы.'],
  ['Новогодние подарки', 'novogodnie-podarki', 'Готовые подарочные наборы в праздничной упаковке.'],
] as const

// [категория, название, slug, цена в копейках, вес в граммах, в наличии, описание]
const PRODUCTS = [
  ['syry', 'Сыр «Гауда» выдержанный', 'gauda-vyderzhannyj', 2450, 900, true,
    'Классический голландский сыр с плотной текстурой и ореховым вкусом. Выдержка 12 месяцев.'],
  ['syry', 'Сыр «Бри» с белой плесенью', 'bri-s-beloj-plesenyu', 1890, 450, true,
    'Нежный французский сыр с бархатной белой корочкой и сливочным вкусом.'],
  ['kolbasy', 'Салями сырокопчёная «Пикантная»', 'salyami-pikantnaya', 2240, 500, true,
    'Сырокопчёная колбаса из отборной говядины с пряностями. Идеальна к праздничному столу.'],
  ['kolbasy', 'Колбаса варёная «Докторская»', 'doktorskaya', 1420, 400, false,
    'Нежная варёная колбаса по классическому рецепту. Ожидаем поступление на этой неделе.'],
  ['molochnaya-produkciya', 'Молоко «Деревенское» 3,2%', 'moloko-derevenskoe', 280, 1000, true,
    'Цельное молоко от фермерских хозяйств. Объём 1 литр.'],
  ['molochnaya-produkciya', 'Сметана 20% «Домашняя»', 'smetana-domashnyaya', 350, 350, true,
    'Густая фермерская сметана. Баночка 350 г.'],
  ['molochnaya-produkciya', 'Масло сливочное 82,5%', 'maslo-slivochnoe', 790, 200, true,
    'Натуральное сливочное масло высшего сорта. Пачка 200 г.'],
  ['pechene-i-sladosti', 'Печенье «Новогоднее» с имбирём', 'pechene-novogodnee', 960, 300, true,
    'Пряное имбирное печенье в форме ёлочек и снежинок. 300 г.'],
  ['pechene-i-sladosti', 'Конфеты шоколадные «Ассорти»', 'konfety-assorti', 1280, 500, true,
    'Набор шоколадных конфет ручной работы. Коробка 500 г.'],
  ['novogodnie-podarki', 'Подарочный набор «Сырное ассорти»', 'podarochnyj-nabor-syrnoe-assorti', 4500, 1800, true,
    'Красиво упакованный набор из четырёх видов сыра с грецкими орехами и мёдом.'],
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
