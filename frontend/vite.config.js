import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // If deploying to GitHub Pages under a subdirectory, uncomment and update:
  // base: '/process_pdfs/',
  
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
