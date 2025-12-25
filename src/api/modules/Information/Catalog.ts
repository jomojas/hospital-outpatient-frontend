import { apiRequest } from '@/api/request'
import type {
  CreateDrugRequest,
  DrugCatalogQueryParams,
  DrugCatalogResponse,
  DrugCategoryResponse,
  DrugUnitCode,
  UpdateDrugRequest
} from '@/types/Information/DrugCatalog'
import type {
  CreateMedicalItemRequest,
  MedicalItemListResponse,
  MedicalItemQueryParams,
  UpdateMedicalItemRequest
} from '@/types/Information/MedicalItem'

const cleanParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  )
}

// =============== 字典（下拉选项） ===============

export function listDrugCategories() {
  return apiRequest<DrugCategoryResponse[]>({
    url: '/dictionaries/drug-categories',
    method: 'GET'
  })
}

export function listDrugUnits() {
  return apiRequest<DrugUnitCode[]>({
    url: '/dictionaries/drug-units',
    method: 'GET'
  })
}

export function listItemTypes() {
  return apiRequest<
    Array<{
      type: string
      typeName: string
    }>
  >({
    url: '/dictionaries/item-types',
    method: 'GET'
  })
}

// =============== 药品目录（列表/分页） ===============

export function listDrugCatalog(params: DrugCatalogQueryParams = {}) {
  return apiRequest<DrugCatalogResponse>({
    url: '/catalog/drugs',
    method: 'GET',
    params: cleanParams(params as Record<string, unknown>)
  })
}

// =============== 药品维护（新增/编辑/上下架） ===============

export function createDrug(data: CreateDrugRequest) {
  return apiRequest<void>({
    url: '/drugs',
    method: 'POST',
    data
  })
}

export function updateDrug(drugId: string | number, data: UpdateDrugRequest) {
  return apiRequest<void>({
    url: `/drugs/${drugId}`,
    method: 'PUT',
    data
  })
}

export function toggleDrugStatus(drugId: string | number) {
  return apiRequest<void>({
    url: `/drugs/${drugId}/toggle`,
    method: 'PATCH'
  })
}

// =============== 医疗项目（列表/分页 + 新增/编辑/启停） ===============

export function listMedicalItems(params: MedicalItemQueryParams = {}) {
  return apiRequest<MedicalItemListResponse>({
    url: '/items',
    method: 'GET',
    params: cleanParams(params as Record<string, unknown>)
  })
}

export function createMedicalItem(data: CreateMedicalItemRequest) {
  return apiRequest<void>({
    url: '/items',
    method: 'POST',
    data
  })
}

export function updateMedicalItem(
  itemId: number,
  data: UpdateMedicalItemRequest
) {
  return apiRequest<void>({
    url: `/items/${itemId}`,
    method: 'PUT',
    data
  })
}

export function toggleMedicalItemStatus(itemId: number) {
  return apiRequest<void>({
    url: `/items/${itemId}/toggle`,
    method: 'PATCH'
  })
}
