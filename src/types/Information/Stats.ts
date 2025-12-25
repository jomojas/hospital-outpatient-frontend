import type { PeriodType } from './common'

export interface StatsPeriodQuery {
  period: PeriodType
  startDate?: string
  endDate?: string
}

export interface TrendResponse {
  xAxis: string[]
  series: number[]
}

export type RegistrationsTrendResponse = TrendResponse
export type RevenueTrendResponse = TrendResponse
export type RefundTrendResponse = TrendResponse

export interface NameValueItem {
  name: string
  value: number
}

export type RegistrationsTypeBreakdownItem = NameValueItem
export type RegistrationsByDepartmentItem = NameValueItem
export type RegistrationsByDoctorItem = NameValueItem

export interface RevenueByTypeResponse {
  items: Array<{
    type: string
    amount: number
  }>
}

export interface RevenueByDepartmentResponse {
  items: Array<{
    departmentId: number
    departmentName: string
    amount: number
  }>
}
