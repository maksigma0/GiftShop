<script setup lang="ts">
defineProps<{ kop: number }>()
</script>

<template>
  <span>{{ formatPrice(kop) }}<span class="bynSign" aria-label="белорусских рублей" /></span>
</template>
