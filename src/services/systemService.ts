import request from './request';
import { API_URLS } from './api';
import { LogEntry } from '@store';

export interface SystemParams {
  [key: string]: any;
}

/**
 * 系统服务
 * 管理系统参数和日志
 */
export const systemService = {
  /**
   * 获取系统参数
   */
  getParams: async (): Promise<SystemParams> => {
    return request.get(API_URLS.SYSTEM_PARAMS);
  },

  /**
   * 设置系统参数
   */
  setParams: async (params: SystemParams): Promise<SystemParams> => {
    return request.put(API_URLS.SYSTEM_PARAMS, params);
  },

  /**
   * 获取单个参数
   */
  getParam: async (key: string): Promise<any> => {
    const params = await systemService.getParams();
    return params[key];
  },

  /**
   * 设置单个参数
   */
  setParam: async (key: string, value: any): Promise<SystemParams> => {
    const params = await systemService.getParams();
    params[key] = value;
    return systemService.setParams(params);
  },

  /**
   * 获取系统日志
   */
  getLogs: async (): Promise<LogEntry[]> => {
    return request.get(API_URLS.SYSTEM_LOGS);
  },

  /**
   * 导出日志
   */
  exportLogs: async (format: 'txt' | 'json' = 'txt'): Promise<Blob> => {
    return request.get(`${API_URLS.SYSTEM_LOGS}/export`, {
      responseType: 'blob',
      params: { format },
    });
  },

  /**
   * 清空日志
   */
  clearLogs: async (): Promise<void> => {
    return request.delete(API_URLS.SYSTEM_LOGS);
  },
};
