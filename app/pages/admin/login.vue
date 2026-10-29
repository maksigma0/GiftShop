<script setup lang="ts">
import { FetchError } from 'ofetch'

definePageMeta({ layout: false })
useHead({ title: 'Вход — админка Сладкий Мир' })

const route = useRoute()
const password = ref('')
const error = ref('')
const pending = ref(false)

async function login() {
  pending.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    const next = typeof route.query.next === 'string' && route.query.next.startsWith('/admin') ? route.query.next : '/admin/products'
    await navigateTo(next)
  }
  catch (e) {
    error.value = e instanceof FetchError && e.statusCode === 401 ? 'Неверный пароль' : 'Не удалось войти, попробуйте ещё раз'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="adminShell adminLogin">
    <form class="adminCard adminLogin__card" @submit.prevent="login">
      <h1 class="adminLogin__title">Сладкий Мир</h1>
      <p class="adminLogin__subtitle">Вход в админку</p>
      <p v-if="error" class="adminMessage adminMessage--error" role="alert">{{ error }}</p>
      <label class="adminLogin__label" for="password">Пароль</label>
      <input id="password" v-model="password" class="adminInput" type="password" autocomplete="current-password" required autofocus>
      <button class="adminButton adminLogin__button" type="submit" :disabled="pending">Войти</button>
    </form>
  </div>
</template>

<style>
.adminLogin {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.adminLogin__card {
  width: 100%;
  max-width: 22rem;
  padding: 2rem;
  border-radius: 1.125rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.adminLogin__title {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.adminLogin__subtitle {
  color: var(--admin-muted);
  margin-bottom: 1.5rem;
}

.adminLogin__label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.375rem;
}

.adminLogin__button {
  width: 100%;
  margin-top: 1rem;
}
</style>
