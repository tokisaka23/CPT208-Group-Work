import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    proxy: {
      // 本地开发时直接代理到 Vercel 服务
      '/api': {
        target: 'http://localhost:3000', // 指向 Vercel 服务
        changeOrigin: true,
        rewrite: (path) => path  // 保持路径不变
      }
    }
  }
})
