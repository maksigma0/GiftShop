// Сюда пускает только server/middleware/admin.ts — значит, вход выполнен.
export default defineEventHandler(() => ({ admin: true }))
