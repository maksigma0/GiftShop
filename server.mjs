/**
 * Стартовый файл для хостинга (ISPmanager запускает его через npm start).
 *
 * Настройки берутся из переменных окружения, заданных в панели.
 * Если рядом лежит .env — значения из него подставляются только для тех
 * переменных, которых в окружении нет. Порт (PORT) задаёт сама панель.
 */
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const envFile = resolve(root, '.env')

if (existsSync(envFile)) {
  process.loadEnvFile(envFile)
}

// Относительный NUXT_DATA_DIR считаем от папки приложения, а не от того, откуда запустил менеджер процессов
process.env.NUXT_DATA_DIR = resolve(root, process.env.NUXT_DATA_DIR ?? 'data')

// В release/ сборка лежит в build/, при локальном запуске — в .output/
const entry = existsSync(resolve(root, 'build/server/index.mjs'))
  ? './build/server/index.mjs'
  : './.output/server/index.mjs'

await import(entry)
