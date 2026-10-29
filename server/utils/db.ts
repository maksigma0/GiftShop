import { resolve } from 'node:path'
import { openDatabase, type Database } from '../lib/db'

let db: Database | undefined

/** Одно соединение на весь процесс: SQLite синхронный, пул не нужен. */
export function useDb() {
  db ??= openDatabase(resolve(useRuntimeConfig().dataDir, 'shop.sqlite'))
  return db
}

/** id из URL или тела запроса: только положительное целое, иначе 400. */
export function parseId(value: unknown) {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'Некорректный id' })
  }
  return id
}
