import type { Money, PaginatedResponse } from './common'

export type DrugUnitCode =
  | 'BOX'
  | 'BOTTLE'
  | 'PIECE'
  | 'CAPSULE'
  | (string & {})

export interface DrugCategoryResponse {
  categoryId: number
  categoryName: string
  description: string
}

export interface DrugDetailResponse {
  drugId: string
  drugCode: string
  drugName: string
  categoryId: number
  categoryName: string
  categoryDescription: string
  productionDate: string
  shelfLife: string
  stockQuantity: Money
  specification: string
  unit: DrugUnitCode
  retailPrice: Money
  description: string
  manufacturer: string
}

export interface DrugCatalogQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  categoryId?: number
}

export type DrugCatalogResponse = PaginatedResponse<DrugDetailResponse>

export interface CreateDrugRequest {
  drugCode: string
  drugName: string
  categoryId: number
  productionDate: string
  shelfLife: string
  stockQuantity: Money
  specification: string
  unit: DrugUnitCode
  retailPrice: Money
  description: string
  manufacturer: string
}

export interface UpdateDrugRequest {
  drugCode: string
  drugName: string
  categoryId: number
  productionDate: string
  shelfLife: string
  specification: string
  unit: DrugUnitCode
  retailPrice: Money
  description: string
  manufacturer: string
}
