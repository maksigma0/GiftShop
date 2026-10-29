export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  css: [
    '~/assets/css/variables.css',
    '~/assets/css/base.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Сладкий Мир — кондитерские изделия и новогодние подарки',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lobster&family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
      script: [
        {
          // Тему ставим до отрисовки страницы, иначе будет «вспышка» светлой темы.
          innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`,
          tagPosition: 'head',
        },
      ],
    },
  },

  // Значения переопределяются переменными окружения:
  // NUXT_DATA_DIR, NUXT_ADMIN_PASSWORD, NUXT_SESSION_PASSWORD.
  runtimeConfig: {
    dataDir: './data',
    adminPassword: '',
    sessionPassword: '',
  },

  nitro: {
    preset: 'node-server',
  },
})
