import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    minify: true,
    sourcemap: true, // Enable source maps for debugging
    assetsDir: 'assets',
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
