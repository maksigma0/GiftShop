import { setAvailability } from '../../../lib/admin'

/** Массовое действие: { ids: [1, 2], available: true } */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ ids?: unknown, available?: unknown }>(event)
  if (!Array.isArray(body?.ids) || typeof body.available !== 'boolean') {
    throw createError({ statusCode: 400, message: 'Ожидается { ids: number[], available: boolean }' })
  }
  const ids = body.ids.map(parseId)
  return { updated: setAvailability(useDb(), ids, body.available) }
})
