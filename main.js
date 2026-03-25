import pkg from 'electron';
const { app, BrowserWindow } = pkg;
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron', 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}

async function bootstrap() {
  if (isDev) {
    const server = await createServer({
      plugins: [react()],
      root: path.join(__dirname, 'src/renderer'),
      server: {
        port: 5173,
        host: true,
        open: false
      },
      base: './'
    })

    await server.listen()
    console.log('✅ Vite 服务已启动：http://localhost:5173/')
  }
  
  createWindow()

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}

app.whenReady().then(bootstrap)
