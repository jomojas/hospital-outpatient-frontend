import { apiRequest } from '@/api/request'
import type {
  DispensePendingQueryParams,
  PaginatedResponse,
  DispensePendingItem,
  DispenseRequest,
  PharmacyRecordQueryParams,
  PharmacyRecordItem
} from '@/types/Pharmacy/PharmacyStation'

const BASE_URL = '/pharmacy'

// ✅ =================== 1. 发药相关接口 ===================

/**
 * 获取待发药列表
 * 后端返回的是扁平列表，前端 Store 负责将其按 registrationId 分组
 */
export function getDispensePendingList(params: DispensePendingQueryParams) {
  return apiRequest<PaginatedResponse<DispensePendingItem>>({
    url: `${BASE_URL}/dispense/pending`,
    method: 'GET',
    params
  })
}

/**
 * 执行发药 (支持批量)
 * @param data 包含 prescriptionId 列表的请求体
 */
export function dispenseDrugs(data: DispenseRequest) {
  return apiRequest<void>({
    url: `${BASE_URL}/dispense`,
    method: 'POST',
    data
  })
}

// ✅ =================== 2. 记录查询接口 ===================

/**
 * 获取药房操作记录 (发药/退药)
 */
export function getPharmacyRecords(params: PharmacyRecordQueryParams) {
  return apiRequest<PaginatedResponse<PharmacyRecordItem>>({
    url: `${BASE_URL}/records`,
    method: 'GET',
    params
  })
}
