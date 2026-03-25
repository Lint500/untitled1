// 自己控制打包配置 - 完全透明
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  
  server: {
    port: 5173,
    host: true
  },
  
  build: {
    outDir: '../../dist/renderer',
    assetsDir: 'assets',
    
    // 代码分割策略
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'state-vendor': ['zustand']
        }
      }
    },
    
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 生产环境移除 console
        drop_debugger: true
      }
    },
    
    // Source map
    sourcemap: false,
    
    // 资源大小限制
    chunkSizeWarningLimit: 500
  },
  
  // 路径别名 - 自己控制
  resolve: {
    alias: {
      '@modules': path.resolve(__dirname, '../src/modules'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
      '@services': path.resolve(__dirname, '../src/services'),
      '@store': path.resolve(__dirname, '../src/store/index.js'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@assets': path.resolve(__dirname, '../src/assets'),
      '@router': path.resolve(__dirname, '../src/router'),
      '@middleware': path.resolve(__dirname, '../src/middleware')
    }
  },
  
  // CSS 配置
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },
  
  base: './'
})
