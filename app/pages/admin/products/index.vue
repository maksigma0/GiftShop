<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Товары — админка' })

const route = useRoute()
const errors = useFormErrors()

const filters = reactive({
  q: typeof route.query.q === 'string' ? route.query.q : '',
  category: typeof route.query.category === 'string' ? route.query.category : '',
  available: typeof route.query.available === 'string' ? route.query.available : '',
})
const page = computed(() => typeof route.query.page === 'string' ? route.query.page : undefined)

const { data: categories } = await useFetch('/api/admin/categories')
const { data: result, refresh } = await useFetch('/api/admin/products', {
  query: computed(() => ({ ...route.query, page: page.value })),
})

function applyFilters() {
  navigateTo({ query: Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) })
}

const selected = ref<number[]>([])
watch(result, () => { selected.value = [] })

const allSelected = computed({
  get: () => !!result.value?.items.length && selected.value.length === result.value.items.length,
  set: (value: boolean) => { selected.value = value ? result.value!.items.map(product => product.id) : [] },
})

async function setAvailable(ids: number[], available: boolean) {
  errors.reset()
  try {
    const { updated } = await $fetch('/api/admin/products/availability', { method: 'POST', body: { ids, available } })
    await refresh()
    return updated
  }
  catch (error) {
    errors.handle(error)
  }
}

const notice = ref('')
async function bulk(available: boolean) {
  const updated = await setAvailable(selected.value, available)
  if (updated !== undefined) notice.value = `Обновлено товаров: ${updated}`
}
</script>

<template>
  <div>
    <div class="adminPage__head">
      <h1 class="adminPage__title">Товары</h1>
      <NuxtLink to="/admin/products/new" class="adminButton">+ Добавить товар</NuxtLink>
    </div>

    <form class="adminCard adminFilters" @submit.prevent="applyFilters">
      <input v-model="filters.q" class="adminInput" type="search" placeholder="Поиск по названию" aria-label="Поиск по названию">
      <select v-model="filters.category" class="adminInput" aria-label="Категория">
        <option value="">Все категории</option>
        <option v-for="category in categories" :key="category.id" :value="String(category.id)">{{ category.name }}</option>
      </select>
      <select v-model="filters.available" class="adminInput" aria-label="Наличие">
        <option value="">Любое наличие</option>
        <option value="yes">В наличии</option>
        <option value="no">Нет в наличии</option>
      </select>
      <button class="adminButton" type="submit">Найти</button>
    </form>

    <p v-if="errors.message.value" class="adminMessage adminMessage--error">{{ errors.message.value }}</p>
    <p v-else-if="notice" class="adminMessage adminMessage--success">{{ notice }}</p>

    <div class="adminBulk">
      <span class="adminBulk__count">Выбрано {{ selected.length }} из {{ result?.items.length ?? 0 }}</span>
      <button class="adminButton adminButton--ghost" type="button" :disabled="!selected.length" @click="bulk(true)">
        Отметить «В наличии»
      </button>
      <button class="adminButton adminButton--ghost" type="button" :disabled="!selected.length" @click="bulk(false)">
        Отметить «Нет в наличии»
      </button>
    </div>

    <div class="adminCard adminTable__wrap">
      <table class="adminTable">
        <thead>
          <tr>
            <th class="adminTable__check"><input v-model="allSelected" type="checkbox" aria-label="Выбрать все"></th>
            <th>Фото</th>
            <th>Название</th>
            <th>Категория</th>
            <th class="adminTable__num">Цена</th>
            <th>В наличии</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in result?.items" :key="product.id">
            <td class="adminTable__check">
              <input v-model="selected" type="checkbox" :value="product.id" :aria-label="`Выбрать ${product.name}`">
            </td>
            <td>
              <img v-if="product.imageUrl" class="adminTable__preview" :src="product.imageUrl" alt="">
              <span v-else class="adminTable__muted">—</span>
            </td>
            <td><NuxtLink :to="`/admin/products/${product.id}`" class="adminTable__link">{{ product.name }}</NuxtLink></td>
            <td>{{ product.category.name }}</td>
            <td class="adminTable__num"><CatalogPrice :kop="product.priceKop" /></td>
            <td>
              <input
                type="checkbox"
                :checked="product.available"
                :aria-label="`${product.name}: в наличии`"
                @change="setAvailable([product.id], ($event.target as HTMLInputElement).checked)"
              >
            </td>
          </tr>
          <tr v-if="!result?.items.length">
            <td colspan="6" class="adminTable__empty">Ничего не найдено</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav v-if="result && result.pages > 1" class="adminPager">
      <NuxtLink
        v-for="n in result.pages"
        :key="n"
        :to="{ query: { ...route.query, page: n } }"
        class="adminPager__link"
        :class="{ 'adminPager__link--current': n === result.page }"
      >
        {{ n }}
      </NuxtLink>
    </nav>
  </div>
</template>

<style>
.adminFilters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.adminBulk {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.adminBulk__count {
  color: var(--admin-muted);
  margin-right: 0.5rem;
}

.adminTable__wrap {
  overflow-x: auto;
}

.adminTable {
  width: 100%;
  border-collapse: collapse;
}

.adminTable th {
  background: var(--admin-subtle);
  color: var(--admin-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02rem;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--admin-border);
}

.adminTable td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f3;
  vertical-align: middle;
}

.adminTable tbody tr:last-child td {
  border-bottom: none;
}

.adminTable tbody tr:hover {
  background: #fafafc;
}

.adminTable__check {
  width: 2.75rem;
}

.adminTable input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--admin-accent);
  cursor: pointer;
}

.adminTable__num {
  text-align: right;
  white-space: nowrap;
}

.adminTable__preview {
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  object-fit: cover;
  border-radius: 0.625rem;
}

.adminTable__link {
  color: var(--admin-accent-dark);
  font-weight: 500;
}

.adminTable__muted,
.adminTable__empty {
  color: var(--admin-muted);
}

.adminTable__empty {
  text-align: center;
  padding: 2rem;
}

.adminPager {
  display: flex;
  gap: 0.375rem;
  margin-top: 1rem;
}

.adminPager__link {
  min-width: 2.75rem;
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.625rem;
  color: var(--admin-accent);
  text-decoration: none;
}

.adminPager__link--current {
  background: var(--admin-accent);
  color: #ffffff;
}

@media (max-width: 48rem) {
  .adminFilters {
    grid-template-columns: 1fr;
  }
}
</style>
