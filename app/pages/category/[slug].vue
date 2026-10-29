<script setup lang="ts">
const route = useRoute('category-slug')
</script>

<template>
  <CatalogView :category-slug="route.params.slug" />
</template>
