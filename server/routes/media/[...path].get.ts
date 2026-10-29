import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname } from 'node:path'

/** Отдаёт загруженные через админку картинки из data/media/. */
export default defineEventHandler(async (event) => {
  const relative = getRouterParam(event, 'path') ?? ''
  const full = resolveMediaPath(relative)
  const contentType = MEDIA_CONTENT_TYPES[extname(relative).slice(1).toLowerCase()]

  const info = full && contentType ? await stat(full).catch(() => undefined) : undefined
  if (!full || !info?.isFile()) {
    throw createError({ statusCode: 404, message: 'Файл не найден' })
  }

  setResponseHeaders(event, {
    'Content-Type': contentType!,
    'Content-Length': String(info.size),
    // Имена файлов уникальные (uuid), поэтому можно кешировать надолго
    'Cache-Control': 'public, max-age=31536000, immutable',
  })
  return sendStream(event, createReadStream(full))
})
