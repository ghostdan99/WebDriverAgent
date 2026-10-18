/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssMinify: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: {modules: {classNameStrategy: 'non-scoped'}},
  },
});
