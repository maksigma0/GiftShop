<script setup lang="ts">
const route = useRoute()
const { count } = useWishlist()

const search = ref('')
watch(() => route.query.q, (q) => {
  search.value = typeof q === 'string' ? q : ''
}, { immediate: true })

function submit() {
  const q = search.value.trim()
  navigateTo({ path: '/catalog', query: q ? { q } : {} })
}
</script>

<template>
  <header class="siteHeader">
    <div class="container siteHeader__inner">
      <NuxtLink to="/" class="siteHeader__logo">Сладкий Мир</NuxtLink>

      <nav class="siteHeader__nav">
        <NuxtLink to="/" class="siteHeader__navLink">Главная</NuxtLink>
        <NuxtLink to="/catalog" class="siteHeader__navLink">Каталог</NuxtLink>
      </nav>

      <!-- action/method оставлены: без JavaScript форма тоже работает -->
      <form class="siteHeader__search" action="/catalog" method="get" role="search" @submit.prevent="submit">
        <input
          v-model="search"
          class="siteHeader__searchInput"
          type="search"
          name="q"
          placeholder="Поиск по названию"
          aria-label="Поиск по названию товара"
        >
        <button class="siteHeader__searchButton" type="submit">Найти</button>
      </form>

      <div class="siteHeader__actions">
        <SiteThemeToggle />
        <NuxtLink to="/wishlist" class="siteHeader__wishlist" title="Избранное" aria-label="Избранное">
          ♡
          <span v-if="count" class="siteHeader__badge">{{ count }}</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style>
.siteHeader {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid var(--border);
  transition: var(--transition);
}

[data-theme="dark"] .siteHeader {
  background: rgba(16, 22, 29, 0.85);
}

.siteHeader__inner {
  display: flex;
  align-items: center;
  gap: 1.125rem;
  min-height: 4.25rem;
}

.siteHeader__logo {
  font-family: var(--font-logo);
  font-size: 2.25rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.03125rem;
  color: var(--heading-color);
  text-decoration: none;
  white-space: nowrap;
  transition: var(--transition);
}

.siteHeader__logo:hover {
  color: var(--heading-color-hover);
  transform: scale(1.02);
}

.siteHeader__nav {
  display: flex;
  gap: 1.375rem;
}

.siteHeader__navLink {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  opacity: 0.9;
  transition: var(--transition);
}

.siteHeader__navLink::after {
  content: '';
  position: absolute;
  bottom: -0.25rem;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gold);
  transition: var(--transition);
}

.siteHeader__navLink:hover::after {
  width: 100%;
}

.siteHeader__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.siteHeader__searchInput {
  width: 13.75rem;
  padding: 0.5625rem 0.875rem;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: var(--transition);
}

.siteHeader__searchInput:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(156, 37, 66, 0.16);
}

.siteHeader__searchButton {
  padding: 0.5625rem 1rem;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: var(--primary);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: var(--transition);
}

.siteHeader__searchButton:hover {
  background: var(--primary-light);
}

.siteHeader__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.siteHeader__wishlist {
  position: relative;
  color: var(--text);
  text-decoration: none;
  font-size: 1.375rem;
  transition: var(--transition);
}

.siteHeader__wishlist:hover {
  transform: scale(1.1);
  color: var(--gold);
}

.siteHeader__badge {
  position: absolute;
  top: -0.375rem;
  right: -0.375rem;
  background: var(--accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--surface);
}

@media (max-width: 48rem) {
  .siteHeader__inner {
    flex-wrap: wrap;
  }

  .siteHeader__logo {
    font-size: 1.75rem;
  }

  .siteHeader__nav {
    margin-top: 0.625rem;
  }

  .siteHeader__search {
    order: 5;
    width: 100%;
    margin-left: 0;
  }

  .siteHeader__searchInput {
    flex: 1;
    width: auto;
  }
}
</style>
