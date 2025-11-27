import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

function removeProtobufEval() {
  return {
    name: 'remove-protobuf-eval',
    transform(code: string, id: string) {
      if (id.includes('@protobufjs/inquire')) {
        const transformedCode = code.replace(/eval\s*\(.*/g, 'null; //');
        return {
          code: transformedCode,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    removeProtobufEval(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@protocols/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@protocols/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@protocols/cosmos-shared': path.resolve(__dirname, '../../packages/cosmos-shared/src'),
    },
  },
});
