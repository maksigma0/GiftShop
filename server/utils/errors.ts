import { ValidationError } from '../lib/admin'

export { ValidationError }

/** Ошибки валидации отдаём клиенту как 422 с ошибками по полям, остальное пробрасываем. */
export function toHttpError(error: unknown) {
  if (error instanceof ValidationError) {
    return createError({ statusCode: 422, message: error.message, data: { fields: error.fields } })
  }
  return error
}
