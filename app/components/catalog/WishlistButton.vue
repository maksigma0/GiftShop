<script setup lang="ts">
const props = defineProps<{
  productId: number
  /** Широкая кнопка с текстом — для страницы товара */
  wide?: boolean
}>()

const wishlist = useWishlist()
const active = computed(() => wishlist.has(props.productId))
const label = computed(() => active.value ? 'Убрать из избранного' : 'В избранное')
</script>

<template>
  <button
    type="button"
    class="wishlistButton"
    :class="{ 'wishlistButton--active': active, 'wishlistButton--wide': wide }"
    :aria-pressed="active"
    :title="label"
    :aria-label="wide ? undefined : label"
    @click="wishlist.toggle(productId)"
  >
    {{ active ? '♥' : '♡' }}
    <template v-if="wide">{{ active ? 'В избранном' : 'В избранное' }}</template>
  </button>
</template>

<style>
.wishlistButton {
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: var(--transition);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.wishlistButton:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.1);
}

.wishlistButton--active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(196, 30, 58, 0.08);
}

.wishlistButton--wide {
  width: auto;
  padding: 0 1.5rem;
  height: 3.25rem;
  font-size: 1rem;
  gap: 0.5rem;
}
</style>
