export interface DepartmentTypeResponse {
  type: string
  typeName: string
}

export interface DepartmentResponse {
  departmentId: number
  departmentName: string
  type: string
  typeName: string
  status: number // 0-禁用，1-启用
}

export interface DepartmentRoleResponse {
  roleId: number
  roleName: string
  description: string
}

export interface CreateDepartmentRequest {
  departmentName: string
  type: string
  roleIds: number[]
}

export interface UpdateDepartmentRequest {
  departmentName: string
  type: string
  roleIds: number[]
}
