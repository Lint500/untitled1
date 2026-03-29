// 自己控制打包配置 - 完全透明
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },

  // 指定开发服务器的入口 HTML 文件
  appType: 'spa',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // 代码分割策略
    rollupOptions: {
      input: 'src/renderer/index.html',
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
  
  // 路径别名 - 从 src/renderer 为基准
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@modules': path.resolve(process.cwd(), 'src/modules'),
      '@hooks': path.resolve(process.cwd(), 'src/hooks'),
      '@services': path.resolve(process.cwd(), 'src/services'),
      '@store': path.resolve(process.cwd(), 'src/store'),
      '@components': path.resolve(process.cwd(), 'src/components'),
      '@assets': path.resolve(process.cwd(), 'src/assets'),
      '@router': path.resolve(process.cwd(), 'src/router'),
      '@middleware': path.resolve(process.cwd(), 'src/middleware')
    }
  },

  
  // CSS 配置
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },
  
  // 定义全局变量，避免 process is not defined 错误
  define: {
    'process.env': {},
    'process.platform': null,
    'process.version': null,
  },
  
  base: '/'
})
