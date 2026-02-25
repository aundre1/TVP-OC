import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    strictPort: true, // Fail if port is already in use
    host: true, // Expose to network (fixes some localhost issues)
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-state': ['zustand'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Use esbuild for minification (faster, default in Vite)
    minify: 'esbuild',
    // Generate source maps for production debugging
    sourcemap: false,
  },
});
