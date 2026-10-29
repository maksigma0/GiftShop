import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export const MEDIA_CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export function mediaRoot() {
  return resolve(useRuntimeConfig().dataDir, 'media')
}

/** Абсолютный путь к файлу внутри media/. Попытки выйти наружу (../) → undefined. */
export function resolveMediaPath(relative: string) {
  const root = mediaRoot()
  const full = resolve(root, relative)
  return full.startsWith(root + sep) ? full : undefined
}

/** Сохраняет картинку в media/products/ГГГГ/ММ/ и возвращает путь относительно media/. */
export async function saveProductImage(file: { data: Buffer, type?: string }) {
  const ext = file.type ? IMAGE_TYPES[file.type] : undefined
  if (!ext) {
    throw new ValidationError({ image: 'Нужна картинка JPG, PNG, WEBP или GIF' })
  }
  if (file.data.length > MAX_IMAGE_BYTES) {
    throw new ValidationError({ image: 'Картинка больше 5 МБ' })
  }

  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const relative = `products/${now.getFullYear()}/${month}/${randomUUID()}.${ext}`
  const full = resolveMediaPath(relative)!

  await mkdir(dirname(full), { recursive: true })
  await writeFile(full, file.data)
  return relative
}

export async function deleteMediaFile(relative: string) {
  const full = relative && resolveMediaPath(relative)
  if (full) {
    await unlink(full).catch(() => {})
  }
}
