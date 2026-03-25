import { contextBridge } from 'electron'

// 最小配置：不暴露任何 API
contextBridge.exposeInMainWorld('electronAPI', {})
