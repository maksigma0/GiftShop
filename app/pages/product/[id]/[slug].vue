<script setup lang="ts">
const route = useRoute('product-id-slug')

const { data: product, error } = await useFetch(`/api/products/${route.params.id}`)
if (error.value || !product.value) {
  throw createError({ statusCode: error.value?.statusCode ?? 404, message: 'Товар не найден', fatal: true })
}

// Неверный slug в адресе (например, товар переименовали) — 301 на правильный адрес
if (product.value.slug !== route.params.slug) {
  await navigateTo(`/product/${product.value.id}/${product.value.slug}`, { redirectCode: 301, replace: true })
}

useHead({ title: `${product.value.name} — Сладкий Мир` })
useSeoMeta({ description: product.value.description.slice(0, 160) })
</script>

<template>
  <div v-if="product" class="container">
    <p class="breadcrumbs">
      <NuxtLink to="/catalog" class="breadcrumbs__link">Каталог</NuxtLink>
      /
      <NuxtLink :to="`/category/${product.category.slug}`" class="breadcrumbs__link">{{ product.category.name }}</NuxtLink>
    </p>

    <div class="productDetail">
      <div class="productDetail__image">
        <img v-if="product.imageUrl" class="productDetail__img" :src="product.imageUrl" :alt="product.name">
        <div v-else class="productDetail__placeholder" aria-hidden="true">🎁</div>
      </div>

      <div class="productDetail__info">
        <h1 class="productDetail__title">{{ product.name }}</h1>

        <span class="stockBadge" :class="product.available ? 'stockBadge--in' : 'stockBadge--out'">
          {{ product.available ? 'В наличии' : 'Нет в наличии' }}
        </span>

        <CatalogPrice class="productDetail__price" :kop="product.priceKop" />
        <div v-if="product.weightG" class="productCard__weight">Вес: {{ formatWeightKg(product.weightG) }} кг</div>

        <!-- white-space: pre-line сохраняет переносы строк, как linebreaksbr в Django -->
        <div v-if="product.description" class="productDetail__desc">{{ product.description }}</div>

        <div class="productDetail__actions">
          <CatalogWishlistButton :product-id="product.id" wide />
        </div>

        <NuxtLink to="/catalog" class="productDetail__back">← Назад в каталог</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
.breadcrumbs {
  margin: 1.5rem 0 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.breadcrumbs__link {
  color: var(--primary);
  text-decoration: none;
}

.productDetail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.75rem;
  padding: 3.75rem 0;
}

.productDetail__image {
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #f5f0eb 0%, #e8e0d5 100%);
}

[data-theme="dark"] .productDetail__image {
  background: linear-gradient(135deg, #1E2731 0%, #0E141B 100%);
}

.productDetail__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.productDetail__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  background: radial-gradient(circle at 50% 42%, rgba(255, 183, 197, 0.45) 0%, rgba(255, 228, 196, 0.30) 55%, transparent 72%);
}

[data-theme="dark"] .productDetail__placeholder {
  opacity: 0.3;
  background: none;
}

.productDetail__title {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  margin-bottom: 0.75rem;
}

.productDetail__price {
  display: block;
  font-family: var(--font-heading);
  font-size: 2rem;
  color: var(--primary);
  margin: 1.25rem 0;
}

[data-theme="dark"] .productDetail__price {
  text-shadow: 0 0 20px rgba(176, 72, 92, 0.35);
}

.productDetail__desc {
  white-space: pre-line;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.productDetail__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  margin: 1.5rem 0;
}

.productDetail__back {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  margin-top: 0.5rem;
}

@media (max-width: 48rem) {
  .productDetail {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
