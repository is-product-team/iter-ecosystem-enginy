import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    alias: {
      '@iter/shared': path.resolve(__dirname, '../../shared/index.ts'),
    },
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
      JWT_SECRET: 'test_secret_key_minimum_length_10',
      NODE_ENV: 'test',
    },
  },
});
