import type { PaginatedResponse } from './common'

export interface EmployeeListQueryParams {
  keyword?: string
  departmentId?: number
  roleId?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface StaffDetailResponse {
  staffId: number
  name: string
  phone: string
  idCard: string
  departmentId: number
  departmentName: string
  departmentType: string
  roleId: number
  roleName: string
  description: string
  isExpert: boolean | null
  createTime: string
  status: number // 1-在职，0-不在职
}

export type EmployeeListResponse = PaginatedResponse<StaffDetailResponse>

export interface StaffRoleResponse {
  roleId: number
  roleName: string
  description: string
}

export interface CreateEmployeeRequest {
  name: string
  phone: string
  idCard: string
  departmentId: number
  roleId: number
  description?: string
  accountName: string
  password: string
  isExpert?: boolean
}

export interface UpdateEmployeeDTO {
  departmentId: number
  roleId: number
  name: string
  phone: string
  idCard: string
  isExpert?: boolean
}

export interface ResetPasswordRequest {
  newPassword: string
}
