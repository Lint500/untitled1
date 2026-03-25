import { BrowserWindow } from 'electron'

/**
 * 窗口管理服务
 * 负责创建、管理和销毁各种窗口
 */
export class WindowService {
  private windows: Map<string, BrowserWindow> = new Map()
  private mainWindow: BrowserWindow | null = null

  /**
   * 创建主窗口
   */
  createMainWindow(config: {
    width?: number
    height?: number
    url: string
  }): BrowserWindow {
    if (this.mainWindow) {
      this.mainWindow.focus()
      return this.mainWindow
    }

    const window = new BrowserWindow({
      width: config.width || 1200,
      height: config.height || 800,
      webPreferences: {
        preload: require.resolve('../preload'),
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    window.loadURL(config.url)
    
    window.on('closed', () => {
      this.mainWindow = null
      this.windows.delete('main')
    })

    this.mainWindow = window
    this.windows.set('main', window)

    return window
  }

  /**
   * 创建功能小窗口
   */
  createPopup(config: {
    id: string
    width?: number
    height?: number
    url: string
    parent?: BrowserWindow
    modal?: boolean
    show?: boolean
    frame?: boolean
    resizable?: boolean
  }): BrowserWindow | null {
    // 如果窗口已存在，直接聚焦
    const existingWindow = this.windows.get(config.id)
    if (existingWindow) {
      existingWindow.focus()
      return existingWindow
    }

    const parent = config.parent || this.mainWindow || undefined

    const window = new BrowserWindow({
      width: config.width || 400,
      height: config.height || 600,
      parent,
      modal: config.modal ?? false,
      show: config.show ?? false,
      frame: config.frame ?? true,
      resizable: config.resizable ?? false,
      webPreferences: {
        preload: require.resolve('../preload'),
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    window.loadURL(config.url)

    window.on('closed', () => {
      this.windows.delete(config.id)
    })

    this.windows.set(config.id, window)

    return window
  }

  /**
   * 获取窗口实例
   */
  getWindow(id: string): BrowserWindow | undefined {
    return this.windows.get(id)
  }

  /**
   * 关闭窗口
   */
  closeWindow(id: string): void {
    const window = this.windows.get(id)
    if (window) {
      window.close()
      this.windows.delete(id)
    }
  }

  /**
   * 关闭所有窗口
   */
  closeAll(): void {
    this.windows.forEach((window) => {
      window.close()
    })
    this.windows.clear()
    this.mainWindow = null
  }

  /**
   * 显示窗口
   */
  showWindow(id: string): void {
    const window = this.windows.get(id)
    if (window) {
      window.show()
      window.focus()
    }
  }

  /**
   * 隐藏窗口
   */
  hideWindow(id: string): void {
    const window = this.windows.get(id)
    if (window) {
      window.hide()
    }
  }

  /**
   * 获取主窗口
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }
}
