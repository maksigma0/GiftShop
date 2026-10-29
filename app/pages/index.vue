<script setup lang="ts">
const reasons = [
  { icon: '🤲', title: 'Ручная работа', text: 'Создаем новогодние подарки вручную на любой вкус и бюджет.' },
  { icon: '🍬', title: 'Широкий ассортимент', text: 'Используем широкий ассортимент конфет ведущих фабрик белорусских производителей и стран СНГ.' },
  { icon: '🎁', title: 'Красивая упаковка', text: 'Новогодние наборы представлены в ярких подарочных упаковках.' },
  { icon: '🚚', title: 'Доставка', text: 'Свяжитесь с нами для уточнения условий доставки.' },
]
</script>

<template>
  <section class="homeHero rainbow">
    <div class="container homeHero__inner">
      <div class="homeHero__image">
        <img class="homeHero__img" src="/images/giftshop.jpg" alt="Магазин «Сладкий Мир»">
      </div>
      <div class="homeHero__text">
        <h1 class="homeHero__title">Сладкий Мир</h1>
        <p class="homeHero__lead">
          Собираем для вас новогодние подарки и кондитерские наборы — вручную и с теплом. Особое внимание уделяем
          белорусским производителям: проверенные ингредиенты, родные вкусы и яркая праздничная упаковка. Поможем
          выбрать подарок для близких, друзей, коллег и партнёров.
        </p>
        <NuxtLink class="homeHero__button" to="/catalog">Перейти в каталог</NuxtLink>
      </div>
    </div>
  </section>

  <section class="homeSection">
    <div class="container">
      <h2 class="homeSection__title">Почему мы?</h2>
      <div class="homeWhy">
        <div v-for="reason in reasons" :key="reason.title" class="homeWhy__card">
          <span class="homeWhy__icon" aria-hidden="true">{{ reason.icon }}</span>
          <h3 class="homeWhy__title">{{ reason.title }}</h3>
          <p class="homeWhy__text">{{ reason.text }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="homeSection homeSection--about">
    <div class="container homeAbout">
      <h2 class="homeSection__title">О нас</h2>
      <p class="homeAbout__text">
        Мы — команда, которая создаёт новогодние подарки и кондитерские наборы с заботой о качестве и праздничном
        настроении. Наш магазин находится в городе Барань, и мы с особым вниманием относимся к белорусским
        производителям: именно их проверенные ингредиенты, любимые с детства вкусы и достойные упаковки становятся
        основой большинства наших наборов. При этом мы не ограничиваемся только локальным рынком — дополняем боксы
        лучшими позициями от других партнёров, чтобы выбор был шире. Мы собираем подарки вручную, следим за свежестью
        и помогаем подобрать сюрприз для близких, коллег или партнёров — чтобы Новый год стал теплее, а ваши подарки
        приносили радость с первого взгляда и до последней конфеты.
      </p>
    </div>
  </section>
</template>

<style>
.homeHero {
  padding: 4rem 0 4.5rem;
}

.homeHero__inner {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 3rem;
  align-items: center;
}

.homeHero__image {
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-hover);
}

.homeHero__img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.homeHero__title {
  font-family: var(--font-logo);
  font-size: 4rem;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: 0.03125rem;
  /* Тёмный текст поверх пастельной радуги — читается в обеих темах */
  color: #3A1020;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55), 0 8px 22px rgba(58, 16, 32, 0.18);
  margin-bottom: 1rem;
}

.homeHero__lead {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #5C3A4A;
  max-width: 30rem;
  margin-bottom: 1.75rem;
}

.homeHero__button {
  display: inline-block;
  padding: 1rem 2.25rem;
  background: var(--primary);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  box-shadow: 0 8px 20px rgba(156, 37, 66, 0.25);
}

.homeHero__button:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(156, 37, 66, 0.32);
}

.homeSection {
  padding: 4rem 0;
}

.homeSection--about {
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.homeSection__title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 2rem;
  color: var(--text);
  text-align: center;
  margin-bottom: 2.25rem;
  position: relative;
  padding-bottom: 0.75rem;
}

.homeSection__title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 3.5rem;
  height: 3px;
  border-radius: 2px;
  background: var(--gold);
}

.homeWhy {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.homeWhy__card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.75rem 1.375rem;
  text-align: center;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.homeWhy__card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(156, 37, 66, 0.25);
}

.homeWhy__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  font-size: 2rem;
  background: var(--surface-hover);
  border-radius: 50%;
  margin-bottom: 1rem;
}

.homeWhy__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.homeWhy__text {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.homeAbout {
  max-width: 45rem;
  margin: 0 auto;
  text-align: center;
}

.homeAbout__text {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

@media (max-width: 64rem) {
  .homeWhy {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 48rem) {
  .homeHero__inner {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }

  .homeHero__title {
    font-size: 3rem;
  }

  .homeWhy {
    grid-template-columns: 1fr;
  }

  .homeSection {
    padding: 3rem 0;
  }
}
</style>
