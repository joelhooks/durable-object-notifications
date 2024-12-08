/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'miniflare',
    environmentOptions: {
      modules: true,
      scriptPath: 'src/index.ts',
      bindings: {
        PREFERENCES: { className: 'PreferenceManager' }
      }
    }
  }
}); 