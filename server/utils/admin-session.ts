import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

interface AdminSession {
  admin?: boolean
}

function sessionConfig() {
  const { sessionPassword } = useRuntimeConfig()
  if (sessionPassword.length < 32) {
    throw createError({ statusCode: 500, message: 'NUXT_SESSION_PASSWORD не задан или короче 32 символов' })
  }

  return {
    name: 'admin-session',
    password: sessionPassword,
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      // strict: браузер не отправит cookie с чужого сайта — это и есть защита от CSRF
      sameSite: 'strict' as const,
      secure: !import.meta.dev,
      path: '/',
    },
  }
}

export function useAdminSession(event: H3Event) {
  return useSession<AdminSession>(event, sessionConfig())
}

export function checkAdminPassword(candidate: string) {
  const { adminPassword } = useRuntimeConfig()
  if (!adminPassword) return false

  const a = Buffer.from(candidate)
  const b = Buffer.from(adminPassword)
  // Сравнение за постоянное время, чтобы пароль нельзя было подобрать по времени ответа
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function isAdmin(event: H3Event) {
  const session = await useAdminSession(event)
  return session.data.admin === true
}
