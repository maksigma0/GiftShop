export interface CategoryRef {
  id: number
  name: string
  slug: string
}

export interface Category extends CategoryRef {
  description: string
  productCount: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  /** Цена в копейках */
  priceKop: number
  /** Вес в граммах, 0 — не указан */
  weightG: number
  /** URL картинки или пустая строка */
  imageUrl: string
  available: boolean
  category: CategoryRef
  createdAt: string
  updatedAt: string
}

export type SortOrder = '' | 'cheap' | 'expensive'

export interface ProductPage {
  items: Product[]
  total: number
  page: number
  pages: number
}

export interface WishlistResponse {
  /** id без удалённых из базы товаров */
  ids: number[]
  products: Product[]
  totalKop: number
}
