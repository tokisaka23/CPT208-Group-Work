import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    proxy: {
      // 本地开发时固定代理到本地 API 服务，避免 localhost 在 Windows 下出现 IPv4/IPv6 解析不一致。
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
