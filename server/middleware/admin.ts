/** Все /api/admin/* кроме входа доступны только после логина. */
export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]!
  if (!path.startsWith('/api/admin/') || path === '/api/admin/login') return

  if (!(await isAdmin(event))) {
    throw createError({ statusCode: 401, message: 'Нужно войти в админку' })
  }
})
