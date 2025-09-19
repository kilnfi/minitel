import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), ...tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@protocols/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@protocols/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '#/lib': path.resolve(__dirname, '../../packages/ui/src/lib'),
      '#/components': path.resolve(__dirname, '../../packages/ui/src/components'),
      '#/ui': path.resolve(__dirname, '../../packages/ui/src/components/ui'),
      '#/hooks': path.resolve(__dirname, '../../packages/ui/src/hooks'),
    },
  },
});
