import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [react(), visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true,
    filename: 'bundle-analysis.html'
  })],
  optimizeDeps: {
    include: [
      '@mantine/core', 
      '@mantine/dates', 
      '@mantine/notifications'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-components': ['@mantine/core', '@mantine/hooks', '@mantine/dates', '@mantine/notifications'],
          'router': ['@tanstack/react-router'],
          'data-libs': ['@supabase/supabase-js', '@tanstack/react-table'],
          'date-utils': ['date-fns']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}) 