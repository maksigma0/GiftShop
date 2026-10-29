<script setup lang="ts">
import type { Product } from '#shared/types/shop'

const props = defineProps<{
  product: Product
  /** Показывать категорию и вес (в избранном их нет, как в оригинале) */
  detailed?: boolean
}>()

const url = computed(() => `/product/${props.product.id}/${props.product.slug}`)
</script>

<template>
  <article class="productCard">
    <NuxtLink class="productCard__imageWrap" :to="url" :aria-label="product.name">
      <img v-if="product.imageUrl" class="productCard__image" :src="product.imageUrl" :alt="product.name" loading="lazy">
      <div v-else class="productCard__placeholder" aria-hidden="true">🎁</div>
      <span class="productCard__badge stockBadge" :class="product.available ? 'stockBadge--in' : 'stockBadge--out'">
        {{ product.available ? 'В наличии' : 'Нет в наличии' }}
      </span>
    </NuxtLink>

    <div class="productCard__body">
      <h3 class="productCard__name">
        <NuxtLink class="productCard__nameLink" :to="url">{{ product.name }}</NuxtLink>
      </h3>
      <div v-if="detailed" class="productCard__category">{{ product.category.name }}</div>
      <CatalogPrice class="productCard__price" :kop="product.priceKop" />
      <div v-if="detailed && product.weightG" class="productCard__weight">
        Вес: {{ formatWeightKg(product.weightG) }} кг
      </div>
      <div class="productCard__actions">
        <CatalogWishlistButton :product-id="product.id" />
      </div>
    </div>
  </article>
</template>

<style>
.productCard {
  background: var(--card);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(58, 42, 34, 0.07), 0 16px 42px rgba(58, 42, 34, 0.12);
  transition: var(--transition);
  animation: fadeInUp 0.6s ease backwards;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
}

[data-theme="dark"] .productCard {
  box-shadow: var(--shadow);
}

/* Акцентная полоса сверху карточки */
.productCard::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--caramel), var(--accent));
  opacity: 0.55;
  transition: opacity 0.2s ease;
}

.productCard:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(53, 35, 30, 0.12), 0 28px 64px rgba(53, 35, 30, 0.18);
  border-color: rgba(156, 37, 66, 0.25);
}

[data-theme="dark"] .productCard:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(176, 72, 92, 0.4);
}

.productCard:hover::before {
  opacity: 1;
}

.productCard__imageWrap {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  /* Без этого заглушка 🎁 подчёркивается как ссылка */
  text-decoration: none;
  background: linear-gradient(135deg, #f5f0eb 0%, #e8e0d5 100%);
}

[data-theme="dark"] .productCard__imageWrap {
  background: linear-gradient(135deg, #1E2731 0%, #0E141B 100%);
}

.productCard__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.productCard:hover .productCard__image {
  transform: scale(1.05);
}

.productCard__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.75rem;
  background: radial-gradient(circle at 50% 42%, rgba(255, 183, 197, 0.45) 0%, rgba(255, 228, 196, 0.30) 55%, transparent 72%);
}

[data-theme="dark"] .productCard__placeholder {
  font-size: 3rem;
  opacity: 0.3;
  background: none;
}

.productCard__badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  backdrop-filter: blur(10px);
}

.productCard__body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.productCard__name {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.productCard__nameLink {
  color: inherit;
  text-decoration: none;
}

.productCard__nameLink:hover {
  color: var(--primary);
}

.productCard__category {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.productCard__price {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.productCard__weight {
  display: inline-block;
  width: fit-content;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--caramel);
  background: rgba(200, 127, 63, 0.14);
  border-radius: 999px;
  padding: 0.1875rem 0.625rem;
  margin-bottom: 0.875rem;
}

[data-theme="dark"] .productCard__weight {
  background: rgba(224, 160, 106, 0.18);
}

.productCard__actions {
  display: flex;
  gap: 0.625rem;
  margin-top: auto;
}
</style>
