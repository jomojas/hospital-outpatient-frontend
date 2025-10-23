import { apiRequest } from '@/api/request'
import type {
  RegistrationQueryParams,
  RegistrationRecordsResponse,
  BasicDoctor
} from '@/types/Registration/Refund'

export function getRegistrationRecords(params?: RegistrationQueryParams) {
  return apiRequest<RegistrationRecordsResponse>({
    url: '/registrations',
    method: 'GET',
    params
  })
}

// ✅ 添加取消挂号的请求函数
export function cancelRegistration(id: number) {
  return apiRequest<{ code: number; message: string; data: null }>({
    url: `/registrations/${id}/cancel`,
    method: 'POST'
  })
}

// 获取所有医生列表接口
export function listDoctors() {
  return apiRequest<BasicDoctor[]>({
    url: '/doctors/all',
    method: 'GET'
  })
}
