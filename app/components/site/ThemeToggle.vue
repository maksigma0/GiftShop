<script setup lang="ts">
// Тему выставляет скрипт в <head> (nuxt.config.ts) ещё до отрисовки.
// Здесь только переключаем атрибут и запоминаем выбор.
function toggle() {
  const html = document.documentElement
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  html.setAttribute('data-theme', next)
  try {
    localStorage.setItem('theme', next)
  }
  catch {
    // приватный режим браузера — просто не запоминаем
  }
}
</script>

<template>
  <button class="themeToggle" type="button" title="Сменить тему" aria-label="Сменить тему" @click="toggle">
    <span class="themeToggle__icon themeToggle__icon--sun">☀️</span>
    <span class="themeToggle__icon themeToggle__icon--moon">🌙</span>
  </button>
</template>

<style>
.themeToggle {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.themeToggle:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-hover);
}

.themeToggle__icon {
  position: absolute;
  transition: var(--transition);
}

/* В светлой теме показываем луну (переключить на тёмную), в тёмной — солнце */
.themeToggle__icon--sun {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

[data-theme="dark"] .themeToggle__icon--sun {
  opacity: 1;
  transform: rotate(0) scale(1);
}

[data-theme="dark"] .themeToggle__icon--moon {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}
</style>
