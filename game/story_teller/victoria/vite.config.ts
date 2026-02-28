import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // 只暴露 VITE_ 开头的变量，避免安全问题
  const filteredEnv = Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith('VITE_'))
  )
  return {
    define: {
      'process.env': filteredEnv
    },
    plugins: [react()],
    server: {
      proxy: {
        '/api-proxy': {
          target: 'https://ark.cn-beijing.volces.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        },
      },
    },
  }
})
