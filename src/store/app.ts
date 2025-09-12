import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem } from '@/config/menu'
import type { LoginResponseData } from '@/api/modules/app'

export const useAppStore = defineStore('app', () => {
  const currentMenu = ref<MenuItem | null>(null)
  const loginData = ref<LoginResponseData | null>(
    JSON.parse(localStorage.getItem('loginData') || 'null')
  )

  const setCurrentMenu = (menu: MenuItem) => {
    currentMenu.value = menu
  }

  const setLoginData = (data: LoginResponseData) => {
    // 数据持久化到 localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('loginData', JSON.stringify(data))
    loginData.value = data
  }

  const logout = () => {
    // 清空 Pinia 中的登录信息
    loginData.value = null
    currentMenu.value = []
    // 清理 localStorage
    localStorage.removeItem('loginData')
    localStorage.removeItem('token')
  }

  return {
    currentMenu,
    setCurrentMenu,
    loginData,
    setLoginData,
    logout
  }
})
