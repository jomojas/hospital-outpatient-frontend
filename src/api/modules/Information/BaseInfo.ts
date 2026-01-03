import { apiRequest } from '@/api/request'
import type {
  CreateDepartmentRequest,
  DepartmentResponse,
  DepartmentRoleResponse,
  DepartmentTypeResponse,
  UpdateDepartmentRequest
} from '@/types/Information/Department'
import type {
  CreateEmployeeRequest,
  EmployeeListQueryParams,
  EmployeeListResponse,
  ResetPasswordRequest,
  StaffDetailResponse,
  StaffRoleResponse,
  UpdateEmployeeDTO
} from '@/types/Information/Employee'
import type {
  CreateRegistrationLevelRequest,
  RegistrationLevelResponse,
  SetRegistrationPriceRequest,
  UpdateRegistrationLevelStatusParams
} from '@/types/Information/RegistrationLevel'

const cleanParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  )
}

// =============== 科室管理 ===============

export function listDepartmentTypes() {
  return apiRequest<DepartmentTypeResponse[]>({
    url: '/departments/types',
    method: 'GET'
  })
}

export function listDepartments(params?: { type?: string }) {
  return apiRequest<DepartmentResponse[]>({
    url: '/departments',
    method: 'GET',
    params: params ? cleanParams(params) : undefined
  })
}

export function listAllDepartments(params?: { type?: string }) {
  return apiRequest<DepartmentResponse[]>({
    url: '/departments/all',
    method: 'GET',
    params: params ? cleanParams(params) : undefined
  })
}

export function listDepartmentRoles(departmentId: number) {
  return apiRequest<DepartmentRoleResponse[]>({
    url: `/departments/${departmentId}/roles`,
    method: 'GET'
  })
}

export function createDepartment(data: CreateDepartmentRequest) {
  return apiRequest<void>({
    url: '/departments',
    method: 'POST',
    data
  })
}

export function updateDepartment(
  departmentId: number,
  data: UpdateDepartmentRequest
) {
  return apiRequest<void>({
    url: `/departments/${departmentId}`,
    method: 'PUT',
    data
  })
}

export function deleteDepartment(departmentId: number) {
  return apiRequest<void>({
    url: `/departments/${departmentId}`,
    method: 'DELETE'
  })
}

export function restoreDepartment(departmentId: number) {
  return apiRequest<void>({
    url: `/departments/${departmentId}/restore`,
    method: 'PUT'
  })
}

// =============== 员工管理 ===============

export function listEmployees(params: EmployeeListQueryParams = {}) {
  return apiRequest<EmployeeListResponse>({
    url: '/employees',
    method: 'GET',
    params: cleanParams(params as Record<string, unknown>)
  })
}

export function createEmployee(data: CreateEmployeeRequest) {
  return apiRequest<void>({
    url: '/employees',
    method: 'POST',
    data
  })
}

export function getEmployeeAccountName(roleId: number) {
  return apiRequest<string>({
    url: '/employees/accountName',
    method: 'GET',
    params: { roleId }
  })
}

export function updateEmployee(staffId: number, data: UpdateEmployeeDTO) {
  return apiRequest<void>({
    url: `/employees/${staffId}`,
    method: 'PUT',
    data
  })
}

export function deleteEmployee(staffId: number) {
  return apiRequest<void>({
    url: `/employees/${staffId}`,
    method: 'DELETE'
  })
}

export function restoreEmployee(staffId: number) {
  return apiRequest<void>({
    url: `/employees/${staffId}/restore`,
    method: 'PUT'
  })
}

export function getEmployeeDetail(staffId: number) {
  return apiRequest<StaffDetailResponse>({
    url: `/employees/${staffId}`,
    method: 'GET'
  })
}

export function resetEmployeePassword(
  staffId: number,
  data: ResetPasswordRequest
) {
  return apiRequest<void>({
    url: `/employees/${staffId}/reset-password`,
    method: 'PUT',
    data
  })
}

export function listStaffRoles() {
  return apiRequest<StaffRoleResponse[]>({
    url: '/employees/roles',
    method: 'GET'
  })
}

// =============== 挂号级别管理 ===============

export function listRegistrationLevels() {
  return apiRequest<RegistrationLevelResponse[]>({
    url: '/admin/registration/levels',
    method: 'GET'
  })
}

export function updateRegistrationPrices(data: SetRegistrationPriceRequest) {
  return apiRequest<void>({
    url: '/admin/registration/prices',
    method: 'PUT',
    data
  })
}

export function createRegistrationLevel(data: CreateRegistrationLevelRequest) {
  return apiRequest<void>({
    url: '/admin/registration/levels',
    method: 'POST',
    data
  })
}

export function updateRegistrationLevelStatus(
  params: UpdateRegistrationLevelStatusParams
) {
  return apiRequest<void>({
    url: `/admin/registration/levels/${params.code}/status`,
    method: 'PATCH',
    params: { status: params.status }
  })
}
