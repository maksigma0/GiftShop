import { deleteCategory } from '../../../lib/admin'

export default defineEventHandler(async (event) => {
  const { deleted, images } = deleteCategory(useDb(), parseId(getRouterParam(event, 'id')))
  if (!deleted) throw createError({ statusCode: 404, message: 'Категория не найдена' })
  await Promise.all(images.map(deleteMediaFile))
  return { ok: true }
})
