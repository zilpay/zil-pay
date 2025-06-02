import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: '__tests__/setupTests.ts',
    include: ['__tests__/**/*.test.{ts,tsx}'],
  },
});
