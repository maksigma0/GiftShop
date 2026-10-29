export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: unknown }>(event)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!checkAdminPassword(password)) {
    // Небольшая пауза делает перебор паролей медленнее
    await new Promise(resolve => setTimeout(resolve, 700))
    throw createError({ statusCode: 401, message: 'Неверный пароль' })
  }

  const session = await useAdminSession(event)
  await session.update({ admin: true })
  return { ok: true }
})
