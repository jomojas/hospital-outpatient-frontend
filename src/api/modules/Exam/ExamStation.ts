import { apiRequest } from '@/api/request'
import type {
  TechApplyQueryParams,
  PaginatedResponse,
  TechApplyItem,
  SubmitResultRequest,
  TechRecordQueryParams,
  TechRecordItem
} from '@/types/Tech/TechStation'

const BASE_URL = '/exam'

export const ExamApi = {
  getApplies(params: TechApplyQueryParams) {
    return apiRequest<PaginatedResponse<TechApplyItem>>({
      url: `${BASE_URL}/applies`,
      method: 'GET',
      params
    })
  },
  executeItem(applyId: number) {
    return apiRequest<void>({
      url: `${BASE_URL}/applies/${applyId}/execute`,
      method: 'POST'
    })
  },
  submitResult(applyId: number, data: SubmitResultRequest) {
    return apiRequest<void>({
      url: `${BASE_URL}/applies/${applyId}/result`,
      method: 'POST',
      data
    })
  },
  getRecords(params: TechRecordQueryParams) {
    return apiRequest<PaginatedResponse<TechRecordItem>>({
      url: `${BASE_URL}/records`,
      method: 'GET',
      params
    })
  }
}
