import type { Category, CategoryRef, Product, ProductPage, SortOrder } from '../../shared/types/shop.ts'
import type { Database } from './db.ts'

export const PAGE_SIZE = 12

interface ProductRow {
  id: number
  name: string
  slug: string
  description: string
  price_kop: number
  weight_g: number
  image: string
  available: number
  created_at: string
  updated_at: string
  category_id: number
  category_name: string
  category_slug: string
}

// Категорию берём через JOIN одним запросом, а не отдельным запросом
// на каждую карточку (в Django-версии было 12 лишних запросов на страницу).
const PRODUCT_SELECT = `
  SELECT p.id, p.name, p.slug, p.description, p.price_kop, p.weight_g, p.image,
         p.available, p.created_at, p.updated_at,
         c.id AS category_id, c.name AS category_name, c.slug AS category_slug
  FROM products p
  JOIN categories c ON c.id = p.category_id
`

const ORDER_BY: Record<SortOrder, string> = {
  '': 'p.created_at DESC, p.id DESC',
  'cheap': 'p.price_kop ASC, p.id DESC',
  'expensive': 'p.price_kop DESC, p.id DESC',
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceKop: row.price_kop,
    weightG: row.weight_g,
    imageUrl: row.image ? `/media/${row.image}` : '',
    available: row.available === 1,
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function listCategories(db: Database): Category[] {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.slug, c.description,
           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
    FROM categories c
    ORDER BY c.name
  `).all() as Array<CategoryRef & { description: string, product_count: number }>

  return rows.map(({ product_count, ...rest }) => ({ ...rest, productCount: product_count }))
}

export function getCategoryBySlug(db: Database, slug: string): CategoryRef | undefined {
  return db.prepare('SELECT id, name, slug FROM categories WHERE slug = ?').get(slug) as CategoryRef | undefined
}

export interface ProductFilter {
  categoryId?: number
  query?: string
  available?: boolean
  sort?: SortOrder
  page?: number
  pageSize?: number
}

export function listProducts(db: Database, filter: ProductFilter = {}): ProductPage {
  const where: string[] = []
  const params: Array<string | number> = []

  if (filter.categoryId !== undefined) {
    where.push('p.category_id = ?')
    params.push(filter.categoryId)
  }
  if (filter.query) {
    where.push('instr(lower_ru(p.name), ?) > 0')
    params.push(filter.query.toLowerCase())
  }
  if (filter.available !== undefined) {
    where.push('p.available = ?')
    params.push(filter.available ? 1 : 0)
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM products p ${whereSql}`).get(...params) as { total: number }

  const pageSize = filter.pageSize ?? PAGE_SIZE
  const pages = Math.max(1, Math.ceil(total / pageSize))
  // Как paginator.get_page в Django: мусор → первая страница, слишком большая → последняя.
  const requested = Number.isInteger(filter.page) && filter.page! > 0 ? filter.page! : 1
  const page = Math.min(requested, pages)

  const rows = db.prepare(`
    ${PRODUCT_SELECT}
    ${whereSql}
    ORDER BY ${ORDER_BY[filter.sort ?? '']}
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as unknown as ProductRow[]

  return { items: rows.map(toProduct), total, page, pages }
}

export function getProduct(db: Database, id: number): Product | undefined {
  const row = db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as ProductRow | undefined
  return row && toProduct(row)
}

/** Товары в порядке переданных id; несуществующие id пропускаются. */
export function getProductsByIds(db: Database, ids: number[]): Product[] {
  if (!ids.length) return []

  const placeholders = ids.map(() => '?').join(', ')
  const rows = db.prepare(`${PRODUCT_SELECT} WHERE p.id IN (${placeholders})`).all(...ids) as unknown as ProductRow[]
  const byId = new Map(rows.map(row => [row.id, toProduct(row)]))

  return ids.flatMap(id => byId.get(id) ?? [])
}
