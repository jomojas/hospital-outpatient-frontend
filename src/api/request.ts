import axios from 'axios'
import config from '@/config'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig } from 'axios'
import router from '@/router'
import { useAppStore } from '@/store/app'

const request = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 1. 添加认证 token
    const appStore = useAppStore()
    const token = appStore.getCurrentToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 2. 添加时间戳防止缓存 (GET 请求)
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }

    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 成功响应处理
    const { code, data, message, meta } = response.data

    // 根据业务状态码判断
    if (code === 200 || code === 0) {
      // Check if `meta` exists and return an object containing both `data` and `meta`
      if (meta) {
        return { data, meta } // Return both `data` and `meta` when `meta` exists
      } else {
        return data // Return only `data` if `meta` is not present
      }
    } else {
      // 业务错误
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    // 错误响应处理
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    switch (status) {
      case 400:
        ElMessage.error(message || '请求参数错误')
        break

      case 401:
        // ✅ 401 未授权 - token 失效或过期
        // console.log('🔒 Token 失效，清理当前标签页登录状态')
        handleTokenExpired('Token 已过期，请重新登录')
        break

      case 403:
        // ✅ 403 禁止访问 - 权限不足或 token 无效
        // console.log('🚫 访问被拒绝，清理当前标签页登录状态')
        handleTokenExpired('访问被拒绝，请重新登录')
        break

      case 500:
        ElMessage.error(message || '服务器内部错误')
        break

      default:
        // 处理网络错误、超时等情况
        if (error.code === 'ECONNABORTED') {
          ElMessage.error('请求超时，请稍后重试')
        } else if (!error.response) {
          ElMessage.error('网络连接失败，请检查网络')
        } else {
          ElMessage.error(message || '请求失败')
        }
    }

    return Promise.reject(error)
  }
)

// ✅ 新增：处理 token 失效的统一方法
function handleTokenExpired(errorMessage: string) {
  // 使用 store 的 logout 方法清理当前标签页的数据
  const appStore = useAppStore()
  appStore.logout() // 这会清理 sessionStorage 中的 token 和 loginData

  // 显示错误提示
  ElMessage.error(errorMessage)

  // 跳转到登录页，携带当前路径作为重定向参数
  const currentPath = router.currentRoute.value.fullPath
  const redirectPath = currentPath !== '/login' ? currentPath : '/'

  router.push({
    path: '/login',
    query: {
      redirect: redirectPath
    }
  })
}

// 类型安全的请求方法
export function apiRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request(config) as Promise<T>
}

export default request
