import type { WishlistResponse } from '#shared/types/shop'
import { getProductsByIds } from '../../lib/catalog'

/**
 * Избранное хранится в cookie браузера (как сессия в Django-версии).
 * Сервер только отдаёт по этим id актуальные товары и выкидывает удалённые.
 */
export default defineEventHandler((event): WishlistResponse => {
  const products = getProductsByIds(useDb(), readWishlistCookie(event))
  return {
    ids: products.map(product => product.id),
    products,
    totalKop: products.reduce((sum, product) => sum + product.priceKop, 0),
  }
})
