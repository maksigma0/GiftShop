import { getProduct } from '../../../lib/catalog'

export default defineEventHandler((event) => {
  const product = getProduct(useDb(), parseId(getRouterParam(event, 'id')))
  if (!product) throw createError({ statusCode: 404, message: 'Товар не найден' })
  return product
})
