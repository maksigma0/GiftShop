/**
 * Собирает папку release/ для загрузки на хостинг:
 *   release/build/       — собранный сайт (копия .output без точки в имени,
 *                          чтобы файловые менеджеры не прятали её)
 *   release/server.mjs   — стартовый файл
 *   release/package.json — без зависимостей: ISPmanager запускает npm install,
 *                          и ставить ему ничего не нужно
 *
 * Запуск: npm run release
 */
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, '.output')
const release = resolve(root, 'release')

if (!existsSync(resolve(output, 'server/index.mjs'))) {
  console.error('Нет сборки в .output/ — сначала выполните npm run build')
  process.exit(1)
}

rmSync(release, { recursive: true, force: true })
cpSync(output, resolve(release, 'build'), { recursive: true })
cpSync(resolve(root, 'server.mjs'), resolve(release, 'server.mjs'))

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const releasePkg = {
  name: pkg.name,
  private: true,
  type: 'module',
  main: 'server.mjs',
  engines: pkg.engines,
  scripts: { start: 'node server.mjs' },
}
writeFileSync(resolve(release, 'package.json'), `${JSON.stringify(releasePkg, null, 2)}\n`)

console.log('Готово: папка release/ — её содержимое загружается на хостинг.')
