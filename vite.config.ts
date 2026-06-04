import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_BACKEND_ORIGIN || 'http://localhost:8000'
  const wsBackend = backend.replace(/^http/, 'ws')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@modules': path.resolve(__dirname, './src/modules'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@store': path.resolve(__dirname, './src/store'),
        '@services': path.resolve(__dirname, './src/services'),
      },
    },
    base: './',
    server: {
      port: 5173,
      // 同源代理：浏览器请求 /api/** → 转发到后端 8000，避免 CORS + 鉴权头丢失
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
        '/ws': {
          target: wsBackend,
          ws: true,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/ws/, ''),
        },
        '/sse': {
          target: backend,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/sse/, ''),
        },
      },
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
  }
})
