<script setup lang="ts">
const year = new Date().getFullYear()
// Ссылки строим по реальным категориям, чтобы они не вели на 404
const { data: categories } = await useFetch('/api/categories', { key: 'categories' })
</script>

<template>
  <footer class="siteFooter">
    <div class="siteFooter__grid">
      <div class="siteFooter__brand">
        <div class="siteFooter__logo">Сладкий Мир</div>
        <p class="siteFooter__brandText">Магазин кондитерских изделий и новогодних подарков в городе Барань.</p>
      </div>

      <div class="siteFooter__col">
        <h3 class="siteFooter__title">Каталог</h3>
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/category/${category.slug}`"
          class="siteFooter__link"
        >
          {{ category.name }}
        </NuxtLink>
      </div>

      <div class="siteFooter__col">
        <h3 class="siteFooter__title">Контакты</h3>
        <p class="siteFooter__text">город Барань, улица Оршанская, павильон «Сладкий Мир»</p>
        <div class="siteFooter__phones">
          <a href="tel:+375296953455" class="siteFooter__link">+375 29 695-34-55</a>
          <a href="tel:+375292175643" class="siteFooter__link">+375 29 217-56-43</a>
        </div>
      </div>

      <div class="siteFooter__col">
        <h3 class="siteFooter__title">Режим работы</h3>
        <p class="siteFooter__text">ПН-ПТ: 9:00 - 20:00</p>
        <p class="siteFooter__text">СБ-ВС: 9:00 - 18:00</p>
      </div>
    </div>

    <div class="siteFooter__bottom">
      <p>© {{ year }} Сладкий Мир. Все права защищены.</p>
    </div>
  </footer>
</template>

<style>
.siteFooter {
  background: var(--text);
  color: var(--bg);
  padding: 4rem 1.25rem 2rem;
  margin-top: 5rem;
  transition: var(--transition);
}

[data-theme="dark"] .siteFooter {
  background: #0C1117;
  color: var(--text);
}

.siteFooter__grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1.3fr 1fr;
  gap: 2.5rem;
  max-width: 80rem;
  margin: 0 auto;
}

.siteFooter__brand {
  max-width: 23.75rem;
}

.siteFooter__logo {
  font-family: var(--font-heading);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: 0.03125rem;
  color: var(--gold);
  margin-bottom: 0.875rem;
}

.siteFooter__brandText {
  font-size: 0.875rem;
  line-height: 1.65;
  opacity: 0.75;
}

.siteFooter__title {
  font-family: var(--font-heading);
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: 0.0125rem;
  margin-bottom: 1rem;
  color: var(--gold);
}

.siteFooter__text {
  font-size: 0.875rem;
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.siteFooter__link {
  color: var(--bg);
  opacity: 0.75;
  text-decoration: none;
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  transition: var(--transition);
}

[data-theme="dark"] .siteFooter__link {
  color: var(--text);
}

.siteFooter__link:hover {
  opacity: 1;
  color: var(--gold);
  transform: translateX(2px);
}

.siteFooter__phones {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.625rem;
}

.siteFooter__phones .siteFooter__link {
  margin-bottom: 0;
}

.siteFooter__bottom {
  max-width: 80rem;
  margin: 2.5rem auto 0;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.8125rem;
  opacity: 0.6;
  text-align: center;
}

[data-theme="dark"] .siteFooter__bottom {
  border-top-color: rgba(255, 255, 255, 0.08);
  color: #8B949E;
}

@media (min-width: 48.0625rem) and (max-width: 64rem) {
  .siteFooter__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 48rem) {
  .siteFooter__grid {
    grid-template-columns: 1fr;
  }
}
</style>
