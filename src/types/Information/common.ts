export type Money = number | string

export interface PaginationMeta {
  page: number
  size: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export type PeriodType = 'month' | 'season' | 'year' | 'all' | 'auto'
