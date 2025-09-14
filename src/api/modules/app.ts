import { apiRequest } from '@/api/request'

// 登录
export interface LoginResponseData {
  name: string
  lastLoginTime: string
  departmentType: string
  token: string
  role: string
  departmentName: string
}

export const login = (data: { username: string; password: string }) =>
  apiRequest<LoginResponseData>({
    url: '/auth/login',
    method: 'post',
    data
  })

// 退出登录
export const logout = () =>
  apiRequest<string>({
    url: '/auth/logout',
    method: 'post'
  })

// 修改密码
export const changePassword = (data: {
  oldPassword: string
  newPassword: string
}) =>
  apiRequest<string>({
    url: '/auth/password/change',
    method: 'post',
    data
  })
