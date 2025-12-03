import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: process.env.ANALYZE === 'true',
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster cold starts
    include: [
      '@nextui-org/react',
      'recharts',
      'axios',
      'react-router-dom',
      'zustand',
      'framer-motion',
      'lucide-react',
    ],
    exclude: ['@vite/client'],
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments
      },
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 500,
    // Rollup options for bundle optimization
    rollupOptions: {
      output: {
        // Manual chunk strategy for better code splitting
        manualChunks: {
          // Core React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'vendor-ui': ['@nextui-org/react', 'framer-motion'],
          // Chart library (large)
          'vendor-charts': ['recharts'],
          // Utilities
          'vendor-utils': ['axios', 'zustand', 'lucide-react', 'date-fns'],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
    copyPublicDir: true,
  },
});
