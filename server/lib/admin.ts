import { parsePriceToKop, parseWeightToGrams } from '../../shared/utils/format.ts'
import { SLUG_PATTERN, slugify } from '../../shared/utils/slugify.ts'
import type { Database } from './db.ts'

/** Ошибки по полям формы: { slug: 'Такой URL уже занят' } */
export class ValidationError extends Error {
  fields: Record<string, string>

  constructor(fields: Record<string, string>) {
    super('Проверьте поля формы')
    this.fields = fields
  }
}

type Raw = Record<string, unknown>

function text(raw: Raw, key: string) {
  const value = raw[key]
  return typeof value === 'string' ? value.trim() : ''
}

function slugTaken(db: Database, table: 'categories' | 'products', slug: string, exceptId?: number) {
  const row = db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`).get(slug, exceptId ?? 0)
  return row !== undefined
}

/* ===================== Категории ===================== */

export interface CategoryInput {
  name: string
  slug: string
  description: string
}

export function validateCategory(db: Database, raw: Raw, exceptId?: number): CategoryInput {
  const errors: Record<string, string> = {}
  const name = text(raw, 'name')
  const slug = text(raw, 'slug') || slugify(name)

  if (!name) errors.name = 'Укажите название'
  else if (name.length > 100) errors.name = 'Не длиннее 100 символов'

  if (!SLUG_PATTERN.test(slug)) errors.slug = 'Только латиница, цифры и дефисы'
  else if (slugTaken(db, 'categories', slug, exceptId)) errors.slug = 'Такой URL уже занят'

  if (Object.keys(errors).length) throw new ValidationError(errors)
  return { name, slug, description: text(raw, 'description') }
}

export function createCategory(db: Database, input: CategoryInput) {
  const result = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)')
    .run(input.name, input.slug, input.description)
  return Number(result.lastInsertRowid)
}

export function updateCategory(db: Database, id: number, input: CategoryInput) {
  const result = db.prepare(`
    UPDATE categories SET name = ?, slug = ?, description = ?, updated_at = datetime('now') WHERE id = ?
  `).run(input.name, input.slug, input.description, id)
  return result.changes > 0
}

/** Удаляет категорию вместе с товарами (ON DELETE CASCADE). Возвращает картинки удалённых товаров. */
export function deleteCategory(db: Database, id: number) {
  const images = (db.prepare(`SELECT image FROM products WHERE category_id = ? AND image != ''`).all(id) as Array<{ image: string }>)
    .map(row => row.image)
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  return { deleted: result.changes > 0, images }
}

export function getCategory(db: Database, id: number) {
  return db.prepare('SELECT id, name, slug, description FROM categories WHERE id = ?').get(id) as CategoryInput & { id: number } | undefined
}

/* ===================== Товары ===================== */

export interface ProductInput {
  categoryId: number
  name: string
  slug: string
  description: string
  priceKop: number
  weightG: number
  available: boolean
}

export function validateProduct(db: Database, raw: Raw, exceptId?: number): ProductInput {
  const errors: Record<string, string> = {}
  const name = text(raw, 'name')
  const slug = text(raw, 'slug') || slugify(name)
  const categoryId = Number(text(raw, 'categoryId'))
  const priceKop = parsePriceToKop(text(raw, 'price'))
  const weightG = parseWeightToGrams(text(raw, 'weight'))

  if (!name) errors.name = 'Укажите название'
  else if (name.length > 200) errors.name = 'Не длиннее 200 символов'

  if (!SLUG_PATTERN.test(slug)) errors.slug = 'Только латиница, цифры и дефисы'
  else if (slugTaken(db, 'products', slug, exceptId)) errors.slug = 'Такой URL уже занят'

  if (!Number.isInteger(categoryId) || !db.prepare('SELECT 1 FROM categories WHERE id = ?').get(categoryId)) {
    errors.categoryId = 'Выберите категорию'
  }
  if (priceKop === null) errors.price = 'Цена в формате 15,40'
  if (weightG === null) errors.weight = 'Вес в килограммах, например 0,45'

  if (Object.keys(errors).length) throw new ValidationError(errors)
  return {
    categoryId,
    name,
    slug,
    description: text(raw, 'description'),
    priceKop: priceKop!,
    weightG: weightG!,
    available: raw.available === true || raw.available === 'true' || raw.available === 'on',
  }
}

export function createProduct(db: Database, input: ProductInput, image: string) {
  const result = db.prepare(`
    INSERT INTO products (category_id, name, slug, description, price_kop, weight_g, available, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(input.categoryId, input.name, input.slug, input.description, input.priceKop, input.weightG, input.available ? 1 : 0, image)
  return Number(result.lastInsertRowid)
}

export function updateProduct(db: Database, id: number, input: ProductInput, image: string) {
  const result = db.prepare(`
    UPDATE products
    SET category_id = ?, name = ?, slug = ?, description = ?, price_kop = ?, weight_g = ?,
        available = ?, image = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(input.categoryId, input.name, input.slug, input.description, input.priceKop, input.weightG, input.available ? 1 : 0, image, id)
  return result.changes > 0
}

export function getProductImage(db: Database, id: number) {
  const row = db.prepare('SELECT image FROM products WHERE id = ?').get(id) as { image: string } | undefined
  return row?.image
}

export function deleteProduct(db: Database, id: number) {
  return db.prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0
}

/** Массовое «В наличии / Нет в наличии». Возвращает число изменённых товаров. */
export function setAvailability(db: Database, ids: number[], available: boolean) {
  if (!ids.length) return 0
  const placeholders = ids.map(() => '?').join(', ')
  const result = db.prepare(`
    UPDATE products SET available = ?, updated_at = datetime('now') WHERE id IN (${placeholders})
  `).run(available ? 1 : 0, ...ids)
  return Number(result.changes)
}
