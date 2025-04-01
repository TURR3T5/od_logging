import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'bundle-analysis.html'
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-core': ['@mantine/core/styles.css'],
          'ui-components': ['@mantine/core'],
          'ui-hooks': ['@mantine/hooks'],
          'ui-dates': ['@mantine/dates'],
          'ui-notifications': ['@mantine/notifications'],
          'router': ['@tanstack/react-router'],
          'data-libs': ['@supabase/supabase-js', '@tanstack/react-table'],
          'date-utils': ['date-fns']
        }
      }
    }
  }
})