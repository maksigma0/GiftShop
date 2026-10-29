/**
 * Избранное — список id товаров в cookie «wishlist».
 * Cookie читает и сервер (для отрисовки страницы), и браузер.
 * useState нужен, чтобы шапка и карточки видели одно и то же значение.
 */
export function useWishlist() {
  const cookie = useCookie<number[]>('wishlist', {
    default: () => [],
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const ids = useState<number[]>('wishlist', () => sanitize(cookie.value))

  function save(next: number[]) {
    ids.value = next
    cookie.value = next
  }

  function has(id: number) {
    return ids.value.includes(id)
  }

  function toggle(id: number) {
    save(has(id) ? ids.value.filter(item => item !== id) : [...ids.value, id])
  }

  return {
    ids: readonly(ids),
    count: computed(() => ids.value.length),
    has,
    toggle,
    /** Сервер вернул актуальный список (без удалённых товаров) — синхронизируемся. */
    replace: save,
  }
}

function sanitize(value: unknown) {
  return Array.isArray(value)
    ? value.filter((id): id is number => Number.isSafeInteger(id) && id > 0)
    : []
}
