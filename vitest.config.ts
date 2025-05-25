import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 60000, // 60 seconds timeout for long-running tests
  },
});