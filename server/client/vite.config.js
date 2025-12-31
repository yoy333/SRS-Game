import { defineConfig } from 'vite';

// https://vitejs.dev/config/

export default ({ mode }) => {
  return defineConfig({
    envDir: '../',
    server: {
      hmr: {
        clientPort: 5173,
      },
    },
    // build:{
    //   lib: {
    //     entry: 'game/main.ts',
    //     name: 'MyGame',
    //     formats: ['iife'],
    //     fileName: 'bundle'
    //   }
    // }
  });
};