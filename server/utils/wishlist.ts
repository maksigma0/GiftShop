import type { H3Event } from 'h3'

export const WISHLIST_LIMIT = 100

/** Читает id из cookie «wishlist». Любой мусор в cookie просто игнорируется. */
export function readWishlistCookie(event: H3Event) {
  let parsed: unknown
  try {
    parsed = JSON.parse(getCookie(event, 'wishlist') ?? '[]')
  }
  catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const ids = parsed.filter((id): id is number => Number.isSafeInteger(id) && id > 0)
  return [...new Set(ids)].slice(0, WISHLIST_LIMIT)
}
