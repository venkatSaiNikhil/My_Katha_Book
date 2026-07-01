/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  // GitHub Pages project sites are served from /<repo>/, not /. The Capacitor build serves the
  // bundle from local app files instead, so it needs root-relative paths — use `build:capacitor`.
  base: command === 'build' && mode !== 'capacitor' ? '/My_Katha_Book/' : '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    exclude: ['node_modules/**', 'tests/e2e/**'],
  },
}))
