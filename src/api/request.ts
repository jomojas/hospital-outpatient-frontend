import axios from 'axios'
import config from '@/config'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig } from 'axios'
import router from '@/router'

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
    const token = localStorage.getItem('token') // 或从 store 获取
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 2. 添加时间戳防止缓存 (GET 请求)
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }

    // // 3. 开发环境打印请求信息
    // if (import.meta.env.DEV) {
    //   console.log(
    //     '📤 发送请求:',
    //     config.method?.toUpperCase(),
    //     config.url,
    //     config.data || config.params
    //   )
    // }

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
    // console.log('响应拦截器:', response)
    // 成功响应处理
    const { code, data, message } = response.data

    // // 开发环境打印响应信息
    // if (import.meta.env.DEV) {
    //   console.log('📥 收到响应:', response.config.url, response.data)
    // }

    // 根据业务状态码判断
    if (code === 200 || code === 0) {
      // data可以有数据也可以为空
      return data
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
      case 403:
        // token失效或未登录，强制跳转登录页
        localStorage.removeItem('token')
        localStorage.removeItem('loginData')
        router.push('/login') // 强制跳转登录页
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

// 类型安全的请求方法
export function apiRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request(config) as Promise<T>
}

export default request
