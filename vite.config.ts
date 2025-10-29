import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_DEV_PORT) || 5123;

  return {
    plugins: [react(),
      {
        name: 'debug-resolve-alias',
        resolveId(source, importer) {
          if (source.startsWith('@components')) {
            console.log(`Resolving '${source}' from '${importer}'`)
          }
          return null // dejá que Vite siga resolviendo normalmente
        }
      }
    ],
    base: './',
    build: {
      outDir: 'dist-ui',
    },
    server: {
      port,
      strictPort: true,
    },
    preview: {
      port,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@common': path.resolve(__dirname, 'src/common'), 
        "@components": path.resolve(__dirname, 'src/ui/src/components'),
        "@hooks": path.resolve(__dirname, 'src/ui/src/hooks'),
        "@views": path.resolve(__dirname, 'src/ui/src/views'),
        "@stores": path.resolve(__dirname, 'src/ui/src/stores'),
        "@ipc": path.resolve(__dirname, 'src/ui/src/ipc'),
        "@utils": path.resolve(__dirname, 'src/ui/src/utils'),
        "@contexts": path.resolve(__dirname, 'src/ui/src/contexts'),
      },
    },
  };
});
