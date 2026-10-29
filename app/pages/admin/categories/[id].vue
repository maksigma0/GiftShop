<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute('admin-categories-id')
const isNew = route.params.id === 'new'
const errors = useFormErrors()

const { data: category } = await useFetch(`/api/admin/categories/${route.params.id}`, { immediate: !isNew })
if (!isNew && !category.value) {
  throw createError({ statusCode: 404, message: 'Категория не найдена', fatal: true })
}

useHead({ title: `${isNew ? 'Новая категория' : category.value!.name} — админка` })

const form = reactive({
  name: category.value?.name ?? '',
  slug: category.value?.slug ?? '',
  description: category.value?.description ?? '',
})

const slugTouched = ref(!isNew)
watch(() => form.name, (name) => {
  if (!slugTouched.value) form.slug = slugify(name)
})

const pending = ref(false)

async function save() {
  pending.value = true
  errors.reset()
  try {
    await $fetch(isNew ? '/api/admin/categories' : `/api/admin/categories/${route.params.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body: form,
    })
    await navigateTo('/admin/categories')
  }
  catch (error) {
    errors.handle(error)
  }
  finally {
    pending.value = false
  }
}

async function remove() {
  if (!window.confirm(`Удалить категорию «${category.value!.name}» вместе со всеми её товарами? Это нельзя отменить.`)) return
  try {
    await $fetch(`/api/admin/categories/${route.params.id}`, { method: 'DELETE' })
    await navigateTo('/admin/categories')
  }
  catch (error) {
    errors.handle(error)
  }
}
</script>

<template>
  <div>
    <p class="adminPage__crumbs"><NuxtLink to="/admin/categories">Категории</NuxtLink> / {{ isNew ? 'Новая' : category?.name }}</p>
    <div class="adminPage__head">
      <h1 class="adminPage__title">{{ isNew ? 'Новая категория' : 'Изменить категорию' }}</h1>
    </div>

    <p v-if="errors.message.value" class="adminMessage adminMessage--error" role="alert">{{ errors.message.value }}</p>

    <form class="adminForm" @submit.prevent="save">
      <fieldset class="adminCard adminForm__group">
        <AdminField label="Название" for-id="name" :error="errors.fields.value.name">
          <input id="name" v-model="form.name" class="adminInput" :class="{ 'adminInput--invalid': errors.fields.value.name }" maxlength="100" required>
        </AdminField>
        <AdminField label="URL-идентификатор" for-id="slug" :error="errors.fields.value.slug" hint="Латиница, цифры и дефисы. Заполняется по названию.">
          <input id="slug" v-model="form.slug" class="adminInput" :class="{ 'adminInput--invalid': errors.fields.value.slug }" @input="slugTouched = true">
        </AdminField>
        <AdminField label="Описание" for-id="description">
          <textarea id="description" v-model="form.description" class="adminInput" />
        </AdminField>
      </fieldset>

      <div class="adminCard adminForm__submit">
        <button v-if="!isNew" type="button" class="adminButton adminButton--danger" @click="remove">Удалить</button>
        <button type="submit" class="adminButton adminForm__save" :disabled="pending">Сохранить</button>
      </div>
    </form>
  </div>
</template>
