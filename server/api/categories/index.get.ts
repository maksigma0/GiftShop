import { listCategories } from '../../lib/catalog'

export default defineEventHandler(() => {
  return listCategories(useDb())
})
