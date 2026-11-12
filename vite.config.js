import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` makes the production build use relative asset paths,
// so the built `dist/` folder can be opened directly from the file system
// (file://) as required for the ZIP deliverable.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
