import type { SortOrder } from '#shared/types/shop'
import { getCategoryBySlug, listProducts } from '../../lib/catalog'

const SORTS: SortOrder[] = ['', 'cheap', 'expensive']

export default defineEventHandler((event) => {
  const db = useDb()
  const query = getQuery(event)

  const categorySlug = typeof query.category === 'string' ? query.category : ''
  const category = categorySlug ? getCategoryBySlug(db, categorySlug) : undefined
  if (categorySlug && !category) {
    throw createError({ statusCode: 404, message: 'Категория не найдена' })
  }

  const sort = SORTS.includes(query.sort as SortOrder) ? query.sort as SortOrder : ''
  const search = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''

  return {
    category: category ?? null,
    ...listProducts(db, {
      categoryId: category?.id,
      query: search,
      sort,
      page: Number(query.page) || 1,
    }),
  }
})
