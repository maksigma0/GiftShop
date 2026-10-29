<script setup lang="ts">
defineProps<{
  label: string
  forId: string
  error?: string
  hint?: string
}>()
</script>

<template>
  <div class="adminField">
    <label class="adminField__label" :for="forId">{{ label }}</label>
    <slot />
    <p v-if="error" class="adminField__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="adminField__hint">{{ hint }}</p>
  </div>
</template>

<style>
.adminField {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f0f0f3;
}

.adminField:last-child {
  border-bottom: none;
}

.adminField__label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.375rem;
}

.adminField__hint,
.adminField__error {
  font-size: 0.75rem;
  margin-top: 0.375rem;
  color: var(--admin-muted);
}

.adminField__error {
  color: var(--admin-danger);
}

.adminForm {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 50rem;
}

.adminForm__group {
  border: 1px solid var(--admin-border);
  padding: 0;
  min-width: 0;
}

.adminForm__legend {
  float: left;
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--admin-subtle);
  border-bottom: 1px solid var(--admin-border);
  color: var(--admin-accent);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.adminForm__legend + * {
  clear: both;
}

.adminForm__short {
  max-width: 12rem;
}

.adminForm__checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.adminForm__checkbox input {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--admin-accent);
}

.adminForm__preview {
  display: block;
  width: 10rem;
  height: 10rem;
  object-fit: cover;
  border-radius: 0.75rem;
  margin: 1rem 1rem 0;
}

.adminForm__submit {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
}

.adminForm__save {
  margin-left: auto;
}
</style>
