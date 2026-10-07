import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    include: /\.(js|jsx)$/,
    exclude: /node_modules/,
    lang: 'jsx',
    jsx: { runtime: 'automatic' },
  },
  test: {
    environment: 'jsdom',
    include: ['app/**/*.test.js'],
    setupFiles: ['./vitest.setup.js'],
    css: false,
  },
});
