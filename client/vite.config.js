import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'
// https://vitejs.dev/config/

export default ({ mode }) => {
  return defineConfig({
    envDir: './',
    server: {
      proxy:{
        '/phaserAssets': 'http://localhost:8080',
        '/http' : 'https://localhost:8080'
      },
      hmr: {
        clientPort: 5173,
      },
      allowedHosts:true
    },
    publicDir:'game/assets',
    plugins: [tsconfigPaths()]
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