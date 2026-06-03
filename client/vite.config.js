import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'
// https://vitejs.dev/config/

export default ({ mode }) => {
  return defineConfig({
    envDir: './',
    server: {
      proxy: {
        '/phaserAssets': 'http://localhost:8080',
        '/server': {
          target: 'http://localhost:2567',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/server/, '')
        }
      },
      hmr: {
        clientPort: 443,
        protocol: 'wss'
      },
      allowedHosts: true
    },
    publicDir: 'game/assets',
    plugins: [tsconfigPaths()],
    build: {
      sourcemap: true,
    }
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
