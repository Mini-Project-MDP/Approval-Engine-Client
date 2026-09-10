export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface PagedData<T> {
  items: T[]
  meta: PageMeta
}
