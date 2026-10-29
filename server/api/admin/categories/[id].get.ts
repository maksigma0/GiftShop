import { getCategory } from '../../../lib/admin'

export default defineEventHandler((event) => {
  const category = getCategory(useDb(), parseId(getRouterParam(event, 'id')))
  if (!category) throw createError({ statusCode: 404, message: 'Категория не найдена' })
  return category
})
