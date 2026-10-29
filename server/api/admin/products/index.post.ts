import { createProduct, validateProduct } from '../../../lib/admin'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const { fields, image } = await readProductForm(event)
  try {
    const input = validateProduct(db, fields)
    const imagePath = image ? await saveProductImage(image) : ''
    return { id: createProduct(db, input, imagePath) }
  }
  catch (error) {
    throw toHttpError(error)
  }
})
