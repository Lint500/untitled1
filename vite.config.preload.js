// Electron Preload 打包配置
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/preload',
    lib: {
      entry: 'electron/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js'
    },
    rollupOptions: {
      external: ['electron']
    }
  }
})
