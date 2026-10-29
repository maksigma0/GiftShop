import { FetchError } from 'ofetch'

/** Ошибки по полям из ответа 422 + общее сообщение для остальных ошибок. */
export function useFormErrors() {
  const fields = ref<Record<string, string>>({})
  const message = ref('')

  function reset() {
    fields.value = {}
    message.value = ''
  }

  function handle(error: unknown) {
    reset()
    if (error instanceof FetchError && error.statusCode === 422) {
      fields.value = error.data?.data?.fields ?? {}
      message.value = 'Проверьте поля формы'
    }
    else if (error instanceof FetchError && error.statusCode === 401) {
      navigateTo('/admin/login')
    }
    else {
      message.value = error instanceof FetchError ? (error.data?.message ?? 'Ошибка сервера') : 'Ошибка сети'
    }
  }

  return { fields, message, reset, handle }
}
