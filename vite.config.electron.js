// Electron 主进程打包配置
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/main',
    lib: {
      entry: 'electron/app.ts',
      formats: ['cjs'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      external: ['electron']
    }
  }
})
