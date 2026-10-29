<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Категории — админка' })

const { data: categories } = await useFetch('/api/admin/categories')
</script>

<template>
  <div>
    <div class="adminPage__head">
      <h1 class="adminPage__title">Категории</h1>
      <NuxtLink to="/admin/categories/new" class="adminButton">+ Добавить категорию</NuxtLink>
    </div>

    <div class="adminCard adminTable__wrap">
      <table class="adminTable">
        <thead>
          <tr>
            <th>Название</th>
            <th>URL-идентификатор</th>
            <th class="adminTable__num">Товаров</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td><NuxtLink :to="`/admin/categories/${category.id}`" class="adminTable__link">{{ category.name }}</NuxtLink></td>
            <td class="adminTable__muted">{{ category.slug }}</td>
            <td class="adminTable__num">
              <NuxtLink :to="{ path: '/admin/products', query: { category: category.id } }" class="adminTable__link">
                {{ category.productCount }}
              </NuxtLink>
            </td>
          </tr>
          <tr v-if="!categories?.length">
            <td colspan="3" class="adminTable__empty">Категорий пока нет</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
