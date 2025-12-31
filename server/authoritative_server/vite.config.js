import { defineConfig } from 'vite';

// https://vitejs.dev/config/

export default ({ mode }) => {
  return defineConfig({
    envDir: '../',
    server: {
      hmr: {
        clientPort: 5174,
      }
    },
    build:{
      lib: {
        entry: 'ts/main.ts',
        name: 'MyGame',
        formats: ['iife'],
        fileName: 'bundle'
      }
    }
  });
};