import { updateCategory, validateCategory } from '../../../lib/admin'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const id = parseId(getRouterParam(event, 'id'))
  try {
    const input = validateCategory(db, await readBody(event) ?? {}, id)
    if (!updateCategory(db, id, input)) throw createError({ statusCode: 404, message: 'Категория не найдена' })
    return { id }
  }
  catch (error) {
    throw toHttpError(error)
  }
})
