/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['test/setup.ts'],
  },
  plugins: [{
    name: 'sql',
    transform(code, id) {
      if (id.endsWith('.sql')) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: null
        }
      }
    }
  }]
}) 