<script setup lang="ts">
import type { SortOrder } from '#shared/types/shop'

const props = defineProps<{ categorySlug?: string }>()
const route = useRoute()

const query = computed(() => ({
  category: props.categorySlug || undefined,
  q: typeof route.query.q === 'string' && route.query.q.trim() ? route.query.q.trim() : undefined,
  sort: typeof route.query.sort === 'string' && route.query.sort ? route.query.sort : undefined,
  page: typeof route.query.page === 'string' ? route.query.page : undefined,
}))

const [{ data: categories }, { data: result, error }] = await Promise.all([
  useFetch('/api/categories', { key: 'categories' }),
  useFetch('/api/products', { query }),
])

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, message: error.value.data?.message, fatal: true })
}

const search = computed(() => query.value.q ?? '')
const sort = computed<SortOrder>(() => (query.value.sort as SortOrder) ?? '')

useHead(() => ({
  title: `${result.value?.category?.name ?? 'Каталог'} — Сладкий Мир`,
}))

function changeSort(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  navigateTo({ query: { ...route.query, sort: value || undefined, page: undefined } })
}

function pageLink(page: number) {
  return { query: { ...route.query, page: page > 1 ? page : undefined } }
}

// Пагинация: плавно возвращаемся к началу сетки
watch(() => result.value?.page, () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <section class="catalogHero rainbow">
    <h1 class="catalogHero__title">Сладкий Мир</h1>
    <p class="catalogHero__subtitle">любимые конфеты и подарки с душой</p>
  </section>

  <div class="container">
    <nav class="categoryChips" aria-label="Категории">
      <NuxtLink to="/catalog" class="categoryChips__chip" :class="{ 'categoryChips__chip--active': !categorySlug }">
        Все
      </NuxtLink>
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/category/${category.slug}`"
        class="categoryChips__chip"
        :class="{ 'categoryChips__chip--active': category.slug === categorySlug }"
      >
        {{ category.name }}
      </NuxtLink>
    </nav>

    <div class="sortBar">
      <label class="sortBar__label" for="sortSelect">Сортировка:</label>
      <select id="sortSelect" class="sortBar__select" :value="sort" @change="changeSort">
        <option value="">По умолчанию</option>
        <option value="cheap">Сначала дешёвые</option>
        <option value="expensive">Сначала дорогие</option>
      </select>
    </div>

    <p v-if="search && result" class="searchNote">
      Поиск: «<strong class="searchNote__query">{{ search }}</strong>» — найдено {{ result.total }} шт.
    </p>

    <template v-if="result?.items.length">
      <div class="productGrid">
        <CatalogProductCard v-for="product in result.items" :key="product.id" :product="product" detailed />
      </div>

      <nav v-if="result.pages > 1" class="pagination" aria-label="Страницы">
        <NuxtLink v-if="result.page > 1" class="pagination__link" :to="pageLink(result.page - 1)">← Назад</NuxtLink>
        <template v-for="page in result.pages" :key="page">
          <span v-if="page === result.page" class="pagination__link pagination__link--current" aria-current="page">{{ page }}</span>
          <NuxtLink v-else class="pagination__link" :to="pageLink(page)">{{ page }}</NuxtLink>
        </template>
        <NuxtLink v-if="result.page < result.pages" class="pagination__link" :to="pageLink(result.page + 1)">Вперёд →</NuxtLink>
      </nav>
    </template>

    <p v-else class="emptyNote">
      <template v-if="search">По запросу «{{ search }}» ничего не нашлось. Попробуйте другое название.</template>
      <template v-else>В этой категории пока нет товаров. Загляните позже!</template>
    </p>
  </div>
</template>

<style>
.catalogHero {
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 5.25rem 1.25rem 3.5rem;
}

.catalogHero__title {
  font-family: var(--font-logo);
  font-size: 5.25rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.0625rem;
  /* Тёмный текст поверх пастельной радуги — читается в обеих темах */
  color: #3A1020;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55), 0 8px 22px rgba(58, 16, 32, 0.18);
  margin-bottom: 0.75rem;
}

.catalogHero__subtitle {
  font-size: 1.125rem;
  color: #5C3A4A;
  max-width: 31.25rem;
  margin: 0 auto;
}

.categoryChips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2rem 0 3rem;
}

.categoryChips__chip {
  padding: 0.625rem 1.5rem;
  border-radius: 3.125rem;
  border: 1px solid #EAD9B8;
  background: #ffffff;
  color: #6B4A3A;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: var(--transition);
  backdrop-filter: blur(10px);
}

.categoryChips__chip:hover {
  background: #FBF0E4;
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

.categoryChips__chip--active,
.categoryChips__chip--active:hover {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 6px 18px rgba(156, 37, 66, 0.30);
}

[data-theme="dark"] .categoryChips__chip {
  border-color: var(--border);
  background: var(--surface);
  color: var(--text);
}

[data-theme="dark"] .categoryChips__chip:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 6px 16px rgba(156, 37, 66, 0.22);
}

[data-theme="dark"] .categoryChips__chip--active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: var(--shadow);
}

.sortBar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.625rem;
  margin: 0 0 1rem;
}

.sortBar__label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.sortBar__select {
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
}

.sortBar__select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(156, 37, 66, 0.15);
}

.searchNote {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.searchNote__query {
  color: var(--accent);
}

.productGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17.5rem, 1fr));
  gap: 1.75rem;
  padding: 1.25rem 0 3.75rem;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 2.5rem 0 5rem;
  flex-wrap: wrap;
}

.pagination__link {
  padding: 0.625rem 1.125rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  transition: var(--transition);
}

a.pagination__link:hover,
.pagination__link--current {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

[data-theme="dark"] .pagination__link--current {
  box-shadow: var(--shadow);
}

@media (max-width: 48rem) {
  .catalogHero__title {
    font-size: 3.5rem;
    letter-spacing: 0.03125rem;
  }
}
</style>
