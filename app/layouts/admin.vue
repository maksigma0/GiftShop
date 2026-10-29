<script setup lang="ts">
async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="adminShell">
    <header class="adminHeader">
      <NuxtLink to="/admin/products" class="adminHeader__brand">Сладкий Мир · админка</NuxtLink>
      <nav class="adminHeader__nav">
        <NuxtLink to="/admin/products" class="adminHeader__link">Товары</NuxtLink>
        <NuxtLink to="/admin/categories" class="adminHeader__link">Категории</NuxtLink>
        <a href="/" class="adminHeader__link" target="_blank">Открыть сайт ↗</a>
        <button type="button" class="adminHeader__link adminHeader__link--button" @click="logout">Выйти</button>
      </nav>
    </header>
    <main class="adminMain">
      <slot />
    </main>
  </div>
</template>

<style>
/* Админка всегда светлая, как и в Django-версии */
.adminShell {
  --admin-accent: #4a7a5a;
  --admin-accent-dark: #2f5540;
  --admin-accent-soft: #eaf2ec;
  --admin-bg: #f2f2f7;
  --admin-surface: #ffffff;
  --admin-subtle: #f7f7f9;
  --admin-border: #e5e5ea;
  --admin-text: #1c1c1e;
  --admin-muted: #6e6e73;
  --admin-danger: #b3261e;

  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', Roboto, sans-serif;
  font-size: 0.875rem;
}

.adminHeader {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--admin-border);
}

.adminHeader__brand {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--admin-text);
  text-decoration: none;
}

.adminHeader__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-left: auto;
}

.adminHeader__link {
  color: var(--admin-accent);
  text-decoration: none;
  padding: 0.4375rem 0.875rem;
  border-radius: 0.625rem;
  transition: background 0.2s ease;
}

.adminHeader__link--button {
  border: none;
  background: none;
  font: inherit;
  cursor: pointer;
}

.adminHeader__link:hover,
.adminHeader__link.router-link-active {
  background: var(--admin-accent-soft);
}

.adminMain {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.5rem;
}

/* ===== Общие элементы админки ===== */
.adminPage__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.adminPage__title {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025rem;
}

.adminPage__crumbs {
  color: var(--admin-muted);
  margin-bottom: 0.5rem;
}

.adminPage__crumbs a {
  color: var(--admin-accent);
}

.adminCard {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.adminButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0 1.125rem;
  border: none;
  border-radius: 0.625rem;
  background: var(--admin-accent);
  color: #ffffff;
  font: inherit;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.adminButton:hover {
  background: var(--admin-accent-dark);
}

.adminButton:disabled {
  opacity: 0.5;
  cursor: default;
}

.adminButton--ghost {
  background: var(--admin-subtle);
  color: var(--admin-text);
  border: 1px solid var(--admin-border);
}

.adminButton--ghost:hover {
  background: var(--admin-border);
}

.adminButton--danger {
  background: var(--admin-danger);
}

.adminButton--danger:hover {
  background: #8f1e17;
}

.adminInput {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.5625rem 0.75rem;
  background: var(--admin-surface);
  color: var(--admin-text);
  border: 1px solid #e0e0e5;
  border-radius: 0.625rem;
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.adminInput:focus {
  border-color: var(--admin-accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 122, 90, 0.15);
}

.adminInput--invalid {
  border-color: var(--admin-danger);
}

textarea.adminInput {
  min-height: 8rem;
  resize: vertical;
}

.adminMessage {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.adminMessage--error {
  background: #fdecea;
  color: var(--admin-danger);
}

.adminMessage--success {
  background: var(--admin-accent-soft);
  color: var(--admin-accent-dark);
}

@media (prefers-reduced-motion: reduce) {
  .adminShell * {
    transition: none !important;
  }
}
</style>
