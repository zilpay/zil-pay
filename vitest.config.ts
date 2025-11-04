import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: '__tests__/setupTests.ts',
    include: ['__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      'types/wallet': path.resolve(__dirname, 'types/wallet.d.ts'),
      'types/gas': path.resolve(__dirname, 'types/gas.d.ts'),
      'types/tx': path.resolve(__dirname, 'types/tx.d.ts'),
      'micro-eth-signer/core/rlp': path.resolve(
        __dirname,
        './node_modules/micro-eth-signer/core/rlp.js'
      ),
    }
  }
});
