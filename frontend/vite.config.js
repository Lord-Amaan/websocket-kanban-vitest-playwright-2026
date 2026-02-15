import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',

    // Use correct setup file path
    setupFiles: './tests/setup.js',

    // ONLY run .test.jsx files
    include: ['tests/**/*.test.jsx'],

    // Ignore everything else
    exclude: ['node_modules', 'dist']
  }
})
