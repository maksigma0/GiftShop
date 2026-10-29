import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

/**
 * Миграции схемы. Номер миграции = её индекс + 1, текущая версия базы
 * хранится в PRAGMA user_version. Уже применённые миграции не меняем —
 * только дописываем новые в конец списка.
 */
const MIGRATIONS = [
  `
  CREATE TABLE categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    slug        TEXT    NOT NULL UNIQUE,
    description TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE products (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id  INTEGER NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    name         TEXT    NOT NULL,
    slug         TEXT    NOT NULL UNIQUE,
    description  TEXT    NOT NULL DEFAULT '',
    -- Деньги храним целым числом в копейках: у float бывают ошибки округления.
    price_kop    INTEGER NOT NULL CHECK (price_kop >= 0),
    weight_g     INTEGER NOT NULL DEFAULT 0 CHECK (weight_g >= 0),
    image        TEXT    NOT NULL DEFAULT '',
    available    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX products_category_id ON products (category_id);
  `,
]

function migrate(db: DatabaseSync) {
  const { user_version: version } = db.prepare('PRAGMA user_version').get() as { user_version: number }

  for (let i = version; i < MIGRATIONS.length; i++) {
    db.exec('BEGIN')
    try {
      db.exec(MIGRATIONS[i]!)
      db.exec(`PRAGMA user_version = ${i + 1}`)
      db.exec('COMMIT')
    }
    catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
}

/** Открывает базу (':memory:' — для тестов) и доводит схему до актуальной. */
export function openDatabase(path: string) {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true })
  }

  const db = new DatabaseSync(path)
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA journal_mode = WAL')

  // Встроенный lower() в SQLite понимает только латиницу.
  // Регистрируем свою функцию, чтобы поиск по кириллице не зависел от регистра.
  db.function('lower_ru', { deterministic: true }, (value) => {
    return typeof value === 'string' ? value.toLowerCase() : value
  })

  migrate(db)
  return db
}

export type Database = DatabaseSync
