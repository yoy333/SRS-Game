import { defineConfig } from 'vite';

// https://vitejs.dev/config/

export default ({ mode }) => {
  return defineConfig({
    envDir: '../',
    server: {
      proxy:{
        '/phaserAssets': 'http://localhost:8080',
        '/http' : 'https://localhost:8080'
      },
      hmr: {
        clientPort: 5173,
      },
    },
    publicDir:'assets',
    // build:{
    //   lib: {
    //     entry: 'game/main.ts',
    //     name: 'MyGame',
    //     formats: ['iife'],
    //     fileName: 'bundle'
    //   }
    // }
    //origin:'localhost:8080'
  });
};