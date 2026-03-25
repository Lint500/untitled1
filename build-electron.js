// 自己控制 Electron 打包 - 完全透明
import { build } from 'vite'
import electronBuilder from 'electron-builder'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function buildElectron() {
  console.log('\n📦 打包 Electron 主进程...\n')
  
  // 1. 构建主进程
  await build({
    configFile: path.join(__dirname, 'vite.config.electron.js'),
    build: {
      outDir: 'dist/main',
      lib: {
        entry: 'electron/app.ts',
        formats: ['cjs'],
        fileName: () => 'main.js'
      }
    }
  })
  
  console.log('✅ 主进程打包完成')
  
  // 2. 构建 preload
  await build({
    configFile: path.join(__dirname, 'vite.config.preload.js'),
    build: {
      outDir: 'dist/preload',
      lib: {
        entry: 'electron/preload.ts',
        formats: ['cjs'],
        fileName: () => 'preload.js'
      }
    }
  })
  
  console.log('✅ Preload 打包完成')
  
  // 3. 使用 electron-builder 打包成应用
  await electronBuilder.build({
    config: {
      appId: 'com.electron.app',
      productName: 'Electron React App',
      directories: {
        output: 'release'
      },
      files: [
        'dist/**/*',
        'electron/**/*'
      ],
      mac: {
        category: 'public.app-category.productivity',
        target: ['dmg', 'zip']
      },
      win: {
        target: ['nsis', 'portable']
      },
      linux: {
        target: ['AppImage', 'deb']
      }
    }
  })
  
  console.log('✅ Electron 应用打包完成')
  console.log('📁 输出目录：', path.join(__dirname, 'release'))
}

buildElectron().catch(err => {
  console.error('❌ 打包失败:', err)
  process.exit(1)
})
