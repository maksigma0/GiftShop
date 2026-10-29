import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { createCategory, createProduct, deleteCategory, setAvailability, validateCategory, validateProduct, ValidationError } from '../server/lib/admin.ts'
import { getProductsByIds, listCategories, listProducts } from '../server/lib/catalog.ts'
import { openDatabase, type Database } from '../server/lib/db.ts'
import { formatPrice, parsePriceToKop } from '../shared/utils/format.ts'
import { slugify } from '../shared/utils/slugify.ts'

let db: Database
let categoryId: number

function addProduct(name: string, slug: string, priceKop: number, extra: Partial<{ available: boolean, categoryId: number }> = {}) {
  return createProduct(db, {
    categoryId: extra.categoryId ?? categoryId,
    name,
    slug,
    description: '',
    priceKop,
    weightG: 0,
    available: extra.available ?? true,
  }, '')
}

beforeEach(() => {
  db = openDatabase(':memory:')
  categoryId = createCategory(db, { name: 'Сладости', slug: 'sladosti', description: '' })
})

describe('каталог', () => {
  test('поиск по кириллице не зависит от регистра', () => {
    addProduct('Тестовый сыр', 'test-cheese', 1000)
    assert.equal(listProducts(db, { query: 'ТЕСТОВЫЙ' }).total, 1)
    assert.equal(listProducts(db, { query: 'нет такого' }).total, 0)
  })

  test('фильтр по категории', () => {
    const otherId = createCategory(db, { name: 'Другая', slug: 'other', description: '' })
    addProduct('Конфеты', 'candy', 500)
    addProduct('Сыр', 'cheese', 500, { categoryId: otherId })
    const page = listProducts(db, { categoryId })
    assert.deepEqual(page.items.map(p => p.slug), ['candy'])
  })

  test('сортировка по цене', () => {
    addProduct('Дешёвый', 'cheap', 500)
    addProduct('Дорогой', 'dear', 5000)
    assert.deepEqual(listProducts(db, { sort: 'cheap' }).items.map(p => p.slug), ['cheap', 'dear'])
    assert.deepEqual(listProducts(db, { sort: 'expensive' }).items.map(p => p.slug), ['dear', 'cheap'])
  })

  test('пагинация: мусор → первая страница, слишком большая → последняя', () => {
    for (let i = 0; i < 13; i++) addProduct(`Товар ${i}`, `tovar-${i}`, 100)
    assert.equal(listProducts(db, { page: 2 }).items.length, 1)
    assert.equal(listProducts(db, { page: 99 }).page, 2)
    assert.equal(listProducts(db, { page: Number.NaN }).page, 1)
    assert.equal(listProducts(db).pages, 2)
  })

  test('избранное пропускает удалённые товары и сохраняет порядок', () => {
    const a = addProduct('A', 'a', 100)
    const b = addProduct('B', 'b', 100)
    assert.deepEqual(getProductsByIds(db, [b, 999, a]).map(p => p.id), [b, a])
  })

  test('счётчик товаров в категориях', () => {
    addProduct('A', 'a', 100)
    assert.equal(listCategories(db)[0]!.productCount, 1)
  })
})

describe('админка', () => {
  test('валидация товара собирает ошибки по полям', () => {
    assert.throws(
      () => validateProduct(db, { name: '', price: 'abc', categoryId: '999' }),
      (error: unknown) => error instanceof ValidationError
        && ['name', 'price', 'categoryId'].every(key => key in error.fields),
    )
  })

  test('slug генерируется из названия и должен быть уникальным', () => {
    const input = validateCategory(db, { name: 'Новогодние подарки' })
    assert.equal(input.slug, 'novogodnie-podarki')
    assert.throws(() => validateCategory(db, { name: 'Сладости' }), ValidationError)
  })

  test('массовая смена наличия', () => {
    const a = addProduct('A', 'a', 100)
    const b = addProduct('B', 'b', 100)
    assert.equal(setAvailability(db, [a, b], false), 2)
    assert.equal(listProducts(db, { available: false }).total, 2)
  })

  test('удаление категории удаляет её товары', () => {
    addProduct('A', 'a', 100)
    assert.equal(deleteCategory(db, categoryId).deleted, true)
    assert.equal(listProducts(db).total, 0)
  })
})

describe('форматирование', () => {
  test('цены', () => {
    assert.equal(formatPrice(1540), '15,40')
    assert.equal(parsePriceToKop('15,4'), 1540)
    assert.equal(parsePriceToKop('0.10'), 10)
    assert.equal(parsePriceToKop('1,234'), null)
  })

  test('slugify', () => {
    assert.equal(slugify('Сыр «Бри» с белой плесенью'), 'syr-bri-s-beloj-plesenyu')
  })
})
