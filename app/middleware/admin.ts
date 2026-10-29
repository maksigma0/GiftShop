/** Страницы /admin/* без входа отправляют на /admin/login. */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  const loggedIn = await useRequestFetch()('/api/admin/me').then(() => true, () => false)
  if (!loggedIn) {
    return navigateTo({ path: '/admin/login', query: { next: to.fullPath } })
  }
})
