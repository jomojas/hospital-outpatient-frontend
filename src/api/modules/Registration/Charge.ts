import { apiRequest } from '@/api/request'
import type {
  ChargeItemsResponse,
  ChargeQueryParams,
  ChargeSettleRequest,
  DrugCategory,
  ProjectType
} from '@/types/Registration/Charge'

// ✅ 获取缴费项目列表
export function listChargeItems(params?: ChargeQueryParams) {
  return apiRequest<ChargeItemsResponse>({
    url: '/charges/items',
    method: 'GET',
    params
  })
}

// ✅ 结算缴费（批量缴费）
export function settleCharges(data: ChargeSettleRequest) {
  return apiRequest<{}>({
    url: '/charges/settle',
    method: 'POST',
    data
  })
}

// ✅ 获取药品分类列表
export function listDrugCategories() {
  return apiRequest<DrugCategory[]>({
    url: '/dictionaries/drug-categories',
    method: 'GET'
  })
}

// ✅ 获取项目类型列表
export function listProjectTypes() {
  return apiRequest<ProjectType[]>({
    url: '/dictionaries/item-types',
    method: 'GET'
  })
}
