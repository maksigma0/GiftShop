import { deleteProduct, getProductImage } from '../../../lib/admin'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const id = parseId(getRouterParam(event, 'id'))
  const image = getProductImage(db, id)
  if (image === undefined || !deleteProduct(db, id)) {
    throw createError({ statusCode: 404, message: 'Товар не найден' })
  }
  await deleteMediaFile(image)
  return { ok: true }
})
