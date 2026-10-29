import { getProductImage, updateProduct, validateProduct } from '../../../lib/admin'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const id = parseId(getRouterParam(event, 'id'))
  const oldImage = getProductImage(db, id)
  if (oldImage === undefined) throw createError({ statusCode: 404, message: 'Товар не найден' })

  const { fields, image, removeImage } = await readProductForm(event)
  try {
    const input = validateProduct(db, fields, id)
    const newImage = image ? await saveProductImage(image) : removeImage ? '' : oldImage
    updateProduct(db, id, input, newImage)
    if (newImage !== oldImage) await deleteMediaFile(oldImage)
    return { id }
  }
  catch (error) {
    throw toHttpError(error)
  }
})
