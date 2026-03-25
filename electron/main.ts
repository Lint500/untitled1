import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null
let featurePopup: BrowserWindow | null = null

function createMainWindow() {
  const isDev = process.env.NODE_ENV === 'development'
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, isDev ? '../../out/preload/preload.js' : 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createFeaturePopup() {
  if (featurePopup) {
    featurePopup.focus()
    return
  }

  const isDev = process.env.NODE_ENV === 'development'

  featurePopup = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow || undefined,
    modal: false,
    show: false,
    frame: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, isDev ? '../../out/preload/preload.js' : 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (isDev) {
    featurePopup.loadURL('http://localhost:5173/feature-popup')
  } else {
    featurePopup.loadFile(path.join(__dirname, '../dist/renderer/index.html'), {
      hash: '/feature-popup'
    })
  }

  featurePopup.on('closed', () => {
    featurePopup = null
  })
}

app.whenReady().then(() => {
  createMainWindow()

  ipcMain.handle('auth:check', async () => {
    return { role: 'user', isDeveloper: false }
  })

  ipcMain.handle('window:createPopup', () => {
    createFeaturePopup()
  })

  ipcMain.handle('window:closePopup', () => {
    if (featurePopup) {
      featurePopup.close()
      featurePopup = null
    }
  })

  ipcMain.handle('log:send', async (_, data) => {
    console.log('[LOG]', data)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
