import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    alias: {
      '@iter/shared': path.resolve(__dirname, '../../shared/index.ts'),
    },
  },
});
