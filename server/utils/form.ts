import type { H3Event } from 'h3'

/** Разбирает multipart-форму товара: текстовые поля + необязательный файл image. */
export async function readProductForm(event: H3Event) {
  const parts = await readMultipartFormData(event) ?? []
  const fields: Record<string, string> = {}
  let image: { data: Buffer, type?: string } | undefined

  for (const part of parts) {
    if (!part.name) continue
    if (part.name === 'image') {
      if (part.filename && part.data.length) image = { data: part.data, type: part.type }
    }
    else {
      fields[part.name] = part.data.toString('utf8')
    }
  }

  return { fields, image, removeImage: fields.removeImage === 'true' }
}
