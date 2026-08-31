import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/test/**', 'src/vite-env.d.ts'],
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      clean: true,
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
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
