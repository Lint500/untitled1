// 真正的启动入口 - 你掌控一切！
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function start() {
  console.log('\n🚀 启动应用...\n')
  
  // 1. 启动 Vite 开发服务器
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
  console.log('📁 根目录：', path.join(__dirname, 'src/renderer'))
  console.log()

  // 2. 等待 Vite 准备好后启动 Electron
  setTimeout(() => {
    console.log('⚡ 启动 Electron...')
    
    const electron = spawn('electron', ['.'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    })

    electron.on('close', (code) => {
      console.log('\n👋 Electron 已退出，代码:', code)
      process.exit(code)
    })
  }, 1000)
}

start().catch(err => {
  console.error('❌ 启动失败:', err)
  process.exit(1)
})
