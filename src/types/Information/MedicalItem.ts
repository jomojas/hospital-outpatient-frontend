import type { Money, PaginatedResponse } from './common'

export interface MedicalItemQueryParams {
  keyword?: string
  status?: 0 | 1
  departmentId?: number
  page?: number
  pageSize?: number
}

export interface MedicalItemResponse {
  itemId: number
  itemCode: string
  itemName: string
  itemType: string
  itemTypeLabel: string
  price: Money
  description: string
  departmentId: number
  departmentName: string
  status: 0 | 1
}

export type MedicalItemListResponse = PaginatedResponse<MedicalItemResponse>

export interface CreateMedicalItemRequest {
  itemCode: string
  itemName: string
  itemType: string
  price: Money
  departmentId: number
  description?: string
}

export interface UpdateMedicalItemRequest {
  itemCode: string
  itemName: string
  itemType: string
  price: Money
  departmentId: number
  description?: string
}
