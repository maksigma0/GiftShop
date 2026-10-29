import { listProducts } from '../../../lib/catalog'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const categoryId = Number(query.category)

  return listProducts(useDb(), {
    categoryId: Number.isSafeInteger(categoryId) && categoryId > 0 ? categoryId : undefined,
    query: typeof query.q === 'string' ? query.q.trim() : '',
    available: query.available === 'yes' ? true : query.available === 'no' ? false : undefined,
    page: Number(query.page) || 1,
    pageSize: 50,
  })
})
