import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler"],
        ],
      },
    }),,
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react/jsx-runtime'],
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/dates'],
          router: ['@tanstack/react-router']
        }
      }
    }
  }
});