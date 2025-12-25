import { apiRequest } from '@/api/request'
import type {
  BatchSetQuotaRequest,
  CopyScheduleRequest,
  DoctorScheduleResponse,
  ScheduleQueryDTO,
  SetQuotaRequest
} from '@/types/Information/Schedule'

export function listDoctorSchedules(params: ScheduleQueryDTO) {
  return apiRequest<DoctorScheduleResponse[]>({
    url: '/schedules',
    method: 'GET',
    params
  })
}

export function setDoctorQuota(data: SetQuotaRequest) {
  return apiRequest<void>({
    url: '/schedules/quota',
    method: 'PUT',
    data
  })
}

export function batchSetDoctorQuota(data: BatchSetQuotaRequest) {
  return apiRequest<void>({
    url: '/schedules/quota/batch',
    method: 'POST',
    data
  })
}

export function copyDoctorSchedule(data: CopyScheduleRequest) {
  return apiRequest<void>({
    url: '/schedules/copy',
    method: 'POST',
    data
  })
}
