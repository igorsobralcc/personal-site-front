import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    proxy: {
      '/api/presentation': {
        target: 'https://localhost:7211',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/api/v1/presentation',
      },
    },
  },
})
