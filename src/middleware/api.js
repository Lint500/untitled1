// 自己控制中间件 - HTTP 请求拦截器
import axios from 'axios'

// 创建自定义 axios 实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 token、日志等
apiClient.interceptors.request.use(
  (config) => {
    console.log('[中间件] 发送请求:', config.url)
    
    // 从 localStorage 或状态管理获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求时间戳（避免缓存）
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    
    return config
  },
  (error) => {
    console.error('[中间件] 请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误、刷新 token 等
apiClient.interceptors.response.use(
  (response) => {
    console.log('[中间件] 收到响应:', response.config.url)
    return response.data
  },
  (error) => {
    console.error('[中间件] 响应错误:', error.response?.status, error.message)
    
    // 401 未授权，跳转登录
    if (error.response?.status === 401) {
      window.location.hash = '/login'
    }
    
    // 403 权限不足
    if (error.response?.status === 403) {
      console.warn('[中间件] 权限不足')
    }
    
    // 500 服务器错误
    if (error.response?.status === 500) {
      console.error('[中间件] 服务器错误')
    }
    
    return Promise.reject(error)
  }
)

// 导出 API 方法
export const api = {
  // 认证相关
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    check: () => apiClient.get('/auth/check')
  },
  
  // 用户相关
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data) => apiClient.put('/user/profile', data)
  },
  
  // 通用请求方法
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url)
}

// 日志中间件
export const logMiddleware = {
  info: (msg, data) => {
    console.log(`[INFO] ${msg}`, data || '')
  },
  warn: (msg, data) => {
    console.warn(`[WARN] ${msg}`, data || '')
  },
  error: (msg, data) => {
    console.error(`[ERROR] ${msg}`, data || '')
  }
}
