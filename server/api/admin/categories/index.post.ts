import { createCategory, validateCategory } from '../../../lib/admin'

export default defineEventHandler(async (event) => {
  const db = useDb()
  try {
    const input = validateCategory(db, await readBody(event) ?? {})
    return { id: createCategory(db, input) }
  }
  catch (error) {
    throw toHttpError(error)
  }
})
