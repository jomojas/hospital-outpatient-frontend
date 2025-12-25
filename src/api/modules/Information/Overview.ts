import { apiRequest } from '@/api/request'
import type {
  RegistrationsByDepartmentItem,
  RegistrationsByDoctorItem,
  RegistrationsTrendResponse,
  RegistrationsTypeBreakdownItem,
  RevenueByDepartmentResponse,
  RevenueByTypeResponse,
  RevenueTrendResponse,
  RefundTrendResponse,
  StatsPeriodQuery
} from '@/types/Information/Stats'

export function getRegistrationsTrend(params: StatsPeriodQuery) {
  return apiRequest<RegistrationsTrendResponse>({
    url: '/stats/registrations/trend',
    method: 'GET',
    params
  })
}

export function getRegistrationsTypeBreakdown(params: StatsPeriodQuery) {
  return apiRequest<RegistrationsTypeBreakdownItem[]>({
    url: '/stats/registrations/type-breakdown',
    method: 'GET',
    params
  })
}

export function getRegistrationsByDepartment(params: StatsPeriodQuery) {
  return apiRequest<RegistrationsByDepartmentItem[]>({
    url: '/stats/registrations/by-department',
    method: 'GET',
    params
  })
}

export function getRegistrationsByDoctor(params: StatsPeriodQuery) {
  return apiRequest<RegistrationsByDoctorItem[]>({
    url: '/stats/registrations/by-doctor',
    method: 'GET',
    params
  })
}

export function getRevenueTrend(params: StatsPeriodQuery) {
  return apiRequest<RevenueTrendResponse>({
    url: '/stats/revenue/trend',
    method: 'GET',
    params
  })
}

export function getRevenueByType(params: StatsPeriodQuery) {
  return apiRequest<RevenueByTypeResponse>({
    url: '/stats/revenue/by-type',
    method: 'GET',
    params
  })
}

export function getRevenueByDepartment(params: StatsPeriodQuery) {
  return apiRequest<RevenueByDepartmentResponse>({
    url: '/stats/revenue/by-department',
    method: 'GET',
    params
  })
}

export function getRefundTrend(params: StatsPeriodQuery) {
  return apiRequest<RefundTrendResponse>({
    url: '/stats/refund/trend',
    method: 'GET',
    params
  })
}
