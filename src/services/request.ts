import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './backendConfig';

const API_KEY = import.meta.env.VITE_API_KEY || '';

/**
 * Axios 请求封装
 */
class Request {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 后端鉴权（与 SIMPLE_API_KEY 对齐）
        if (API_KEY) {
          config.headers['X-API-Key'] = API_KEY;
        }
        // 兼容已有 JWT 流程
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const body = response.data;
        // 后端统一信封：{success: true, data: ...} → 直接返回 data；
        // 失败信封：{success: false, error: {code, message}} → 抛错
        // 非信封响应（图片二进制等）原样返回
        if (body && typeof body === 'object' && 'success' in body) {
          if (body.success === false) {
            const code = body.error?.code || 'INTERNAL_ERROR';
            const msg = body.error?.message || '请求失败';
            const err = new Error(msg) as Error & { code?: string };
            err.code = code;
            return Promise.reject(err);
          }
          // success: true → 把 data 字段抽出来返回
          return 'data' in body ? body.data : body;
        }
        return body;
      },
      (error) => {
        if (error.response) {
          const errBody = error.response.data;
          const msg = errBody?.error?.message || errBody?.message || error.message;
          switch (error.response.status) {
            case 401:
              console.error('[API] 未授权，请检查 VITE_API_KEY 是否与后端 SIMPLE_API_KEY 一致');
              break;
            case 403:
              console.error('[API] 拒绝访问');
              break;
            case 404:
              console.error('[API] 资源不存在:', error.config?.url);
              break;
            case 429:
              console.warn('[API] 请求频率超限');
              break;
            case 500:
              console.error('[API] 服务器错误:', msg);
              break;
            default:
              console.error('[API]', msg);
          }
        } else {
          console.error('[API] 网络错误', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  /**
   * 上传文件
   */
  upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      },
    });
  }
}

export const request = new Request();
export default request;
