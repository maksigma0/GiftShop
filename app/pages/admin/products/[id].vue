<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute('admin-products-id')
const isNew = route.params.id === 'new'
const errors = useFormErrors()

const { data: categories } = await useFetch('/api/admin/categories')
const { data: product } = await useFetch(`/api/admin/products/${route.params.id}`, { immediate: !isNew })

if (!isNew && !product.value) {
  throw createError({ statusCode: 404, message: 'Товар не найден', fatal: true })
}

useHead({ title: `${isNew ? 'Новый товар' : product.value!.name} — админка` })

const form = reactive({
  name: product.value?.name ?? '',
  slug: product.value?.slug ?? '',
  categoryId: product.value ? String(product.value.category.id) : '',
  description: product.value?.description ?? '',
  price: product.value ? formatPrice(product.value.priceKop) : '',
  weight: product.value?.weightG ? formatWeightKg(product.value.weightG) : '',
  available: product.value?.available ?? true,
})

// Как prepopulated_fields в Django: пока slug не правили руками, он повторяет название
const slugTouched = ref(!isNew)
watch(() => form.name, (name) => {
  if (!slugTouched.value) form.slug = slugify(name)
})

const imageFile = ref<File | null>(null)
const removeImage = ref(false)
const previewUrl = computed(() => imageFile.value ? URL.createObjectURL(imageFile.value) : removeImage.value ? '' : product.value?.imageUrl ?? '')

function pickImage(event: Event) {
  imageFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
  removeImage.value = false
}

const pending = ref(false)

async function save() {
  pending.value = true
  errors.reset()

  const body = new FormData()
  for (const [key, value] of Object.entries(form)) body.append(key, String(value))
  if (imageFile.value) body.append('image', imageFile.value)
  if (removeImage.value) body.append('removeImage', 'true')

  try {
    const { id } = await $fetch<{ id: number }>(isNew ? '/api/admin/products' : `/api/admin/products/${route.params.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body,
    })
    await navigateTo(isNew ? `/admin/products/${id}?saved=1` : '/admin/products')
  }
  catch (error) {
    errors.handle(error)
  }
  finally {
    pending.value = false
  }
}

async function remove() {
  if (!window.confirm(`Удалить «${product.value!.name}»? Это нельзя отменить.`)) return
  try {
    await $fetch(`/api/admin/products/${route.params.id}`, { method: 'DELETE' })
    await navigateTo('/admin/products')
  }
  catch (error) {
    errors.handle(error)
  }
}
</script>

<template>
  <div>
    <p class="adminPage__crumbs"><NuxtLink to="/admin/products">Товары</NuxtLink> / {{ isNew ? 'Новый' : product?.name }}</p>
    <div class="adminPage__head">
      <h1 class="adminPage__title">{{ isNew ? 'Новый товар' : 'Изменить товар' }}</h1>
      <a v-if="product" :href="`/product/${product.id}/${product.slug}`" target="_blank" class="adminButton adminButton--ghost">
        Смотреть на сайте ↗
      </a>
    </div>

    <p v-if="route.query.saved" class="adminMessage adminMessage--success">Товар создан</p>
    <p v-if="errors.message.value" class="adminMessage adminMessage--error" role="alert">{{ errors.message.value }}</p>

    <form class="adminForm" @submit.prevent="save">
      <fieldset class="adminCard adminForm__group">
        <AdminField label="Название" for-id="name" :error="errors.fields.value.name">
          <input id="name" v-model="form.name" class="adminInput" :class="{ 'adminInput--invalid': errors.fields.value.name }" maxlength="200" required>
        </AdminField>
        <AdminField label="URL-идентификатор" for-id="slug" :error="errors.fields.value.slug" hint="Латиница, цифры и дефисы. Заполняется по названию.">
          <input id="slug" v-model="form.slug" class="adminInput" :class="{ 'adminInput--invalid': errors.fields.value.slug }" @input="slugTouched = true">
        </AdminField>
        <AdminField label="Категория" for-id="categoryId" :error="errors.fields.value.categoryId">
          <select id="categoryId" v-model="form.categoryId" class="adminInput" :class="{ 'adminInput--invalid': errors.fields.value.categoryId }" required>
            <option value="" disabled>Выберите категорию</option>
            <option v-for="category in categories" :key="category.id" :value="String(category.id)">{{ category.name }}</option>
          </select>
        </AdminField>
        <AdminField label="Описание" for-id="description">
          <textarea id="description" v-model="form.description" class="adminInput" />
        </AdminField>
      </fieldset>

      <fieldset class="adminCard adminForm__group">
        <legend class="adminForm__legend">Цена и наличие</legend>
        <AdminField label="Цена, BYN" for-id="price" :error="errors.fields.value.price">
          <input id="price" v-model="form.price" class="adminInput adminForm__short" :class="{ 'adminInput--invalid': errors.fields.value.price }" inputmode="decimal" placeholder="15,40" required>
        </AdminField>
        <AdminField label="Вес, кг" for-id="weight" :error="errors.fields.value.weight">
          <input id="weight" v-model="form.weight" class="adminInput adminForm__short" :class="{ 'adminInput--invalid': errors.fields.value.weight }" inputmode="decimal" placeholder="0,45">
        </AdminField>
        <label class="adminForm__checkbox">
          <input v-model="form.available" type="checkbox"> В наличии
        </label>
      </fieldset>

      <fieldset class="adminCard adminForm__group">
        <legend class="adminForm__legend">Изображение</legend>
        <img v-if="previewUrl" :src="previewUrl" alt="" class="adminForm__preview">
        <AdminField label="Файл" for-id="image" :error="errors.fields.value.image" hint="JPG, PNG, WEBP или GIF до 5 МБ">
          <input id="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="pickImage">
        </AdminField>
        <label v-if="product?.imageUrl && !imageFile" class="adminForm__checkbox">
          <input v-model="removeImage" type="checkbox"> Удалить текущее фото
        </label>
      </fieldset>

      <div class="adminCard adminForm__submit">
        <button v-if="!isNew" type="button" class="adminButton adminButton--danger" @click="remove">Удалить</button>
        <button type="submit" class="adminButton adminForm__save" :disabled="pending">Сохранить</button>
      </div>
    </form>
  </div>
</template>
