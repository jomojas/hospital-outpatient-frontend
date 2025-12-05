import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem } from '@/config/menu'
import type { LoginResponseData } from '@/api/modules/app'

export const useAppStore = defineStore('app', () => {
  const currentMenu = ref<MenuItem | null>(null)

  // ✅ 从 sessionStorage 初始化登录数据
  const loginData = ref<LoginResponseData | null>(
    JSON.parse(sessionStorage.getItem('loginData') || 'null')
  )

  const setCurrentMenu = (menu: MenuItem) => {
    currentMenu.value = menu
  }

  const setLoginData = (data: LoginResponseData) => {
    // ✅ 数据持久化到 sessionStorage（标签页隔离）
    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('loginData', JSON.stringify(data))
    loginData.value = data
  }

  const logout = () => {
    // 清空 Pinia 中的登录信息
    loginData.value = null
    currentMenu.value = null

    // ✅ 清理 sessionStorage（只影响当前标签页）
    sessionStorage.removeItem('loginData')
    sessionStorage.removeItem('token')
  }

  const changePassword = () => {
    console.log('🔒 用户修改密码，清理当前标签页数据')

    // 清空 Pinia 中的登录信息
    loginData.value = null
    currentMenu.value = null

    // ✅ 清理 sessionStorage（只影响当前标签页）
    sessionStorage.removeItem('loginData')
    sessionStorage.removeItem('token')
  }

  // ✅ 新增：获取当前用户 token
  const getCurrentToken = (): string | null => {
    return sessionStorage.getItem('token')
  }

  // ✅ 新增：检查登录状态
  const isLoggedIn = (): boolean => {
    return !!loginData.value && !!sessionStorage.getItem('token')
  }

  return {
    currentMenu,
    setCurrentMenu,
    loginData,
    setLoginData,
    logout,
    changePassword,
    getCurrentToken,
    isLoggedIn
  }
})
