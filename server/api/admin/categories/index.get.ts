import { listCategories } from '../../../lib/catalog'

export default defineEventHandler(() => listCategories(useDb()))
