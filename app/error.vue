<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useHead({ title: notFound.value ? 'Страница не найдена — Сладкий Мир' : 'Ошибка — Сладкий Мир' })
</script>

<template>
  <NuxtLayout>
    <div class="container errorPage">
      <div class="errorPage__icon">🎁</div>
      <h1 class="errorPage__title">
        {{ notFound ? 'Такой страницы нет' : 'Что-то пошло не так' }}
      </h1>
      <p class="errorPage__text">
        {{ notFound ? 'Возможно, товар уже убрали из каталога.' : 'Попробуйте обновить страницу чуть позже.' }}
      </p>
      <button class="buttonPrimary errorPage__button" @click="clearError({ redirect: '/catalog' })">
        Перейти в каталог
      </button>
    </div>
  </NuxtLayout>
</template>

<style>
.errorPage {
  text-align: center;
  padding: 5rem 1.25rem;
}

.errorPage__icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.errorPage__title {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.errorPage__text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.errorPage__button {
  border: none;
  cursor: pointer;
  font: inherit;
}
</style>
