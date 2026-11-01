<script setup lang="ts">
useHead({ title: 'Избранное — Сладкий Мир' })

const wishlist = useWishlist()
const { data } = await useFetch('/api/wishlist', { key: 'wishlist' })

// Сервер выкинул удалённые товары — поправляем cookie и счётчик в шапке
watch(data, (value) => {
  if (value && value.ids.length !== wishlist.ids.value.length) wishlist.replace(value.ids)
}, { immediate: true })

// Убрали сердечко — товар сразу пропадает со страницы
const products = computed(() => data.value?.products.filter(product => wishlist.has(product.id)) ?? [])
</script>

<template>
  <div class="container">
    <h1 class="pageTitle">Избранное</h1>

    <template v-if="products.length">
      <div class="productGrid productGrid--wishlist">
        <CatalogProductCard v-for="product in products" :key="product.id" :product="product" show-weight />
      </div>
    </template>

    <div v-else class="wishlistEmpty">
      <div class="wishlistEmpty__icon">♡</div>
      <h2 class="wishlistEmpty__title">У вас пока нет избранных товаров</h2>
      <p class="wishlistEmpty__text">Отмечайте сердечком то, что нравится!</p>
      <NuxtLink to="/catalog" class="buttonPrimary">Перейти в каталог</NuxtLink>
    </div>
  </div>
</template>

<style>
.productGrid--wishlist {
  grid-template-columns: repeat(3, 1fr);
  max-width: 68.75rem;
  margin: 0 auto;
}

.wishlistEmpty {
  text-align: center;
  padding: 5rem 1.25rem;
}

.wishlistEmpty__icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.wishlistEmpty__title {
  font-family: var(--font-heading);
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.wishlistEmpty__text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

@media (max-width: 48rem) {
  .productGrid--wishlist {
    grid-template-columns: 1fr;
  }
}
</style>
