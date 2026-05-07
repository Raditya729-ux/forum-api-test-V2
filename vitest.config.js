import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    envFile: '.test.env',
    env: {
      NODE_ENV: 'test',
    },
    setupFiles: ['./tests/setup.js'],
    pool: 'forks',
    singleFork: true,
    fileParallelism: false,
  },
});